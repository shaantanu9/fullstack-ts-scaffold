import { describe, it, expect } from 'vitest';
import { userRepository } from '../../../src/database/repositories';
import { hashPassword } from '../../../src/utils/password';

describe('SupabaseUserRepository', () => {
  const createTestUser = async (email: string) => {
    return userRepository.create({
      email,
      password: await hashPassword('SecureP@ssw0rd1'),
      name: 'Repository Test',
    });
  };

  describe('create', () => {
    it('should create a user with hashed password', async () => {
      const user = await createTestUser('repo-create@example.com');

      expect(user.email).toBe('repo-create@example.com');
      expect(user.password).not.toBe('SecureP@ssw0rd1');
      expect(user.role).toBe('USER');
      expect(user.isActive).toBe(true);
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      const user = await createTestUser('repo-email@example.com');

      const found = await userRepository.findByEmail(user.email);

      expect(found).not.toBeNull();
      expect(found?.id).toBe(user.id);
    });

    it('should return null for unknown email', async () => {
      const found = await userRepository.findByEmail('unknown@example.com');
      expect(found).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find a user by id', async () => {
      const user = await createTestUser('repo-id@example.com');

      const found = await userRepository.findById(user.id);

      expect(found).not.toBeNull();
      expect(found?.email).toBe(user.email);
    });

    it('should return null for unknown id', async () => {
      const found = await userRepository.findById('550e8400-e29b-41d4-a716-446655440000');
      expect(found).toBeNull();
    });
  });

  describe('findMany', () => {
    it('should return paginated users', async () => {
      await createTestUser('repo-many-1@example.com');
      await createTestUser('repo-many-2@example.com');

      const result = await userRepository.findMany({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(result.users.length).toBeGreaterThanOrEqual(2);
      expect(result.total).toBeGreaterThanOrEqual(2);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const user = await createTestUser('repo-update@example.com');

      const updated = await userRepository.update(user.id, { name: 'Updated' });

      expect(updated.name).toBe('Updated');
    });

    it('should throw when updating non-existent user', async () => {
      await expect(
        userRepository.update('550e8400-e29b-41d4-a716-446655440000', { name: 'Updated' }),
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      const user = await createTestUser('repo-delete@example.com');

      await userRepository.delete(user.id);

      const found = await userRepository.findById(user.id);
      expect(found).toBeNull();
    });
  });
});
