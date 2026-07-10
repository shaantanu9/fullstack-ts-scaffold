# Fix Flaky Test Suite Under Load (hook timeout)

**Date:** 2026-07-09
**Type:** Fix

## Summary

The test suite (especially `server-mongo`) flaked intermittently under load —
symptoms like "created 2 users, found 1" and "DELETE → 404" — surfaced by a fresh
scaffold run (1/14 checks failed) and reproduced locally (up to 10 failures in a
run). Root cause: the suite reconnects to the database per test file (~77s total
setup), and under that load Vitest's **default 10s `hookTimeout` abandoned an
`afterEach` mid-cleanup**, leaking DB/Redis state into the next test. Raising the
hook/test timeout to 30s makes the suite reliably green.

Note: this is NOT a BullMQ bug — both backends use identical BullMQ code, yet only
`server-mongo` flaked (the slower reconnect path). The earlier `NODE_ENV=test`
enqueue guard (commit 438e07c) reduced the flakiness but did not eliminate it.

## Verification

- `server-mongo` full suite: **8/8 runs green** (was 0–10 failures/run before).
- `server-sql` full suite: 3/3 green.
- Full scaffold (`scaffold.mjs`, both backends): **2/2 runs 14/14 green** (5.3 / 6.3 min).

## Changes

- `server-{sql,mongo}/vitest.config.ts`: add `hookTimeout: 30000` and
  `testTimeout: 30000` with an explanatory comment.

## Files Modified

- `server-sql/vitest.config.ts`
- `server-mongo/vitest.config.ts`
