import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app';

describe('Auth Endpoints', () => {
  const validUser = {
    email: 'test@example.com',
    password: 'SecureP@ssw0rd1',
    name: 'Test User',
  };

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app).post('/api/v1/auth/register').send(validUser).expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(validUser.email);
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();
    });

    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          ...validUser,
          email: 'invalid-email',
        })
        .expect(422);

      expect(response.body.success).toBe(false);
    });

    it('should reject weak password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          ...validUser,
          email: 'another@example.com',
          password: '123',
        })
        .expect(422);

      expect(response.body.success).toBe(false);
    });

    it('should return 409 for a duplicate email', async () => {
      await request(app).post('/api/v1/auth/register').send(validUser).expect(201);

      const response = await request(app).post('/api/v1/auth/register').send(validUser).expect(409);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login an existing user', async () => {
      await request(app).post('/api/v1/auth/register').send(validUser);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: validUser.email,
          password: validUser.password,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(validUser.email);
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: validUser.email,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return current user with valid token', async () => {
      const registerResponse = await request(app).post('/api/v1/auth/register').send(validUser);

      const accessToken = registerResponse.body.data.tokens.accessToken;

      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(validUser.email);
    });

    it('should reject request without token', async () => {
      const response = await request(app).get('/api/v1/auth/me').expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/refresh-token', () => {
    it('should refresh access token with valid refresh token', async () => {
      const registerResponse = await request(app).post('/api/v1/auth/register').send(validUser);
      const refreshToken = registerResponse.body.data.tokens.refreshToken;

      const response = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('should rotate the refresh token and invalidate the old one', async () => {
      const registerResponse = await request(app).post('/api/v1/auth/register').send(validUser);
      const oldRefreshToken = registerResponse.body.data.tokens.refreshToken;

      const rotated = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken: oldRefreshToken })
        .expect(200);

      expect(rotated.body.data.refreshToken).toBeDefined();
      expect(rotated.body.data.refreshToken).not.toBe(oldRefreshToken);

      // The old (used) refresh token must no longer be accepted.
      await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken: oldRefreshToken })
        .expect(401);
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout an authenticated user', async () => {
      const registerResponse = await request(app).post('/api/v1/auth/register').send(validUser);
      const accessToken = registerResponse.body.data.tokens.accessToken;
      const refreshToken = registerResponse.body.data.tokens.refreshToken;

      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);

      const refreshResponse = await request(app)
        .post('/api/v1/auth/refresh-token')
        .send({ refreshToken })
        .expect(401);

      expect(refreshResponse.body.success).toBe(false);
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Server is healthy');
    });
  });

  describe('GET /ready', () => {
    it('should report database and redis readiness', async () => {
      const response = await request(app).get('/ready').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.checks.database).toBe(true);
      expect(response.body.checks.redis).toBe(true);
    });
  });
});
