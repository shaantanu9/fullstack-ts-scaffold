import { describe, it, expect } from 'vitest';
import { ApiError } from '../../src/utils/ApiError';
import { ApiResponse } from '../../src/utils/ApiResponse';
import { HTTP_STATUS } from '../../src/constants/httpStatus';
import { hashPassword, comparePassword } from '../../src/utils/password';

describe('ApiError', () => {
  it('should create an operational error with correct status code', () => {
    const error = ApiError.notFound('User not found');

    expect(error.statusCode).toBe(HTTP_STATUS.NOT_FOUND);
    expect(error.message).toBe('User not found');
    expect(error.isOperational).toBe(true);
  });

  it('should create a non-operational internal error', () => {
    const error = ApiError.internal('Something went wrong');

    expect(error.statusCode).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(error.isOperational).toBe(false);
  });
});

describe('ApiResponse', () => {
  it('should create a success response', () => {
    const response = new ApiResponse('Success', { id: '1' });

    expect(response.toJSON()).toEqual({
      success: true,
      message: 'Success',
      data: { id: '1' },
    });
  });

  it('should include meta when provided', () => {
    const response = new ApiResponse('Success', [], { total: 0 });

    expect(response.toJSON()).toEqual({
      success: true,
      message: 'Success',
      data: [],
      meta: { total: 0 },
    });
  });
});

describe('Password utils', () => {
  it('should hash and compare passwords correctly', async () => {
    const password = 'SecureP@ssw0rd';
    const hashedPassword = await hashPassword(password);

    expect(hashedPassword).not.toBe(password);
    expect(await comparePassword(password, hashedPassword)).toBe(true);
    expect(await comparePassword('wrongpassword', hashedPassword)).toBe(false);
  });
});
