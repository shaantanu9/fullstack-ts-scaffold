'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/Button';
import { APP_CONFIG } from '@/constants/config';

export const Navbar = () => {
  const { user, isAuthenticated, hasHydrated, logout } = useAuth();

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href={ROUTES.HOME} className="text-xl font-bold text-primary-600">
          {APP_CONFIG.name}
        </Link>

        <div className="flex items-center gap-4">
          {/* Render nothing auth-dependent until the store rehydrates, so the
              server-rendered logged-out state doesn't flash before the client
              knows the user is signed in. */}
          {!hasHydrated ? null : isAuthenticated ? (
            <>
              <Link href={ROUTES.DASHBOARD}>
                <Button variant="ghost" size="sm">
                  Dashboard
                </Button>
              </Link>
              <span data-testid="user-email" className="text-sm text-gray-600">
                {user?.email}
              </span>
              <Button data-testid="logout-button" variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href={ROUTES.LOGIN}>
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href={ROUTES.REGISTER}>
                <Button size="sm">Register</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
