import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return new TextEncoder().encode(secret);
};

export interface TokenPayload extends JWTPayload {
  userId: string;
  username: string;
}

export async function createToken(payload: { userId: string; username: string }): Promise<string> {
  return new SignJWT({ userId: payload.userId, username: payload.username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, getSecret());
  return payload as TokenPayload;
}
