# Fix RBAC privilege escalation and cross-backend ID-format parity

**Date:** 2026-07-08
**Type:** Fix (security)

## Summary

Audit found two backend issues affecting both server-sql and server-mongo. (1) `PATCH /users/:id` was reachable by MODERATOR while `updateUserSchema` allowed `role`/`isActive`, so a moderator could promote itself or anyone to ADMIN. (2) The shared `userIdSchema` accepted both a UUID and a Mongo ObjectId, so a 24-hex id passed validation on server-sql and then hit Prisma's `uuid` column → 500, while server-mongo returned 404 — breaking the "identical API" contract.

## Changes

- `*/controllers/user.controller.ts`: `updateUser` now rejects `role`/`isActive` changes from non-admins with 403 (moderators may still edit profile fields like `name`).
- `server-sql/src/validations/user.schema.ts`: `userIdSchema` is UUID-only.
- `server-mongo/src/validations/user.schema.ts`: `userIdSchema` is ObjectId-only. Both now return a clean 400 for a foreign-format id.
- Tests: added moderator-escalation regression tests (403 on role/isActive; admin can still change role) to both backends; updated the mongo 404 test and schema test to the ObjectId-only contract.

## Verification

- server-sql: 117/117 · server-mongo: 117/117 (115 + 2 new escalation tests each). Both typecheck clean.

## Files Modified

- `server-sql/src/controllers/user.controller.ts`, `server-mongo/src/controllers/user.controller.ts`
- `server-sql/src/validations/user.schema.ts`, `server-mongo/src/validations/user.schema.ts`
- `server-sql/tests/integration/users.test.ts`, `server-mongo/tests/integration/users.test.ts`
- `server-mongo/tests/unit/validations/user.schema.test.ts`
