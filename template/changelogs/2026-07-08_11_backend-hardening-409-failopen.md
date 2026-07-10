# Backend hardening: 409 on duplicate register, rate-limiter fail-open, skip probes

**Date:** 2026-07-08
**Type:** Fix

## Summary

Three production-readiness fixes from the audit, applied identically to both backends. (1) Registration was check-then-create with no catch, so a concurrent duplicate returned 500 instead of 409 — now the unique-constraint violation (Prisma `P2002` / Mongo `11000`) is caught and mapped to 409. (2) The Redis-backed rate limiter would surface a store error (Redis down) as a 500 on **every** request — it now fails open (logs and continues). (3) `/health` and `/ready` were subject to the global limiter, so a burst of orchestrator probes could 429 and report the app unhealthy — they're now skipped.

## Changes

- `*/services/auth.service.ts`: `register` wraps `create` in try/catch, maps unique-violation → `ApiError.conflict(EMAIL_ALREADY_EXISTS)` (409). Added `isUniqueViolation` helper (handles both `P2002` and `11000`).
- `*/middlewares/rateLimiter.ts`: added `failOpen` wrapper (store error → log + `next()`), and `skip` on `apiRateLimiter` for `/health` + `/ready`.
- Tests: added "should return 409 for a duplicate email" to both backends' auth integration suites.

## Verification

- server-sql 118/118 · server-mongo 118/118. Both typecheck + lint clean (0 errors).

## Files Modified

- `server-sql/src/services/auth.service.ts`, `server-mongo/src/services/auth.service.ts`
- `server-sql/src/middlewares/rateLimiter.ts`, `server-mongo/src/middlewares/rateLimiter.ts`
- `server-sql/tests/integration/auth.test.ts`, `server-mongo/tests/integration/auth.test.ts`
