import { describe, it, expect, vi, Mock } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { errorHandler } from '../../../src/middlewares/errorHandler';
import { ApiError } from '../../../src/utils/ApiError';
import { HTTP_STATUS } from '../../../src/constants/httpStatus';
import { MESSAGES } from '../../../src/constants/messages';

vi.mock('../../../src/utils/logger', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    http: vi.fn(),
  },
}));

describe('errorHandler', () => {
  const createMockResponse = (): Response & { status: Mock; json: Mock } => {
    const res = {} as Response & { status: Mock; json: Mock };
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  };

  it('should handle ApiError with correct status and message', () => {
    const err = ApiError.notFound(MESSAGES.USER_NOT_FOUND);
    const req = {} as Request;
    const res = createMockResponse();
    const next = vi.fn() as NextFunction;

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: MESSAGES.USER_NOT_FOUND,
      }),
    );
  });

  it('should handle ZodError with validation message and errors', () => {
    const err = z.object({ email: z.string().email() }).safeParse({ email: 'bad' });
    if (err.success) {
      throw new Error('Expected parse to fail');
    }

    const req = {} as Request;
    const res = createMockResponse();
    const next = vi.fn() as NextFunction;

    errorHandler(err.error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.UNPROCESSABLE_ENTITY);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: MESSAGES.VALIDATION_ERROR,
        errors: expect.any(Object),
      }),
    );
  });

  it('should handle SyntaxError with bad request', () => {
    const err = new SyntaxError('Unexpected token');
    const req = {} as Request;
    const res = createMockResponse();
    const next = vi.fn() as NextFunction;

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: MESSAGES.BAD_REQUEST,
      }),
    );
  });

  it('should handle unknown errors as internal server errors', () => {
    const err = new Error('Unexpected crash');
    const req = {} as Request;
    const res = createMockResponse();
    const next = vi.fn() as NextFunction;

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: MESSAGES.INTERNAL_SERVER_ERROR,
      }),
    );
  });
});
