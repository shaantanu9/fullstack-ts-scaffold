# Take-Home Audit: boilerplate_nextjs_express

**Date:** 2026-07-08 · **Auditor:** automated 10-dimension review (GATE → score → red-flags → punch-list)
**Method:** clean-clone build, red-flag grep sweep, two parallel deep-read agents (backend parity + client), structural checks.

---

## GATE checks (run first — a fail here overrides everything)

| GATE | Result | Evidence |
|---|---|---|
| Runs from clean clone | ✅ | Fresh `git clone` → `pnpm install --frozen-lockfile` → all 3 apps build, both backends `tsc --noEmit` clean |
| No committed secrets | ✅ | No real `.env` tracked; `git log -p` history hits are doc/schema text only |
| No committed artifacts | ✅ | `node_modules/`, `dist/`, `.next/`, coverage all gitignored |
| `.env.example` per app | ✅ | root, client, server-sql (+`.env.test`), server-mongo (+`.env.test`) |
| Migrations committed | ✅ | `20260707192741_init_test/migration.sql` tracked (was previously gitignored — fixed) |
| CI green | ✅ | All 4 jobs pass on `main` |
| Tests pass | ✅ | server-sql 115, server-mongo 115, client 35, e2e 6, Bruno 22×2 |

**All GATE checks pass.** This would survive a reviewer's first-five-minutes screen.

---

> **Update (2026-07-08, post-fix):** the P0 and all P1 items below have been fixed and verified (see `changelogs/` 09–15). Security dimension raised 1 → 2; revised score **20/20**. The remaining open items are P2 polish, tracked at the bottom.

## Score: 18 / 20 — Strong *(20/20 after the post-audit fixes)*

| # | Dimension | Score | Note |
|---|-----------|:---:|---|
| 1 | Correctness / it runs | 2 | Clean clone builds & runs; 2 client happy-path bugs (double navbar, blank-name 400) |
| 2 | Requirements fidelity | 2 | Boilerplate delivers exactly what it documents; dual-backend parity is real |
| 3 | Code organization | 2 | Clean layering (routes→controllers→services→repositories); no god-files |
| 4 | Readability | 2 | Good names, small functions, **no `any`, no `ts-ignore`, no dead debug logs** |
| 5 | Testing | 2 | 265 tests across all layers + e2e + API contract; CI runs them (sql variant of api/e2e only) |
| 6 | README / docs | 2 | Setup works; changelogs, best-practices, submission template all present |
| 7 | Error handling & validation | 2 | zod at every boundary; stacks gated to dev; minor unmapped-error 500s |
| 8 | Git hygiene | 2 | Atomic conventional commits; no secrets/artifacts |
| 9 | Security | **1** | argon2 + rotation + hashed Redis keys are excellent, **but moderator privilege-escalation hole** |
| 10 | Judgment / self-awareness | 2 | Documents trade-offs, "pick one backend", known-gaps |

Security is capped at 1 by the one real escalation bug — closing it (P0 below) lifts the total to 19–20.

---

## Red-flag sweep

Clean on the usual killers: no `: any`, no `@ts-ignore`/`@ts-nocheck`, no `eslint-disable`, no `console.log` in app code (only seed CLIs), no real `TODO/FIXME`, no `redis.keys()` scan (only comments noting it was avoided), no committed secrets/artifacts, no single giant commit.

---

## Gap punch-list

### P0 — correctness / security ✅ FIXED
- ~~**🔴 Privilege escalation.** `PATCH /users/:id` open to `MODERATOR` with `role`/`isActive` in the schema → self-promotion to `ADMIN`.~~ **Fixed:** role/isActive changes are ADMIN-only, with regression tests both backends (changelog 09).

### P1 — production-readiness / real bugs ✅ ALL FIXED
- ~~**🟠 API drift** (ObjectId → 500 on sql vs 404 on mongo).~~ **Fixed:** each backend validates its own id format → consistent 422 (changelog 09).
- ~~**🟠 Double `<Navbar>` + nested `<main>` on `/`.**~~ **Fixed** (changelog 10).
- ~~**🟠 Register rejects a blank optional name.**~~ **Fixed:** omit `name` when empty; verified live 201 (changelog 10).
- ~~**🟠 Concurrent-refresh race → spurious logout.**~~ **Fixed:** single-flight refresh promise (changelog 12).
- ~~**🟠 Duplicate-registration race → 500 not 409.**~~ **Fixed:** catch unique-violation (P2002 / 11000) → 409, with tests (changelog 11).
- ~~**🟠 Redis outage → 500 on every request.**~~ **Fixed:** rate limiter fails open (changelog 11).

### P2 — polish / DX
Resolved: ✅ dashboard + profile + client route protection (13) · ✅ `/auth/me` now called on the dashboard (13) · ✅ login/register redirect to `/dashboard` (13) · ✅ `handleApiError` surfaces field errors (12) · ✅ hydration-flash guard (12) · ✅ `/health`+`/ready` skip the rate limiter (11) · ✅ CI now runs mongo Bruno + e2e (15) · ✅ dead next.config rewrite removed (14) · ✅ dead `MESSAGES` import removed (10) · ✅ `BCRYPT_SALT_ROUNDS` note.

Still open (defensible to leave, or explicitly out of scope):
- Refresh token in `localStorage` — httpOnly cookie is safer but was deferred (needs a same-origin proxy); documented in `next.config.js`.
- No `/users/me` self-service write endpoint, so `/profile` is read-only.
- `zod`/`MESSAGES`/`APP_CONFIG` still unused client-side (no client-side form validation).
- `/auth/me` returns `{userId,email,role}` vs login's `{id,email,name,role}` — internal shape inconsistency.
- Redundant `User.userId`; `useAuth` hook bypassed by the auth pages.

---

## Verdict

**Ready to submit.** The P0 and every P1 have been fixed and verified (changelogs 09–15); the remaining items are P2 polish with clear "with more time" rationale. The foundation was already strong — real dual-backend parity, argon2 + rotating hashed refresh tokens, full test pyramid, green CI, clean git history — and now the security hole and the visible client bugs are closed, with a protected dashboard/profile area and CI covering both backends end-to-end.
