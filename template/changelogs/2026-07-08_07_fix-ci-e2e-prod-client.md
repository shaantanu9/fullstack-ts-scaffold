# Fix CI: run Puppeteer E2E against a production client build

**Date:** 2026-07-08
**Type:** Fix

## Summary

The `integration-e2e` job's Puppeteer step failed with `Timed out waiting for port 3000` — `next dev` never served within the 120s window on the CI runner (on-demand compilation is slow/flaky there). Since the client already builds cleanly, switched the e2e harness to run the production client (`next build` + `next start`) in CI, which is deterministic and starts instantly. Also added an explicit Chromium install step because pnpm v9 does not run Puppeteer's postinstall browser download, so `puppeteer.executablePath('chrome')` would otherwise fail.

## Changes

- `e2e/setup.ts`: `startClient` now honors `E2E_CLIENT_START=1` to launch `pnpm --filter client start` (production) instead of `next dev`. Local default remains `next dev`.
- `.github/workflows/ci.yml` (`integration-e2e` job): added `Build client for E2E`, `Install Chromium for Puppeteer`, and set `E2E_CLIENT_START=1` on the Puppeteer step.

## Verification

- Local: `pnpm --filter client build` + `E2E_CLIENT_START=1 pnpm test:e2e` → client starts via `next start`, 6/6 e2e tests pass.

## Files Modified

- `e2e/setup.ts`
- `.github/workflows/ci.yml`
