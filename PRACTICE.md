# 30-Minute Skill-Only Setup — Practice Runbook

**Goal:** stand up the ENTIRE working project (Next.js+Tailwind client, two Express
backends, JWT auth, DB+schema, `/users/stats` aggregation, BullMQ worker, PWA, Bruno,
Husky, CI) **green**, using ONLY this skill + shell commands — **no hand-written
code** — then spend the rest of your 30 minutes on the assignment feature.

## Is 30 minutes realistic? Yes — measured, not guessed.

The skill does **copy + verify**, not build-from-scratch. Real numbers on a warm
pnpm store (2026-07-09):

| Run | Backends | Result | Wall-clock |
|---|---|---|---|
| scaffold verify #1 | sql + mongo | **14/14 green** | 5.3 min |
| scaffold verify #2 | sql + mongo | **14/14 green** | 6.3 min |
| scaffold `--only sql` | sql only | **10/10 green** | ~4–5 min |

`pnpm install` is ~15 s on a warm store; the bulk is the two backends' test suites
running once. **Budget: ~6 min setup + ~24 min for the assignment.** Comfortable.

Cold machine (first-ever install, empty pnpm store): add ~5–10 min of downloads.
Still inside 30 min for a single backend; for both backends on a truly cold machine,
use `--only sql` to stay safe.

## The practice run — commands only, in order

```bash
# 1. Regenerate the whole project from the skill (both backends).
#    Use --only sql (or --only mongo) for a leaner, faster, single-backend run.
node ~/.claude/skills/scaffold-takehome-boilerplate/scaffold.mjs ./practice-app --name practice-app
#    (add --only sql   to halve the verify time and produce a purpose-built repo)

#    The script does EVERYTHING and refuses to say "ready" until green:
#    copy template → rename → seed .env → git init → pnpm install →
#    docker compose up (pg/mongo/redis) → prisma migrate → per-backend
#    lint · tsc · test · build  +  client lint · type-check · test · build →
#    PASS/FAIL table (non-zero exit on any red).

# 2. When it prints "✓ GREEN", the base is done. Enter it:
cd ./practice-app

# 3. Sanity-run it live (optional, ~10 s):
pnpm dev            # runs the kept stack + client
#    both-backends repo:  `pnpm dev` = server-sql (:5002);  `pnpm dev:mongo` = server-mongo (:5003)
#    --only <db> repo:    `pnpm dev` IS that backend — the `:mongo`/`:sql` suffixes DON'T exist.
#    → client on :3000, API on :5002 (sql) / :5003 (mongo), Swagger at <api>/docs
#    NOTE: the client `dev` script sets WATCHPACK_POLLING=true — polling avoids the pnpm+macOS
#    "EMFILE too many open files" Watchpack bug that otherwise 404s every route. If you ever see
#    that, confirm the dev script kept WATCHPACK_POLLING (see SKILL.md for the full diagnosis).

# 4. Start the assignment — this is the ONLY place you write code.
open ADAPT.md       # the mechanical "layer the feature across every layer" playbook
```

## What "green" already includes (so you don't rebuild it)

Auth (JWT + rotating refresh, argon2, RBAC) · two interchangeable backends
(Postgres/Prisma + Mongo/Mongoose, identical API) · `/users/stats` aggregation
(`$facet` / `groupBy`) · BullMQ background worker · PWA (offline SW + manifest) ·
Zod validation · Redis rate-limiting · Swagger/OpenAPI · audit trail · Bruno API
contract tests (both envs) · Vitest unit+integration (75% gate) · Puppeteer e2e ·
Husky + lint-staged + commitlint · GitHub Actions CI · SOC 2 docs.

## Gotchas the skill already solved for you (so a practice run stays green)

- **Flaky suite under load** → `vitest.config.ts` sets `hookTimeout/testTimeout: 30000`
  so slow per-file DB reconnects don't abandon `afterEach` cleanup (root cause of the
  "created 2 users, found 1" flakes). Battle-tested: 8/8 mongo + 2/2 full-scaffold green.
- **Worker × test isolation** → `register()` skips the real email enqueue under
  `NODE_ENV=test` (the enqueue path is unit-tested directly). Keeps Redis clean between tests.
- **BullMQ ioredis clash** → root `pnpm.overrides.ioredis` pins one version.
- **Scaffold never lies about green** → it exits non-zero and prints the failing
  checks; if you see "✓ GREEN", it really ran the full CI-equivalent gate.

## Practice tips

- Do it twice: once with both backends, once with `--only sql`, to feel the timing.
- Time yourself from `node scaffold.mjs …` to the "✓ GREEN" line — that's your setup cost.
- Don't touch the boilerplate during setup. The moment it's green, `open ADAPT.md`
  and put 100% of your remaining time into the assignment's actual feature.
- If a real assignment forbids template repos, that's the only case for the
  from-scratch build sequence in SKILL.md (4–8 hrs) — otherwise always use this.
