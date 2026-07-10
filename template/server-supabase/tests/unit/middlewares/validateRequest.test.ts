import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validateRequest, validateBody } from '../../../src/middlewares/validateRequest';

describe('validateRequest', () => {
  const createMockResponse = (): Response => {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  };

  it('should validate body and replace req.body', async () => {
    const schema = { body: z.object({ email: z.string().email() }) };
    const middleware = validateRequest(schema);

    const req = { body: { email: 'test@example.com' } } as Request;
    const res = createMockResponse();
    const next = vi.fn() as NextFunction;

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.body).toEqual({ email: 'test@example.com' });
  });

  it('should validate query and replace req.query', async () => {
    const schema = { query: z.object({ page: z.string() }) };
    const middleware = validateRequest(schema);

    const req = { query: { page: '1' } } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as NextFunction;

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.query).toEqual({ page: '1' });
  });

  it('should validate params and replace req.params', async () => {
    const schema = { params: z.object({ id: z.string().uuid() }) };
    const middleware = validateRequest(schema);

    const req = { params: { id: '550e8400-e29b-41d4-a716-446655440000' } } as unknown as Request;
    const res = createMockResponse();
    const next = vi.fn() as NextFunction;

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.params).toEqual({ id: '550e8400-e29b-41d4-a716-446655440000' });
  });

  it('should call next with error on invalid body', async () => {
    const schema = { body: z.object({ email: z.string().email() }) };
    const middleware = validateRequest(schema);

    const req = { body: { email: 'invalid' } } as Request;
    const res = createMockResponse();
    const next = vi.fn() as NextFunction;

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(z.ZodError));
  });
});

describe('validateBody', () => {
  const createMockResponse = (): Response => {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  };

  it('is a convenience wrapper for validateRequest with body schema', async () => {
    const schema = z.object({ name: z.string() });
    const middleware = validateBody(schema);

    const req = { body: { name: 'Test' } } as Request;
    const res = createMockResponse();
    const next = vi.fn() as NextFunction;

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });
});
