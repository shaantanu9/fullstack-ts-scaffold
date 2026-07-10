# /users/stats Aggregation Endpoint (dual-backend parity)

**Date:** 2026-07-09
**Type:** Feature

## Summary

Added an authenticated `GET /api/v1/users/stats` endpoint that returns aggregated
user statistics, implemented at full dual-backend parity: a MongoDB `$facet`
aggregation pipeline in `server-mongo` and an equivalent Prisma `groupBy` + filtered
`count` in `server-sql`, both returning an identical `UserStats` JSON shape. Verified
green on both backends (138 tests each, coverage ~86%).

## Changes

- New `UserStats` type (`{ total, active, inactive, byRole, recentSignups }`), shared
  and byte-identical across both backends.
- `UserRepository.getStats()` added to the interface + both implementations.
  - Prisma: `Promise.all` of `count`, `count({isActive})`, `groupBy(['role'])`,
    `count({createdAt gte 7d})`.
  - Mongoose: a single `$facet` pipeline (conditional `$sum` totals, per-role
    `$group`, `$match`+`$count` recent).
- New `stats.service.ts` (pure) and `stats.controller.ts` (DB-agnostic, identical).
- Route `GET /users/stats` registered **before** `/:id` so the param route doesn't
  capture "stats".
- OpenAPI/Swagger path documented for `/users/stats`.
- Tests: repository unit (both), service unit (both), integration (both); Bruno
  request "Get Stats" (runs in `sql` + `mongo` envs).

## Files Created

- `server-{sql,mongo}/src/services/stats.service.ts`
- `server-{sql,mongo}/src/controllers/stats.controller.ts`
- `server-{sql,mongo}/tests/unit/services/stats.service.test.ts`
- `bruno/Boilerplate API/Users/Get Stats.bru`

## Files Modified

- `server-{sql,mongo}/src/types/user.ts` — `UserStats` type
- `server-{sql,mongo}/src/database/repositories/user.repository.ts` — `getStats` on interface
- `server-sql/src/database/repositories/prisma.user.repository.ts` — `getStats` (groupBy)
- `server-mongo/src/database/repositories/mongoose.user.repository.ts` — `getStats` (`$facet`)
- `server-{sql,mongo}/src/routes/user.routes.ts` — `/stats` route before `/:id`
- `server-{sql,mongo}/src/docs/openapi.ts` — `/users/stats` path
- `server-{sql,mongo}/tests/unit/repositories/*.user.repository.test.ts` — getStats block
- `server-{sql,mongo}/tests/integration/users.test.ts` — stats endpoint tests
