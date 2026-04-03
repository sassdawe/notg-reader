import { describe, it, expect, vi } from 'vitest';
import { errorHandler, AppError } from './errorHandler.js';
import { ZodError } from 'zod';
import type { Request, Response, NextFunction } from 'express';

describe('errorHandler', () => {
  const mockRes = () => {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    return res;
  };

  it('should handle AppError with correct status code', () => {
    const err = new AppError(404, 'Not found');
    const res = mockRes();
    errorHandler(err, {} as Request, res, vi.fn() as NextFunction);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Not found' });
  });

  it('should handle ZodError with 400', () => {
    const err = new ZodError([{
      code: 'invalid_type',
      expected: 'string',
      received: 'number',
      path: ['name'],
      message: 'Expected string',
    }]);
    const res = mockRes();
    errorHandler(err, {} as Request, res, vi.fn() as NextFunction);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should handle unknown errors with 500', () => {
    const err = new Error('Something broke');
    const res = mockRes();
    errorHandler(err, {} as Request, res, vi.fn() as NextFunction);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });
});
