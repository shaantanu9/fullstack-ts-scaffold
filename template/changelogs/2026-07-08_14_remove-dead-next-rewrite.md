# Remove dead (and incorrect) next.config API rewrite

**Date:** 2026-07-08
**Type:** Fix

## Summary

`next.config.js` had a `/api/:path*` rewrite to `${NEXT_PUBLIC_API_BASE_URL}/:path*`, but the axios client calls `NEXT_PUBLIC_API_BASE_URL` directly, so the rewrite never fired. It was also wrong: `NEXT_PUBLIC_API_BASE_URL` already ends in `/api/v1`, so a proxied `/api/v1/auth/login` would have rewritten to `.../api/v1/v1/auth/login`. Removed it and documented how to reintroduce a correct same-origin proxy if the refresh token is later moved to an httpOnly cookie.

## Changes

- `client/next.config.js`: removed the dead/incorrect `rewrites()`; added a comment explaining the direct-call approach and how to add a correct proxy later.

## Verification

- `next build` compiles; e2e suite (8/8) still passes against the direct-call client.

## Files Modified

- `client/next.config.js`
