# Architecture/Design Audit — Consistency Fixes

**Date:** 2026-07-10
**Type:** Refactor / Infrastructure

## Summary

Ran a full folder/code-design and system-design-pattern audit of the three-backend
boilerplate. Result: the codebase is genuinely proper — every DB-agnostic file is
byte-identical across `server-sql`, `server-mongo`, and `server-supabase` (verified
by hash, not eyeball), layering is strict (route → validate → auth → rate-limit →
controller → service → repository → DB), the repository-interface pattern is honored,
and the client's NextAuth/Edge split is textbook. All divergences between backends are
intentional and commented (per-backend ID validation, supabase leanness). Only a short
tail of real inconsistencies was found and fixed here; none were correctness bugs in the
running system.

## Changes

- **CI parity (P1):** added a `Server (Supabase) Checks` job (lint · type-check · build)
  so the third backend is enforced on a clean runner instead of silently rotting. Its
  Vitest suite opens a live Supabase-CLI-stack connection globally in `tests/setup.ts`
  (no unit-only subset), so the heavier full-test job (`supabase/setup-cli` + `supabase
  start` + redis service) is deferred and documented in the job comment.
- **Config discipline (P2):** `auth.service.ts` (sql + mongo) now reads `appConfig.isTest`
  instead of `process.env.NODE_ENV` — it was the only `process.env` read in all of `src/`
  outside `config/env.ts`. Files kept byte-identical across the two backends.
- **Dead dependency (P2):** removed the unused `zustand` dependency from the client
  (leftover from the pre-NextAuth store architecture; zero imports in `client/src`).
- **Client pattern parity (P2):** added `client/src/constants/roles.ts` (`ROLES` / `Role`
  / `DEFAULT_ROLE`) mirroring the backend role vocabulary, and used `DEFAULT_ROLE` for the
  session-role fallback instead of a bare `'USER'` literal.
- **Docs:** corrected the stale `pnpm-workspace.yaml` comment ("two backends … port 5002")
  to name all three backends with their ports (5002/5003/5004).

## Verification

- `server-supabase`: lint · type-check · build all PASS (the exact commands the new CI job runs).
- `server-sql` / `server-mongo`: lint · type-check PASS (after `prisma generate`, as CI does).
- `client`: lint · type-check PASS; zustand fully removed from `pnpm-lock.yaml`, no packages added.
- `auth.service.ts` kept byte-identical across sql/mongo after the edit.

## Files Created

- `.github/workflows/ci.yml` — (modified) new `server-supabase` job
- `client/src/constants/roles.ts` — client role vocabulary mirroring the backend

## Files Modified

- `.github/workflows/ci.yml` — added Server (Supabase) Checks job
- `server-sql/src/services/auth.service.ts` — `appConfig.isTest` instead of `process.env.NODE_ENV`
- `server-mongo/src/services/auth.service.ts` — same, kept byte-identical
- `client/package.json` + `pnpm-lock.yaml` — dropped `zustand`
- `client/src/auth.config.ts` — use `DEFAULT_ROLE` fallback
- `pnpm-workspace.yaml` — corrected three-backend comment
