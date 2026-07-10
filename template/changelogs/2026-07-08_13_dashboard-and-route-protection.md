# Add dashboard, profile, and client-side route protection

**Date:** 2026-07-08
**Type:** Feature

## Summary

The `ROUTES.DASHBOARD` / `ROUTES.PROFILE` constants were previously dead (no pages, no protection, login redirected to `/`). Added a real authenticated area: a `(protected)` route group whose layout guards its pages, a dashboard, and a read-only profile page. Because the auth tokens live in localStorage (Zustand persist) — which Next.js edge middleware cannot read — protection is enforced client-side via a `useRequireAuth` guard rather than `middleware.ts`. Login and register now land on the dashboard. The dashboard calls `/auth/me` on load, closing the audit's "session never re-validated" gap.

## Changes

- `client/src/hooks/useRequireAuth.ts`: redirects to login once the store has hydrated with no session; returns `isChecking` for placeholder rendering.
- `client/src/app/(protected)/layout.tsx`: spinner while checking, then renders children.
- `client/src/app/(protected)/dashboard/page.tsx`: shows the user and verifies the session against `GET /auth/me`.
- `client/src/app/(protected)/profile/page.tsx`: read-only account details (self-service edit needs a `/users/me` write endpoint — out of scope, noted in the audit).
- `client/src/app/(auth)/login/page.tsx` + `register/page.tsx`: redirect to `DASHBOARD` after success.
- `client/src/components/common/Navbar.tsx`: "Dashboard" link when authenticated.
- `e2e/protected.test.ts`: new tests asserting `/dashboard` and `/profile` redirect unauthenticated visitors to `/login`.
- `e2e/auth.test.ts`: updated post-auth redirect expectations to `/dashboard`.

## Verification

- Client: type-check + lint clean, 36/36 unit tests, `next build` emits `/dashboard` + `/profile`.
- E2E (real browser, prod client): 8/8 pass — login→dashboard, logout→login, and both protected-route redirects.

## Files Created

- `client/src/hooks/useRequireAuth.ts`
- `client/src/app/(protected)/layout.tsx`, `dashboard/page.tsx`, `profile/page.tsx`
- `e2e/protected.test.ts`

## Files Modified

- `client/src/app/(auth)/login/page.tsx`, `register/page.tsx`, `client/src/components/common/Navbar.tsx`, `e2e/auth.test.ts`
