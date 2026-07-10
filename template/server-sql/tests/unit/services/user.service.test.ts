import { describe, it, expect } from 'vitest';
import * as userService from '../../../src/services/user.service';
import * as authService from '../../../src/services/auth.service';
import { userRepository } from '../../../src/database/repositories';
import { ApiError } from '../../../src/utils/ApiError';
import { HTTP_STATUS } from '../../../src/constants/httpStatus';
import { MESSAGES } from '../../../src/constants/messages';

describe('user.service', () => {
  const createUser = async (email: string, role: string = 'USER') => {
    const result = await authService.register({
      email,
      password: 'SecureP@ssw0rd1',
      name: 'Test User',
    });
    if (role !== 'USER') {
      await userRepository.update(result.user.id, { role: role as 'USER' | 'ADMIN' | 'MODERATOR' });
    }
    return result.user;
  };

  describe('findAllUsers', () => {
    it('should return paginated users with default options', async () => {
      await createUser('paginated-1@example.com');
      await createUser('paginated-2@example.com');

      const result = await userService.findAllUsers({});

      expect(result.data.length).toBeGreaterThanOrEqual(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.total).toBeGreaterThanOrEqual(2);
      expect(result.meta.totalPages).toBeGreaterThanOrEqual(1);
    });

    it('should respect page and limit query params', async () => {
      await createUser('limit-1@example.com');
      await createUser('limit-2@example.com');

      const result = await userService.findAllUsers({ page: '1', limit: '1' });

      expect(result.data.length).toBe(1);
      expect(result.meta.limit).toBe(1);
      expect(result.meta.totalPages).toBeGreaterThanOrEqual(2);
    });

    it('should cap limit at MAX_LIMIT', async () => {
      const result = await userService.findAllUsers({ limit: '200' });
      expect(result.meta.limit).toBe(100);
    });
  });

  describe('findUserById', () => {
    it('should return a user by id', async () => {
      const user = await createUser('find-by-id@example.com');

      const result = await userService.findUserById(user.id);

      expect(result.id).toBe(user.id);
      expect(result.email).toBe(user.email);
    });

    it('should throw not found for non-existent id', async () => {
      await expect(
        userService.findUserById('550e8400-e29b-41d4-a716-446655440000'),
      ).rejects.toThrow(ApiError);

      try {
        await userService.findUserById('550e8400-e29b-41d4-a716-446655440000');
      } catch (error) {
        const apiError = error as ApiError;
        expect(apiError.statusCode).toBe(HTTP_STATUS.NOT_FOUND);
        expect(apiError.message).toBe(MESSAGES.USER_NOT_FOUND);
      }
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const user = await createUser('update@example.com');

      const result = await userService.updateUser(user.id, { name: 'Updated Name' });

      expect(result.name).toBe('Updated Name');
    });

    it('should throw not found for non-existent user', async () => {
      await expect(
        userService.updateUser('550e8400-e29b-41d4-a716-446655440000', { name: 'New' }),
      ).rejects.toThrow(ApiError);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const user = await createUser('delete@example.com');

      await userService.deleteUser(user.id);

      await expect(userService.findUserById(user.id)).rejects.toThrow(ApiError);
    });
  });
});
