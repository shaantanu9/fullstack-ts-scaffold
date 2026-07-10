import { describe, it, expect } from 'vitest';
import { createHmac } from 'crypto';
import {
  signUploadToken,
  isImageKitConfigured,
  createImageKitAuthParams,
} from '../../../src/services/upload.service';

describe('upload.service (ImageKit)', () => {
  it('signs as HMAC-SHA1 hex of token+expire', () => {
    const expected = createHmac('sha1', 'private_test_key').update('abc123').digest('hex');
    expect(signUploadToken('private_test_key', 'abc', 123)).toBe(expected);
  });

  it('reports configured when the test creds are present', () => {
    expect(isImageKitConfigured()).toBe(true);
  });

  it('returns auth params whose signature matches the token+expire', () => {
    const params = createImageKitAuthParams();

    expect(params.token).toBeTruthy();
    expect(params.expire).toBeGreaterThan(Math.floor(Date.now() / 1000));
    expect(params.publicKey).toBe('public_test_key');
    expect(params.urlEndpoint).toBe('https://ik.imagekit.io/testboilerplate');

    const expectedSig = signUploadToken('private_test_key', params.token, params.expire);
    expect(params.signature).toBe(expectedSig);
  });
});
