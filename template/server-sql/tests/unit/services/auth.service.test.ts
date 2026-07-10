import { describe, it, expect } from 'vitest';
import * as authService from '../../../src/services/auth.service';
import { userRepository } from '../../../src/database/repositories';
import { redis } from '../../../src/database/redis';
import { ApiError } from '../../../src/utils/ApiError';
import { HTTP_STATUS } from '../../../src/constants/httpStatus';
import { MESSAGES } from '../../../src/constants/messages';

describe('auth.service', () => {
  const validUser = {
    email: 'auth-service@example.com',
    password: 'SecureP@ssw0rd1',
    name: 'Auth Service User',
  };

  describe('register', () => {
    it('should register a new user and return tokens', async () => {
      const result = await authService.register(validUser);

      expect(result.user.email).toBe(validUser.email);
      expect(result.user.name).toBe(validUser.name);
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
    });

    it('should throw conflict when email already exists', async () => {
      await authService.register({ ...validUser, email: 'duplicate@example.com' });

      await expect(
        authService.register({ ...validUser, email: 'duplicate@example.com' }),
      ).rejects.toThrow(ApiError);

      try {
        await authService.register({ ...validUser, email: 'duplicate@example.com' });
      } catch (error) {
        const apiError = error as ApiError;
        expect(apiError.statusCode).toBe(HTTP_STATUS.CONFLICT);
        expect(apiError.message).toBe(MESSAGES.EMAIL_ALREADY_EXISTS);
      }
    });
  });

  describe('login', () => {
    it('should login a registered user', async () => {
      await authService.register(validUser);

      const result = await authService.login({
        email: validUser.email,
        password: validUser.password,
      });

      expect(result.user.email).toBe(validUser.email);
      expect(result.tokens.accessToken).toBeDefined();
    });

    it('should throw unauthorized for invalid email', async () => {
      await expect(
        authService.login({ email: 'missing@example.com', password: 'password' }),
      ).rejects.toThrow(ApiError);
    });

    it('should throw unauthorized for invalid password', async () => {
      await authService.register(validUser);

      await expect(
        authService.login({ email: validUser.email, password: 'wrongpassword' }),
      ).rejects.toThrow(ApiError);
    });

    it('should throw unauthorized for inactive user', async () => {
      const registered = await authService.register({
        ...validUser,
        email: 'inactive@example.com',
      });
      await userRepository.update(registered.user.id, { isActive: false });

      await expect(
        authService.login({ email: 'inactive@example.com', password: validUser.password }),
      ).rejects.toThrow(ApiError);
    });
  });

  describe('refreshAccessToken', () => {
    it('should issue a new access token with a valid refresh token', async () => {
      const registered = await authService.register({
        ...validUser,
        email: 'refresh@example.com',
      });

      const result = await authService.refreshAccessToken({
        refreshToken: registered.tokens.refreshToken,
      });

      expect(result.accessToken).toBeDefined();
    });

    it('should throw unauthorized for an invalid refresh token', async () => {
      await expect(
        authService.refreshAccessToken({ refreshToken: 'invalid-token' }),
      ).rejects.toThrow(ApiError);
    });

    it('should throw unauthorized when refresh token is not in Redis', async () => {
      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoiVVNFUiIsImlhdCI6MTcwNDA2MDgwMCwiZXhwIjo5OTk5OTk5OTk5fQ.invalid-signature';

      await expect(authService.refreshAccessToken({ refreshToken: token })).rejects.toThrow(
        ApiError,
      );
    });
  });

  describe('logout', () => {
    it('should remove the refresh token from Redis', async () => {
      const registered = await authService.register({
        ...validUser,
        email: 'logout@example.com',
      });

      const keysBefore = await redis.keys(`refresh_token:${registered.user.id}:*`);
      expect(keysBefore.length).toBe(1);

      await authService.logout(registered.user.id, registered.tokens.refreshToken);

      const keysAfter = await redis.keys(`refresh_token:${registered.user.id}:*`);
      expect(keysAfter.length).toBe(0);
    });

    it('should do nothing when refresh token is not provided', async () => {
      await expect(authService.logout('some-user-id', undefined)).resolves.toBeUndefined();
    });
  });
});
