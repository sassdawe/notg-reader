import { describe, it, expect, beforeAll } from 'vitest';
import { createToken, verifyToken } from './jwt.js';

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret-key-for-testing-only-do-not-use-in-production';
});

describe('JWT', () => {
  it('should create and verify a token', async () => {
    const payload = { userId: 'user-123', username: 'testuser' };
    const token = await createToken(payload);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);

    const verified = await verifyToken(token);
    expect(verified.userId).toBe('user-123');
    expect(verified.username).toBe('testuser');
  });

  it('should reject an invalid token', async () => {
    await expect(verifyToken('invalid.token.here')).rejects.toThrow();
  });

  it('should reject a tampered token', async () => {
    const token = await createToken({ userId: 'user-1', username: 'test' });
    const tampered = token.slice(0, -5) + 'xxxxx';
    await expect(verifyToken(tampered)).rejects.toThrow();
  });
});
