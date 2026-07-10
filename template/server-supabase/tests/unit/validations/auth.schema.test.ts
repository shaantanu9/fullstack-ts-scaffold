import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from '../../../src/validations/auth.schema';

describe('auth schemas', () => {
  describe('registerSchema', () => {
    const validInput = {
      email: 'test@example.com',
      password: 'SecureP@ssw0rd1',
      name: 'Test User',
    };

    it('should validate a correct register input', () => {
      expect(() => registerSchema.parse(validInput)).not.toThrow();
    });

    it('should reject an invalid email', () => {
      expect(() => registerSchema.parse({ ...validInput, email: 'not-an-email' })).toThrow();
    });

    it('should reject a password shorter than 8 characters', () => {
      expect(() => registerSchema.parse({ ...validInput, password: 'Short1' })).toThrow();
    });

    it('should reject a password without an uppercase letter', () => {
      expect(() => registerSchema.parse({ ...validInput, password: 'securepassword1' })).toThrow();
    });

    it('should reject a password without a lowercase letter', () => {
      expect(() => registerSchema.parse({ ...validInput, password: 'SECUREPASSWORD1' })).toThrow();
    });

    it('should reject a password without a number', () => {
      expect(() => registerSchema.parse({ ...validInput, password: 'SecurePassword' })).toThrow();
    });

    it('should accept input without a name', () => {
      const inputWithoutName = { email: validInput.email, password: validInput.password };
      expect(() => registerSchema.parse(inputWithoutName)).not.toThrow();
    });

    it('should reject a name shorter than 2 characters', () => {
      expect(() => registerSchema.parse({ ...validInput, name: 'A' })).toThrow();
    });
  });

  describe('loginSchema', () => {
    it('should validate a correct login input', () => {
      expect(() =>
        loginSchema.parse({ email: 'test@example.com', password: 'password' }),
      ).not.toThrow();
    });

    it('should reject an invalid email', () => {
      expect(() => loginSchema.parse({ email: 'invalid', password: 'password' })).toThrow();
    });

    it('should reject an empty password', () => {
      expect(() => loginSchema.parse({ email: 'test@example.com', password: '' })).toThrow();
    });
  });

  describe('refreshTokenSchema', () => {
    it('should validate a correct refresh token input', () => {
      expect(() => refreshTokenSchema.parse({ refreshToken: 'valid-token' })).not.toThrow();
    });

    it('should reject an empty refresh token', () => {
      expect(() => refreshTokenSchema.parse({ refreshToken: '' })).toThrow();
    });
  });
});
