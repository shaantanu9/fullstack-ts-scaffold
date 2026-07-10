# Backend Hardening & Housekeeping

**Date:** 2026-07-08
**Type:** Feature / Fix

## Summary

Closed the "last 20%" gaps that separated a good boilerplate from an exemplary take-home reference: refresh-token rotation, Redis-backed rate limiting, a real readiness probe, OpenAPI/Swagger docs, and several correctness fixes.

## Changes

- **Refresh-token rotation:** `refreshAccessToken` now rotates (old token revoked, new access+refresh issued). Lookups are O(1) via a SHA-256 hash of the token as the Redis key (was an O(N) `redis.keys()` scan). Added a unique `jti` to refresh tokens so each is distinct. Client store + axios interceptor persist the rotated token.
- **Redis-backed rate limiting:** `rateLimiter.ts` uses `rate-limit-redis` so limits are shared across PM2 cluster workers (was in-memory).
- **Health/readiness:** kept `/health` (liveness); added `/ready` probing DB + Redis via a new `checkDatabaseHealth()` in the database module.
- **API docs:** added `src/docs/openapi.ts`, served as Swagger UI at `/docs` and raw spec at `/openapi.json`.
- **Correctness fixes:** unified `PORT` to `5002` across env, client config, `lib/api.ts`, and root env; removed unused `BCRYPT_SALT_ROUNDS`; removed the dead/unwired Mongoose "swappable DB" code; rewrote the Dockerfile to be self-contained pnpm (was `npm ci`, `EXPOSE 5000`).
- **Coverage gate:** installed `@vitest/coverage-v8`; servers enforce a 75% threshold via the `test` script; client reports coverage.
- Added tests for refresh-token rotation and the `/ready` probe.

## Files Modified

- `server-sql/src/services/auth.service.ts`, `utils/jwt.ts`, `middlewares/rateLimiter.ts`, `app.ts`, `database/index.ts`, `config/{env,app.config}.ts`
- `client/src/lib/api.ts`, `client/src/stores/authStore.ts`, `client/src/constants/config.ts`
- `server-sql/Dockerfile`, `server-sql/docker-compose.yml`, `server-sql/vitest.config.ts`, env examples

## Files Created

- `server-sql/src/docs/openapi.ts`
