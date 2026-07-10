# BullMQ Background Job Worker (both backends)

**Date:** 2026-07-09
**Type:** Feature

## Summary

Added a BullMQ + Redis background job worker to both backends. Registration now
hands the "welcome email" off to a queue and returns immediately; a standalone
worker process (`pnpm --filter <server> worker`) consumes the job off the
request path. The jobs code is DB-agnostic and byte-identical across `server-sql`
and `server-mongo`. Verified green (138 tests each, coverage ~86%).

## Changes

- Added `bullmq` dependency to both backends.
- `src/jobs/emailQueue.ts`: lazily-created BullMQ Queue + dedicated ioredis
  connection (`maxRetriesPerRequest: null`); `enqueueWelcomeEmail` (fire-and-forget,
  swallow-and-log so registration never fails); pure `processWelcomeEmail` processor;
  `closeEmailQueue` for graceful shutdown + test teardown.
- `src/jobs/worker.ts`: standalone Worker process with graceful SIGTERM/SIGINT
  shutdown; excluded from coverage (entrypoint, like `server.ts`).
- Producer wired into `auth.service.register`.
- `worker` npm script added to both backends.
- Test `setup.ts` `afterAll` now calls `closeEmailQueue()` (no leaked Redis handles).
- Unit test covers the pure processor + enqueue success + swallow-and-log error path.

## Gotcha resolved

- `bullmq` pulled `ioredis@5.11.1` while the app used `5.10.1`, causing a `tsc`
  "Connector is incompatible / AbstractConnector" error. Fixed by pinning a single
  ioredis version via root `package.json` `pnpm.overrides.ioredis = "5.11.1"`.

## Files Created

- `server-{sql,mongo}/src/jobs/emailQueue.ts`
- `server-{sql,mongo}/src/jobs/worker.ts`
- `server-{sql,mongo}/tests/unit/jobs/emailQueue.test.ts`

## Files Modified

- `server-{sql,mongo}/src/services/auth.service.ts` — enqueue welcome email
- `server-{sql,mongo}/tests/setup.ts` — `closeEmailQueue()` teardown
- `server-{sql,mongo}/vitest.config.ts` — exclude `src/jobs/worker.ts` from coverage
- `server-{sql,mongo}/package.json` — `bullmq` dep + `worker` script
- `package.json` — `pnpm.overrides.ioredis`
- `pnpm-lock.yaml`
