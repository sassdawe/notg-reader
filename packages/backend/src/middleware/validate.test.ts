import { describe, it, expect, vi } from 'vitest';
import { validate } from './validate.js';
import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';

describe('validate middleware', () => {
  const schema = z.object({
    name: z.string().min(1),
    age: z.number().int().positive(),
  });

  it('should pass valid data through', () => {
    const req = { body: { name: 'test', age: 25 } } as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
    const next = vi.fn() as NextFunction;

    validate(schema)(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.body).toEqual({ name: 'test', age: 25 });
  });

  it('should reject invalid data with 400', () => {
    const req = { body: { name: '', age: -1 } } as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
    const next = vi.fn() as NextFunction;

    validate(schema)(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Validation error' }));
  });

  it('should reject missing required fields', () => {
    const req = { body: {} } as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
    const next = vi.fn() as NextFunction;

    validate(schema)(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
