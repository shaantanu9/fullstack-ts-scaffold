import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../../../src/utils/asyncHandler';

describe('asyncHandler', () => {
  const createMockRequest = (): Request => ({}) as Request;
  const createMockResponse = (): Response => ({}) as Response;
  const createMockNext = (): NextFunction => vi.fn();

  it('should call next with an error when the handler rejects', async () => {
    const error = new Error('Async error');
    const handler = asyncHandler(async (_req, _res, _next) => {
      throw error;
    });

    const req = createMockRequest();
    const res = createMockResponse();
    const next = createMockNext();

    handler(req, res, next);

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(next).toHaveBeenCalledWith(error);
  });

  it('should not call next when the handler resolves', async () => {
    const handler = asyncHandler(async (_req, _res, _next) => {
      // success
    });

    const req = createMockRequest();
    const res = createMockResponse();
    const next = createMockNext();

    handler(req, res, next);

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(next).not.toHaveBeenCalled();
  });

  it('should pass request, response, and next to the handler', async () => {
    const handlerFn = vi.fn().mockResolvedValue(undefined);
    const handler = asyncHandler(handlerFn as unknown as Parameters<typeof asyncHandler>[0]);

    const req = createMockRequest();
    const res = createMockResponse();
    const next = createMockNext();

    handler(req, res, next);

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(handlerFn).toHaveBeenCalledWith(req, res, next);
  });
});
