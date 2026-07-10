# Fix CI: remove pnpm/action-setup version conflict

**Date:** 2026-07-08
**Type:** Fix

## Summary

The first CI run on `main` failed in every job at the `pnpm/action-setup@v4` step with `Error: Multiple versions of pnpm specified`. The action had `with: version: 9` while `package.json` declares `"packageManager": "pnpm@9.5.0"`; action-setup v4 treats that as a conflict and aborts before install. Removed the hardcoded `version` from all four `pnpm/action-setup@v4` steps so the action derives the version from the `packageManager` field (9.5.0) — the single source of truth. Local runs were unaffected (this only manifests in the GitHub Action).

## Changes

- Removed `with: version: 9` from all four `pnpm/action-setup@v4` steps in `.github/workflows/ci.yml` (server-sql, server-mongo, client, integration-e2e jobs).

## Files Modified

- `.github/workflows/ci.yml`
