# Bruno setVar migration + fixed distinct ports for both backends

**Date:** 2026-07-08
**Type:** Refactor | Infrastructure

## Summary

Two related improvements so the dual-backend boilerplate is safe to run and easy to point tools at. First, migrated the Bruno collection off `bru.setEnvVar()`/`getEnvVar()` (which Bruno v4, releasing mid-July, will persist to disk — a token-leak risk in git) to runtime-only `bru.setVar()`/`getVar()`. Second, gave each backend a fixed, distinct set of ports so `server-sql` and `server-mongo` can run at the same time without colliding, split the single Bruno `local` environment into `sql` and `mongo`, and added a `free-port` helper wired into `predev`/`predev:mongo` so a leftover server never blocks startup with `EADDRINUSE`.

## Port scheme

| | App | DB | Redis | Bruno env |
|---|---|---|---|---|
| server-sql | 5002 | Postgres 5434 | 6381 | `sql` |
| server-mongo | **5003** | Mongo 27018 | **6382** | `mongo` |

## Changes

- Bruno: `setEnvVar` → `setVar` in Login, Login Admin, Register User to Delete; `getEnvVar("userId")` → `getVar` in Get User. No functional change on v3, forward-safe for v4.
- Bruno environments: removed `local.bru`; added `sql.bru` (:5002) and `mongo.bru` (:5003).
- server-mongo now runs on PORT 5003 and REDIS 6382 (`.env`, `.env.example`, `.env.test.example`, `docker-compose.yml` redis host port).
- `scripts/free-port.mjs`: kills whatever listens on the given ports (unix/lsof). Wired as `predev` (5002/3000), `predev:mongo` (5003/3000), and standalone `pnpm free:ports` (5002/5003/3000).
- Root scripts: `test:api` now aliases `test:api:sql`; added `test:api:sql`/`test:api:mongo`; `test:api:ci*` use the matching env.
- e2e/setup.ts: derives `SERVER_PORT` (5002 sql / 5003 mongo) from `E2E_SERVER_FILTER` and forces `PORT` on the spawned server.
- CI: server-mongo job aligned to 5003 / redis 6382 (isolated runners, kept consistent).
- Docs: README dev-servers port table, scripts table, Bruno + Docker sections; root `.env.example` note.

## Verification

- Both stacks up simultaneously (pg+redis 6381 and mongo+redis 6382) — no conflict.
- Both servers running together: `:5002/ready` and `:5003/ready` both `{database:true,redis:true}`.
- `pnpm test:api:sql` → 22/22 PASS · `pnpm test:api:mongo` → 22/22 PASS.
- One-shot `pnpm test:api:ci` → 22/22 · `pnpm test:api:ci:mongo` → 22/22.
- `node scripts/free-port.mjs 5002 5003` freed both busy ports and reported killed PIDs.

## Files Created

- `scripts/free-port.mjs`
- `bruno/Boilerplate API/environments/sql.bru`
- `bruno/Boilerplate API/environments/mongo.bru`

## Files Modified

- `bruno/Boilerplate API/Auth/Login.bru`, `Login Admin.bru`, `Register User to Delete.bru`, `Users/Get User.bru`
- `package.json` (scripts)
- `e2e/setup.ts`
- `server-mongo/.env`, `.env.example`, `.env.test.example`, `docker-compose.yml`
- `.github/workflows/ci.yml`
- `README.md`, `.env.example`

## Files Removed

- `bruno/Boilerplate API/environments/local.bru`
