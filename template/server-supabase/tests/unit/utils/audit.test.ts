import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/utils/logger', () => ({
  default: {
    info: vi.fn(),
  },
}));

import logger from '../../../src/utils/logger';
import { audit, AuditEvent } from '../../../src/utils/audit';

const infoMock = logger.info as unknown as ReturnType<typeof vi.fn>;

describe('audit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('logs a structured audit line via the logger', () => {
    audit(AuditEvent.AUTH_LOGIN_SUCCESS, {
      actorId: 'user-1',
      ip: '127.0.0.1',
      requestId: 'req-1',
      outcome: 'success',
    });

    expect(infoMock).toHaveBeenCalledTimes(1);
    expect(infoMock).toHaveBeenCalledWith(
      'audit',
      expect.objectContaining({
        audit: true,
        event: 'AUTH_LOGIN_SUCCESS',
        actorId: 'user-1',
        ip: '127.0.0.1',
        requestId: 'req-1',
        outcome: 'success',
      }),
    );
  });

  it('includes an ISO timestamp and defaults meta to empty', () => {
    audit(AuditEvent.AUTH_LOGOUT);

    const call = infoMock.mock.calls[0];
    expect(call[0]).toBe('audit');
    expect(call[1]).toMatchObject({ audit: true, event: 'AUTH_LOGOUT' });
    expect(typeof call[1].timestamp).toBe('string');
    expect(new Date(call[1].timestamp).toString()).not.toBe('Invalid Date');
  });

  it('passes through arbitrary extra metadata fields', () => {
    audit(AuditEvent.AUTHZ_DENIED, { route: '/admin', outcome: 'failure' });

    expect(infoMock).toHaveBeenCalledWith(
      'audit',
      expect.objectContaining({ event: 'AUTHZ_DENIED', route: '/admin', outcome: 'failure' }),
    );
  });

  it('exposes every audit event type', () => {
    expect(AuditEvent).toEqual({
      AUTH_LOGIN_SUCCESS: 'AUTH_LOGIN_SUCCESS',
      AUTH_LOGIN_FAILURE: 'AUTH_LOGIN_FAILURE',
      AUTH_REGISTER: 'AUTH_REGISTER',
      AUTH_LOGOUT: 'AUTH_LOGOUT',
      AUTH_TOKEN_REFRESH: 'AUTH_TOKEN_REFRESH',
      AUTHZ_DENIED: 'AUTHZ_DENIED',
      USER_UPDATED: 'USER_UPDATED',
      USER_DELETED: 'USER_DELETED',
    });
  });
});
