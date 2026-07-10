'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import api, { handleApiError } from '@/lib/api';
import { ApiSuccessResponse } from '@/types/api';
import { ROUTES } from '@/constants/routes';

interface MeResponse {
  userId: string;
  email: string;
  role: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [sessionOk, setSessionOk] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Re-validate the session against the server on load (also exercises the
  // access-token → silent-refresh path through the axios interceptor).
  useEffect(() => {
    let active = true;
    api
      .get<ApiSuccessResponse<MeResponse>>('/auth/me')
      .then(() => {
        if (active) setSessionOk(true);
      })
      .catch((err) => {
        if (active) {
          setSessionOk(false);
          setError(handleApiError(err));
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <Link href={ROUTES.PROFILE}>
          <Button variant="outline" size="sm">
            View profile
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Welcome{user?.name ? `, ${user.name}` : ''}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-gray-500">Email</dt>
              <dd className="text-gray-900">{user?.email ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Role</dt>
              <dd className="text-gray-900">{user?.role ?? '—'}</dd>
            </div>
          </dl>

          <p className="mt-6 text-sm" data-testid="session-status">
            {sessionOk === null && <span className="text-gray-500">Verifying session…</span>}
            {sessionOk === true && (
              <span className="text-green-600">✓ Session verified with the server</span>
            )}
            {sessionOk === false && (
              <span className="text-red-600">Session check failed: {error}</span>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
