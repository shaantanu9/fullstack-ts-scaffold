import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import * as authService from '../../src/services/auth.service';
import { userRepository } from '../../src/database/repositories';
import { generateAccessToken } from '../../src/utils/jwt';

describe('Users Endpoints', () => {
  const getTokens = async (role: 'USER' | 'ADMIN' | 'MODERATOR' = 'USER') => {
    const email = `user-${role.toLowerCase()}-${Date.now()}@example.com`;
    const registered = await authService.register({
      email,
      password: 'SecureP@ssw0rd1',
      name: 'Test User',
    });

    if (role !== 'USER') {
      await userRepository.update(registered.user.id, { role });
    }

    const updated = await userRepository.findByEmail(email);
    return {
      accessToken: generateAccessToken({
        userId: updated!.id,
        email: updated!.email,
        role: updated!.role,
      }),
      user: updated!,
    };
  };

  describe('GET /api/v1/users', () => {
    it('should list users for authenticated user', async () => {
      const { accessToken } = await getTokens('USER');

      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toBeDefined();
    });

    it('should reject unauthenticated requests', async () => {
      const response = await request(app).get('/api/v1/users').expect(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('should return a user by id', async () => {
      const { accessToken, user } = await getTokens('USER');

      const response = await request(app)
        .get(`/api/v1/users/${user.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(user.id);
    });

    it('should return 404 for non-existent user', async () => {
      const { accessToken } = await getTokens('USER');

      const response = await request(app)
        .get('/api/v1/users/550e8400-e29b-41d4-a716-446655440000')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/v1/users/:id', () => {
    it('should allow admin to update a user', async () => {
      const { accessToken } = await getTokens('ADMIN');
      const target = await getTokens('USER');

      const response = await request(app)
        .patch(`/api/v1/users/${target.user.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Updated by Admin' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated by Admin');
    });

    it('should allow moderator to update a user', async () => {
      const { accessToken } = await getTokens('MODERATOR');
      const target = await getTokens('USER');

      const response = await request(app)
        .patch(`/api/v1/users/${target.user.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Updated by Moderator' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should forbid a moderator from changing role or isActive (no privilege escalation)', async () => {
      const { accessToken } = await getTokens('MODERATOR');
      const target = await getTokens('USER');

      await request(app)
        .patch(`/api/v1/users/${target.user.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ role: 'ADMIN' })
        .expect(403);

      await request(app)
        .patch(`/api/v1/users/${target.user.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ isActive: false })
        .expect(403);
    });

    it('should allow an admin to change role', async () => {
      const { accessToken } = await getTokens('ADMIN');
      const target = await getTokens('USER');

      const response = await request(app)
        .patch(`/api/v1/users/${target.user.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ role: 'MODERATOR' })
        .expect(200);

      expect(response.body.data.role).toBe('MODERATOR');
    });

    it('should reject regular user from updating another user', async () => {
      const { accessToken } = await getTokens('USER');
      const target = await getTokens('USER');

      const response = await request(app)
        .patch(`/api/v1/users/${target.user.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Updated by User' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should validate request body', async () => {
      const { accessToken } = await getTokens('ADMIN');
      const target = await getTokens('USER');

      const response = await request(app)
        .patch(`/api/v1/users/${target.user.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'A' })
        .expect(422);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    it('should allow admin to delete a user', async () => {
      const { accessToken } = await getTokens('ADMIN');
      const target = await getTokens('USER');

      await request(app)
        .delete(`/api/v1/users/${target.user.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      await request(app)
        .get(`/api/v1/users/${target.user.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('should reject moderator from deleting a user', async () => {
      const { accessToken } = await getTokens('MODERATOR');
      const target = await getTokens('USER');

      const response = await request(app)
        .delete(`/api/v1/users/${target.user.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should reject regular user from deleting a user', async () => {
      const { accessToken } = await getTokens('USER');
      const target = await getTokens('USER');

      const response = await request(app)
        .delete(`/api/v1/users/${target.user.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});
