# Fix CI: commit Prisma migration and seed admin before Bruno

**Date:** 2026-07-08
**Type:** Fix

## Summary

After the pnpm fix, the Postgres jobs still failed: every query 500'd with `The table public.users does not exist`. Root cause — `server-sql/.gitignore` ignored `src/database/prisma/migrations/*/`, so the actual `migration.sql` was never committed. `prisma migrate deploy` in CI therefore created no schema. It passed locally only because the dev database already had the table. Second, the `integration-e2e` job ran Bruno against a freshly-migrated database with no admin user, so the "Login Admin" request (and the admin-gated user routes) would fail. Un-ignored and committed the migration, and added a seed step before the Bruno tests.

## Changes

- `server-sql/.gitignore`: removed the `migrations/*/` ignore rule so Prisma migrations are tracked (they are the schema source of truth).
- Committed `server-sql/src/database/prisma/migrations/20260707192741_init_test/migration.sql`.
- `.github/workflows/ci.yml`: added a `Seed admin user` step (`pnpm --filter server-sql run db:seed`) after migrations and before the Bruno API contract tests in the `integration-e2e` job.

## Files Modified

- `server-sql/.gitignore`
- `.github/workflows/ci.yml`

## Files Created (now tracked)

- `server-sql/src/database/prisma/migrations/20260707192741_init_test/migration.sql`
