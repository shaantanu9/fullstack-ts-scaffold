import { describe, it, expect } from 'vitest';
import {
  userIdSchema,
  updateUserSchema,
  userQuerySchema,
} from '../../../src/validations/user.schema';

describe('user schemas', () => {
  describe('userIdSchema', () => {
    it('should validate a MongoDB ObjectId', () => {
      expect(() => userIdSchema.parse({ id: '507f1f77bcf86cd799439011' })).not.toThrow();
    });

    it('should reject a non-ObjectId id (e.g. a UUID)', () => {
      expect(() => userIdSchema.parse({ id: '550e8400-e29b-41d4-a716-446655440000' })).toThrow();
      expect(() => userIdSchema.parse({ id: 'not-an-object-id' })).toThrow();
    });
  });

  describe('updateUserSchema', () => {
    it('should validate an empty update', () => {
      expect(() => updateUserSchema.parse({})).not.toThrow();
    });

    it('should validate a name update', () => {
      expect(() => updateUserSchema.parse({ name: 'New Name' })).not.toThrow();
    });

    it('should reject a name shorter than 2 characters', () => {
      expect(() => updateUserSchema.parse({ name: 'A' })).toThrow();
    });

    it('should validate a role update', () => {
      expect(() => updateUserSchema.parse({ role: 'ADMIN' })).not.toThrow();
    });

    it('should reject an invalid role', () => {
      expect(() => updateUserSchema.parse({ role: 'SUPERUSER' })).toThrow();
    });

    it('should validate an isActive update', () => {
      expect(() => updateUserSchema.parse({ isActive: false })).not.toThrow();
    });
  });

  describe('userQuerySchema', () => {
    it('should validate an empty query', () => {
      expect(() => userQuerySchema.parse({})).not.toThrow();
    });

    it('should validate page and limit as numeric strings', () => {
      expect(() => userQuerySchema.parse({ page: '2', limit: '20' })).not.toThrow();
    });

    it('should reject non-numeric page', () => {
      expect(() => userQuerySchema.parse({ page: 'abc' })).toThrow();
    });

    it('should validate sortBy and sortOrder', () => {
      expect(() => userQuerySchema.parse({ sortBy: 'email', sortOrder: 'asc' })).not.toThrow();
    });

    it('should reject an invalid sortBy', () => {
      expect(() => userQuerySchema.parse({ sortBy: 'password' })).toThrow();
    });

    it('should reject an invalid sortOrder', () => {
      expect(() => userQuerySchema.parse({ sortOrder: 'descending' })).toThrow();
    });
  });
});
