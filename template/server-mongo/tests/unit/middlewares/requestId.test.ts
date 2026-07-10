import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { requestId } from '../../../src/middlewares/requestId';

describe('requestId', () => {
  const createMockResponse = (): { res: Response; setHeader: ReturnType<typeof vi.fn> } => {
    const setHeader = vi.fn();
    const res = { setHeader } as unknown as Response;
    return { res, setHeader };
  };

  it('generates a request id, assigns it to req.id and the response header', () => {
    const req = { headers: {} } as Request;
    const { res, setHeader } = createMockResponse();
    const next = vi.fn() as NextFunction;

    requestId(req, res, next);

    expect(typeof req.id).toBe('string');
    expect((req.id as string).length).toBeGreaterThan(0);
    expect(setHeader).toHaveBeenCalledWith('x-request-id', req.id);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('reuses an incoming x-request-id header value', () => {
    const incoming = 'incoming-request-id-123';
    const req = { headers: { 'x-request-id': incoming } } as unknown as Request;
    const { res, setHeader } = createMockResponse();
    const next = vi.fn() as NextFunction;

    requestId(req, res, next);

    expect(req.id).toBe(incoming);
    expect(setHeader).toHaveBeenCalledWith('x-request-id', incoming);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('generates a fresh id when the incoming header is empty', () => {
    const req = { headers: { 'x-request-id': '' } } as unknown as Request;
    const { res } = createMockResponse();
    const next = vi.fn() as NextFunction;

    requestId(req, res, next);

    expect(typeof req.id).toBe('string');
    expect(req.id).not.toBe('');
  });
});
