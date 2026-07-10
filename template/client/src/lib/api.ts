import axios, { AxiosError, AxiosInstance } from 'axios';
import { getSession, signOut } from 'next-auth/react';
import { ApiErrorResponse } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5002/api/v1';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Attach the Express access token from the NextAuth session to every request.
// The session's token is kept fresh by the NextAuth `jwt` callback (auth.config.ts),
// which silently rotates it via the Express /refresh-token endpoint — so callers
// never touch tokens; they just use `api`.
api.interceptors.request.use(async (config) => {
  const session = await getSession();
  const token = session?.accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401 (token expired between session reads, or the session was revoked),
// hand re-authentication back to NextAuth: sign out and route to /login.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      await signOut({ redirectTo: '/login' });
    }
    return Promise.reject(error);
  },
);

export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const data = axiosError.response?.data;

    // Prefer the server's per-field validation messages so the user sees exactly
    // what to fix, falling back to the top-level message.
    if (data?.errors) {
      const fieldMessages = Object.values(data.errors).flat();
      if (fieldMessages.length > 0) {
        return fieldMessages.join(' ');
      }
    }

    return data?.message || 'An unexpected error occurred';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
};

export default api;
