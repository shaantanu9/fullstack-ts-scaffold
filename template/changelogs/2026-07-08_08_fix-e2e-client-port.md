# Fix E2E: pin client to port 3000 regardless of ambient PORT

**Date:** 2026-07-08
**Type:** Fix

## Summary

The Puppeteer job still timed out waiting for port 3000 even with the production client. Cause: `next start` (and `next dev`) honor the `PORT` environment variable, and the CI job sets `PORT=5002` for the backend — so the client tried to bind 5002 and nothing ever came up on 3000. The server spawn already forces its own port; the client spawn now forces `PORT=3000` too, making it independent of any ambient `PORT`.

## Changes

- `e2e/setup.ts`: `startClient` sets `PORT: '3000'` in the spawned client's env.

## Verification

- Reproduced CI locally with `PORT=5002 E2E_CLIENT_START=1 pnpm test:e2e` → client binds 3000, "Client ready", 6/6 e2e tests pass.

## Files Modified

- `e2e/setup.ts`
