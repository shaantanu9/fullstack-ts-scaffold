import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { register } from '../../src/services/auth.service';

describe('Uploads Endpoints', () => {
  const registerUser = async (): Promise<string> => {
    const result = await register({
      email: `upload-${Date.now()}@example.com`,
      password: 'SecureP@ssw0rd1',
      name: 'Upload User',
    });
    return result.tokens.accessToken;
  };

  describe('GET /api/v1/uploads/imagekit-auth', () => {
    it('requires authentication', async () => {
      await request(app).get('/api/v1/uploads/imagekit-auth').expect(401);
    });

    it('returns signed ImageKit auth params for an authenticated user', async () => {
      const accessToken = await registerUser();

      const response = await request(app)
        .get('/api/v1/uploads/imagekit-auth')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeTruthy();
      expect(response.body.data.signature).toBeTruthy();
      expect(response.body.data.expire).toBeGreaterThan(0);
      expect(response.body.data.publicKey).toBe('public_test_key');
      expect(response.body.data.urlEndpoint).toContain('imagekit.io');
    });
  });
});
