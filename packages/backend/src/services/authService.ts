import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type VerifiedRegistrationResponse,
  type VerifiedAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/server';
import { getDb } from '../utils/db.js';
import { createToken } from '../utils/jwt.js';
import { encrypt } from '../utils/encryption.js';

import { AppError } from '../middleware/errorHandler.js';

function getCodespacesOrigin(): string | undefined {
  const codespaceName = process.env.CODESPACE_NAME;
  if (codespaceName) {
    const domain = process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN || 'app.github.dev';
    return `https://${codespaceName}-3000.${domain}`;
  }
  return undefined;
}

function getCodespacesRpId(): string | undefined {
  const codespaceName = process.env.CODESPACE_NAME;
  if (codespaceName) {
    const domain = process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN || 'app.github.dev';
    return `${codespaceName}-3000.${domain}`;
  }
  return undefined;
}

const rpID = () => process.env.RP_ID || getCodespacesRpId() || 'localhost';
const rpName = () => process.env.RP_NAME || 'notg-reader';
const rpOrigin = () => process.env.RP_ORIGIN || getCodespacesOrigin() || 'http://localhost:3000';

export async function startRegistration(username: string) {
  const db = getDb();

  // Check if user exists
  const existingUser = await db.user.findUnique({
    where: { username },
    include: { authenticators: true },
  });

  let user;
  if (existingUser) {
    if (existingUser.authenticators.length > 0) {
      // Fully registered user — cannot re-register
      throw new AppError(409, 'Username already taken');
    }
    // Incomplete registration (no authenticator stored) — clean up and reuse
    await db.authChallenge.deleteMany({ where: { userId: existingUser.id } });
    user = existingUser;
  } else {
    // Create new user
    user = await db.user.create({
      data: { username },
    });
  }

  const existingAuthenticators = await db.authenticator.findMany({
    where: { userId: user.id },
  });

  const options = await generateRegistrationOptions({
    rpName: rpName(),
    rpID: rpID(),
    userName: username,
    attestationType: 'none',
    excludeCredentials: existingAuthenticators.map((auth) => ({
      id: auth.credentialId,
      transports: auth.transports
        ? (JSON.parse(auth.transports) as AuthenticatorTransport[])
        : undefined,
    })),
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
    },
  });

  // Store challenge
  await db.authChallenge.create({
    data: {
      challenge: options.challenge,
      userId: user.id,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    },
  });

  return { options, userId: user.id };
}

export async function finishRegistration(
  userId: string,
  response: RegistrationResponseJSON,
) {
  const db = getDb();

  const challenge = await db.authChallenge.findFirst({
    where: {
      userId,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!challenge) {
    throw new Error('Challenge expired or not found');
  }

  let verification: VerifiedRegistrationResponse;
  try {
    verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: challenge.challenge,
      expectedOrigin: rpOrigin(),
      expectedRPID: rpID(),
    });
  } catch {
    throw new Error('Registration verification failed');
  }

  if (!verification.verified || !verification.registrationInfo) {
    throw new Error('Registration verification failed');
  }

  const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;

  // Store authenticator
  await db.authenticator.create({
    data: {
      credentialId: credential.id,
      credentialPublicKey: Buffer.from(credential.publicKey).toString('base64'),
      counter: credential.counter,
      credentialDeviceType,
      credentialBackedUp,
      transports: response.response.transports
        ? JSON.stringify(response.response.transports)
        : null,
      userId,
    },
  });

  // Clean up challenge
  await db.authChallenge.deleteMany({ where: { userId } });

  // Create default settings
  await db.userSettings.create({
    data: { userId },
  });

  const user = await db.user.findUnique({ where: { id: userId } });
  const token = await createToken({ userId, username: user!.username });

  return { verified: true, token };
}

export async function startAuthentication(username: string) {
  const db = getDb();

  const user = await db.user.findUnique({
    where: { username },
    include: { authenticators: true },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const options = await generateAuthenticationOptions({
    rpID: rpID(),
    allowCredentials: user.authenticators.map((auth) => ({
      id: auth.credentialId,
      transports: auth.transports
        ? (JSON.parse(auth.transports) as AuthenticatorTransport[])
        : undefined,
    })),
    userVerification: 'preferred',
  });

  await db.authChallenge.create({
    data: {
      challenge: options.challenge,
      userId: user.id,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    },
  });

  return { options, userId: user.id };
}

export async function finishAuthentication(
  userId: string,
  response: AuthenticationResponseJSON,
) {
  const db = getDb();

  const challenge = await db.authChallenge.findFirst({
    where: {
      userId,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!challenge) {
    throw new Error('Challenge expired or not found');
  }

  const authenticator = await db.authenticator.findUnique({
    where: { credentialId: response.id },
  });

  if (!authenticator || authenticator.userId !== userId) {
    throw new Error('Authenticator not found');
  }

  let verification: VerifiedAuthenticationResponse;
  try {
    verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: challenge.challenge,
      expectedOrigin: rpOrigin(),
      expectedRPID: rpID(),
      credential: {
        id: authenticator.credentialId,
        publicKey: Buffer.from(authenticator.credentialPublicKey, 'base64'),
        counter: Number(authenticator.counter),
        transports: authenticator.transports
          ? (JSON.parse(authenticator.transports) as AuthenticatorTransport[])
          : undefined,
      },
    });
  } catch {
    throw new Error('Authentication verification failed');
  }

  if (!verification.verified) {
    throw new Error('Authentication verification failed');
  }

  // Update counter
  await db.authenticator.update({
    where: { id: authenticator.id },
    data: { counter: verification.authenticationInfo.newCounter },
  });

  // Clean up challenges
  await db.authChallenge.deleteMany({ where: { userId } });

  const user = await db.user.findUnique({ where: { id: userId } });
  const token = await createToken({ userId, username: user!.username });

  return { verified: true, token };
}

export async function updateProfile(
  userId: string,
  data: { displayName?: string; email?: string },
) {
  const db = getDb();
  const updateData: Record<string, string> = {};

  if (data.displayName !== undefined) {
    updateData.displayName = data.displayName;
  }
  if (data.email !== undefined) {
    updateData.encryptedEmail = encrypt(data.email);
  }

  return db.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      username: true,
      displayName: true,
      createdAt: true,
    },
  });
}
