import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';
import { MESSAGES } from '../constants/messages';
import { audit, AuditEvent } from '../utils/audit';

export const authMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(ApiError.unauthorized(MESSAGES.UNAUTHORIZED));
    return;
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch {
    next(ApiError.unauthorized(MESSAGES.INVALID_TOKEN));
  }
};

export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(ApiError.unauthorized(MESSAGES.UNAUTHORIZED));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      audit(AuditEvent.AUTHZ_DENIED, {
        actorId: req.user.userId,
        ip: req.ip,
        requestId: req.id,
        route: req.originalUrl,
        outcome: 'failure',
      });
      next(ApiError.forbidden(MESSAGES.FORBIDDEN));
      return;
    }

    next();
  };
};
