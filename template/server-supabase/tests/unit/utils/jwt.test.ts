import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  TokenPayload,
} from '../../../src/utils/jwt';
import { appConfig } from '../../../src/config/app.config';

describe('JWT utils', () => {
  const payload: TokenPayload = {
    userId: '550e8400-e29b-41d4-a716-446655440000',
    email: 'test@example.com',
    role: 'USER',
  };

  describe('generateAccessToken', () => {
    it('should generate a valid JWT access token', () => {
      const token = generateAccessToken(payload);
      const decoded = jwt.verify(token, appConfig.auth.accessTokenSecret) as TokenPayload;

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    it('should include an expiry claim', () => {
      const token = generateAccessToken(payload);
      const decoded = jwt.decode(token) as { exp: number };

      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid JWT refresh token', () => {
      const token = generateRefreshToken(payload);
      const decoded = jwt.verify(token, appConfig.auth.refreshTokenSecret) as TokenPayload;

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid access token', () => {
      const token = generateAccessToken(payload);
      const decoded = verifyAccessToken(token);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    it('should throw for an invalid access token', () => {
      expect(() => verifyAccessToken('invalid-token')).toThrow();
    });

    it('should throw for a token signed with the wrong secret', () => {
      const token = jwt.sign(payload, 'wrong-secret-32-chars-long-abc');
      expect(() => verifyAccessToken(token)).toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', () => {
      const token = generateRefreshToken(payload);
      const decoded = verifyRefreshToken(token);

      expect(decoded.userId).toBe(payload.userId);
    });

    it('should throw for an invalid refresh token', () => {
      expect(() => verifyRefreshToken('invalid-token')).toThrow();
    });
  });
});
