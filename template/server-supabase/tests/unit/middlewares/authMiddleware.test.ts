import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { authMiddleware, requireRole } from '../../../src/middlewares/authMiddleware';
import { generateAccessToken } from '../../../src/utils/jwt';
import { MESSAGES } from '../../../src/constants/messages';
import { ApiError } from '../../../src/utils/ApiError';
import { HTTP_STATUS } from '../../../src/constants/httpStatus';

describe('authMiddleware', () => {
  const createMockResponse = (): Response => {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  };

  it('should attach user to request with valid token', () => {
    const token = generateAccessToken({
      userId: '550e8400-e29b-41d4-a716-446655440000',
      email: 'test@example.com',
      role: 'USER',
    });

    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as Request;
    const res = createMockResponse();
    const next = vi.fn() as NextFunction;

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({
      userId: '550e8400-e29b-41d4-a716-446655440000',
      email: 'test@example.com',
      role: 'USER',
    });
  });

  it('should call next with unauthorized error when no authorization header', () => {
    const req = { headers: {} } as Request;
    const res = createMockResponse();
    const next = vi.fn() as NextFunction;

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    const error = (next as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0] as ApiError;
    expect(error.statusCode).toBe(HTTP_STATUS.UNAUTHORIZED);
    expect(error.message).toBe(MESSAGES.UNAUTHORIZED);
  });

  it('should call next with unauthorized error for malformed header', () => {
    const req = { headers: { authorization: 'Basic token' } } as Request;
    const res = createMockResponse();
    const next = vi.fn() as NextFunction;

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
  });

  it('should call next with unauthorized error for invalid token', () => {
    const req = { headers: { authorization: 'Bearer invalid-token' } } as Request;
    const res = createMockResponse();
    const next = vi.fn() as NextFunction;

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
  });
});

describe('requireRole', () => {
  const createMockResponse = (): Response => {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  };

  it('should allow access for users with allowed role', () => {
    const req = { user: { role: 'ADMIN', userId: '1', email: 'a@b.com' } } as Request;
    const res = createMockResponse();
    const next = vi.fn() as NextFunction;

    requireRole('ADMIN')(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('should reject access for users without allowed role', () => {
    const req = { user: { role: 'USER', userId: '1', email: 'a@b.com' } } as Request;
    const res = createMockResponse();
    const next = vi.fn() as NextFunction;

    requireRole('ADMIN')(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    const error = (next as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0] as ApiError;
    expect(error.statusCode).toBe(HTTP_STATUS.FORBIDDEN);
    expect(error.message).toBe(MESSAGES.FORBIDDEN);
  });

  it('should reject access when user is not attached', () => {
    const req = {} as Request;
    const res = createMockResponse();
    const next = vi.fn() as NextFunction;

    requireRole('ADMIN')(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    const error = (next as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0] as ApiError;
    expect(error.statusCode).toBe(HTTP_STATUS.UNAUTHORIZED);
  });
});
