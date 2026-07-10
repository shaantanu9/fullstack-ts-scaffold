# Client Edge Route Protection (Next.js middleware)

**Date:** 2026-07-09
**Type:** Feature

## Summary

Added a real Next.js edge `middleware.ts` so protected routes are gated **before render**, upgrading the client from client-side-only protection to a proper two-layer model (edge middleware + client guard), backed by the server API as the real security boundary. Fully documented and tested (integration + e2e).

## Changes

- **Edge middleware** (`client/src/middleware.ts`): redirects unauthenticated users off `/dashboard` and `/profile` to `/login?redirect=<path>`, and bounces authenticated users off `/login` and `/register` to `/dashboard`. Scoped via `config.matcher`.
- **Edge-readable session cookie**: `lib/authCookie.ts` (`setAuthCookie`/`clearAuthCookie`) mirrors the access token — which lives in `localStorage` and is invisible to the edge — into a `SameSite=Lax` cookie. `components/common/AuthCookieSync.tsx` (mounted in the root layout) keeps it in sync with the store: login sets it, logout clears it.
- **Post-login redirect**: `login/page.tsx` honours `?redirect=` (safe internal paths only — no open redirect).
- **Second layer kept**: `useRequireAuth` / `(protected)/layout.tsx` remain as defence-in-depth (mid-session expiry, cross-tab logout).
- **Docs**: `docs/ROUTE_PROTECTION.md` — the three-layer model, the cookie rationale, the end-to-end flow diagram, how to add a protected route, how it's tested, and an httpOnly-cookie hardening upgrade path.
- **Tests**: `client/tests/middleware.test.ts` (6 real `NextRequest`→`NextResponse` scenarios) and `client/tests/lib/authCookie.test.ts`. Client suite green at 46 tests; production build emits `ƒ Middleware`; e2e route-protection verified in a real browser.

## Files Created

- `client/src/middleware.ts`, `client/src/lib/authCookie.ts`, `client/src/components/common/AuthCookieSync.tsx`
- `client/tests/middleware.test.ts`, `client/tests/lib/authCookie.test.ts`
- `docs/ROUTE_PROTECTION.md`

## Files Modified

- `client/src/app/layout.tsx` (mount `AuthCookieSync`)
- `client/src/app/(auth)/login/page.tsx` (`?redirect=` handling)
- `client/src/hooks/useRequireAuth.ts` (doc comment: now the second layer)
