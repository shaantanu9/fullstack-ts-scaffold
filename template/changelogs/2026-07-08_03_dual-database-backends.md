# Dual-Database Backends + Tooling

**Date:** 2026-07-08
**Type:** Feature / Infrastructure

## Summary

Split the single backend into two fully-independent, interchangeable backends — `server-sql` (PostgreSQL + Prisma) and `server-mongo` (MongoDB + Mongoose) — that expose the identical API on port 5002, so a project can start on either DB and delete the other with zero code impact. Added Husky/lint-staged/commitlint and expanded CI.

## Changes

- Renamed `server/` → `server-sql/` and created `server-mongo/` as a faithful port (40 DB-agnostic source files byte-identical; only the data layer, package.json, env, docker-compose, and DB-touching tests differ). Both pass 115 tests.
- `server-mongo` data layer: mongoose connection singleton, `User` model matching the Prisma schema, `MongooseUserRepository` implementing the shared `UserRepository` interface (same domain shape), idempotent seed, `checkDatabaseHealth` via `db.admin().ping()`.
- Kept `client/`, `e2e/`, and `bruno/` DB-agnostic (HTTP only). `e2e` spawns the backend via `E2E_SERVER_FILTER` (default `server-sql`).
- Root scripts: default (SQL) forms + `:mongo` variants (`dev`/`dev:mongo`, `test`/`test:mongo`, `db:up`/`db:up:mongo`, etc.).
- Self-contained per-server Dockerfiles (build context = the server folder, no workspace dependency).
- **Git hooks:** Husky `pre-commit` → lint-staged (per-package `.lintstagedrc.json`); `commit-msg` → commitlint (Conventional Commits).
- **CI:** separate `server-sql`, `server-mongo`, `client`, and `integration-e2e` (Bruno API + Puppeteer) jobs; removed dead `BCRYPT_SALT_ROUNDS`.
- Housekeeping files: `LICENSE`, `CONTRIBUTING.md`, `.editorconfig`, `.nvmrc`.

## Files Created

- `server-mongo/**` (new backend)
- `commitlint.config.js`, `.husky/pre-commit`, `.husky/commit-msg`
- `server-sql/.lintstagedrc.json`, `client/.lintstagedrc.json`
- `LICENSE`, `CONTRIBUTING.md`, `.editorconfig`, `.nvmrc`

## Files Modified

- `pnpm-workspace.yaml`, root `package.json`, `.github/workflows/ci.yml`, `e2e/setup.ts`, `README.md`
