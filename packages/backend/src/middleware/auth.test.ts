import { describe, it, expect, vi, beforeAll } from 'vitest';
import { requireAuth, type AuthenticatedRequest } from './auth.js';
import { createToken } from '../utils/jwt.js';
import type { Response, NextFunction } from 'express';

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret-key-for-testing-only-do-not-use-in-production';
});

describe('requireAuth middleware', () => {
  const mockRes = () => {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    return res;
  };

  it('should reject requests without token', async () => {
    const req = { cookies: {}, headers: {} } as AuthenticatedRequest;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    await requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should accept valid token from cookie', async () => {
    const token = await createToken({ userId: 'user-1', username: 'test' });
    const req = { cookies: { token }, headers: {} } as AuthenticatedRequest;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    await requireAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user?.userId).toBe('user-1');
  });

  it('should accept valid token from Authorization header', async () => {
    const token = await createToken({ userId: 'user-2', username: 'test2' });
    const req = {
      cookies: {},
      headers: { authorization: `Bearer ${token}` },
    } as AuthenticatedRequest;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    await requireAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user?.userId).toBe('user-2');
  });

  it('should reject invalid token', async () => {
    const req = { cookies: { token: 'invalid' }, headers: {} } as AuthenticatedRequest;
    const res = mockRes();
    const next = vi.fn() as NextFunction;

    await requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
