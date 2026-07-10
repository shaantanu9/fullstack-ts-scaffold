# Fix server-mongo seed: load dotenv before env validation

**Date:** 2026-07-08
**Type:** Fix

## Summary

`pnpm --filter server-mongo db:seed` failed with `Missing environment variables: ACCESS_TOKEN_SECRET, DATABASE_URL, REDIS_URL, REFRESH_TOKEN_SECRET` because the standalone seed script never loaded `.env`. The server itself works because `src/app.ts` starts with `import 'dotenv/config'`, and the SQL variant's seed accidentally works because `@prisma/client` auto-loads `.env` on import — the Mongo variant has no Prisma, so nothing populated `process.env` before `appConfig` (envalid) ran at import time. Added an explicit `import 'dotenv/config'` as the first line of the Mongo seed, matching the pattern already used in `app.ts`.

## Changes

- Added `import 'dotenv/config';` as the first import in `server-mongo/src/database/seed.ts` so `appConfig`/envalid sees the `.env` values when run standalone.

## Verification

- `pnpm --filter server-mongo db:seed` → `Admin user created: admin@example.com`
- Full Bruno collection against server-mongo → 11/11 requests, 22/22 tests PASS
- `pnpm test:api:ci:mongo` (one-shot) → 22/22 PASS
- server-sql regression unaffected: `pnpm test:api:ci` → 22/22 PASS

## Files Modified

- `server-mongo/src/database/seed.ts` — load dotenv before importing appConfig/models
