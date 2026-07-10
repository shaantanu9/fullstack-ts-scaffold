# Clear Dependency-Audit Vulnerabilities

**Date:** 2026-07-09
**Type:** Fix (security)

## Summary

`pnpm audit` reported two transitive vulnerabilities, both pulled in by the dev-only `@usebruno/cli` (API contract testing) — not in any backend's production runtime. Pinned the patched versions via pnpm `overrides` so `pnpm audit` (and the `security.yml` CI gate) are clean.

## Changes

- Added root `pnpm.overrides`: `form-data >=4.0.6` (was 4.0.4 — GHSA-hmw2-7cc7-3qxx, **high**, CRLF injection) and `uuid >=11.1.1` (was 10.0.0 — GHSA-w5hq-g745-h8pq, **moderate**, buffer bounds check).
- `pnpm audit` now reports **"No known vulnerabilities found."** Bruno CLI verified still working (`bru --version` → 3.5.1).

## Runtime security stack (verified, unchanged & clean)

- **Passwords:** argon2id (64 MB / t=3 / p=4) — no bcrypt anywhere.
- **Rate limiting:** `express-rate-limit@7` + `rate-limit-redis@4` (Redis-backed, shared across workers).
- **Headers/CORS:** `helmet@7`, `cors`. **JWT:** `jsonwebtoken@9`.
- All three backends (sql / mongo / supabase) carry the identical, clean security stack.

## Files Modified

- `package.json` (pnpm overrides), `pnpm-lock.yaml`

## Files Created

- `changelogs/2026-07-09_02_audit-clean-dependency-overrides.md`
