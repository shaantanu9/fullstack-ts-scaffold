# Client auth hardening: singleflight refresh, hydration guard, field errors

**Date:** 2026-07-08
**Type:** Fix

## Summary

Three client fixes from the audit. (1) The 401 interceptor had no shared refresh — concurrent expired-token requests each POSTed the old refresh token, but the server rotates+deletes it on first use, so the rest 401'd and forced a logout. Now a single in-flight refresh promise is shared by all concurrent 401s. (2) `handleApiError` surfaced only the top-level message; it now prefers the server's per-field `errors` map so users see exactly what to fix. (3) The Navbar rendered the logged-out state on SSR then popped to logged-in after localStorage rehydration; a `hasHydrated` flag now gates auth-dependent UI to remove the flash.

## Changes

- `client/src/lib/api.ts`: extracted `refreshAccessToken`; the interceptor reuses a module-level `refreshPromise` (single-flight) and clears it on settle. `handleApiError` joins field-level errors when present.
- `client/src/stores/authStore.ts`: added `hasHydrated` state + `setHasHydrated`, set via persist `onRehydrateStorage`.
- `client/src/hooks/useAuth.ts`: expose `hasHydrated`.
- `client/src/components/common/Navbar.tsx`: render auth-dependent links only after hydration.
- Tests: Navbar mocks updated with `hasHydrated`; added a hydration-gate test.

## Verification

- `pnpm --filter client type-check` clean, lint clean, 36/36 tests, `next build` compiles.

## Files Modified

- `client/src/lib/api.ts`, `client/src/stores/authStore.ts`, `client/src/hooks/useAuth.ts`, `client/src/components/common/Navbar.tsx`, `client/tests/components/Navbar.test.tsx`
