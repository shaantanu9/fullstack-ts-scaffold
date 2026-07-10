# fullstack-ts-scaffold

A **Claude Code skill** that regenerates a complete, production-shaped **full-stack TypeScript
boilerplate** from a frozen snapshot and **verifies it green** — a Next.js 15 client + an Express
API with **three interchangeable database backends** (Postgres/Prisma, MongoDB/Mongoose, Supabase),
JWT auth with rotating refresh tokens, a background worker, a PWA, OpenAPI docs, a full testing
pyramid, CI, and a SOC 2 control matrix.

Scaffolds a working, gate-green project in **~1–3 minutes** (measured), with a `--fast` mode for a
guaranteed-quick build even on a loaded machine.

> Built for take-home assignments and as a real project starter. The generated repo follows a strict
> layered architecture and a swappable-DB repository pattern — see the generated
> `docs/interview/` for a deep-dive.

---

## What you get

- **Monorepo (pnpm):** `client/` + `server-sql/` + `server-mongo/` + `server-supabase/` + `e2e/` + `bruno/`
- **Auth:** JWT access + **rotating** refresh tokens (argon2, Redis-backed revocable store, RBAC)
- **Backend:** Express + TS, layered (route → Zod validate → auth → rate-limit → controller → service → **repository** → DB), envalid config, central error envelope, health/readiness probes, OpenAPI/Swagger, audit trail, correlation IDs
- **Swappable DB:** one `UserRepository` interface, three byte-identical-above-the-repo implementations
- **Client:** Next.js 15 App Router, NextAuth v5 (Edge-safe split, silent refresh), Tailwind, PWA
- **Background jobs:** BullMQ worker (welcome email)
- **Testing:** Vitest (unit + integration) · Bruno (API contract) · Puppeteer (e2e)
- **Ops:** GitHub Actions CI (per-backend) + Security workflow (audit, gitleaks, CodeQL), Husky + lint-staged + commitlint, SOC 2 control matrix

---

## Prerequisites

| Tool | Needed for | Install |
|------|-----------|---------|
| **Node 20+** | everything | https://nodejs.org |
| **pnpm** | the monorepo | `npm i -g pnpm` |
| **Docker** | the full DB-backed gate (Postgres/Mongo/Redis) | https://docs.docker.com/get-docker |
| **Supabase CLI** | *only* the `--only supabase` variant's tests | `brew install supabase/tap/supabase` |

> No Docker? Use `--fast` (lint · type-check · build only) — it needs none of the above beyond Node + pnpm.

---

## Install

This repo **is** the skill. Clone it straight into your Claude Code skills directory:

```bash
git clone https://github.com/shaantanu9/fullstack-ts-scaffold \
  ~/.claude/skills/fullstack-ts-scaffold
```

Or use the installer (clones/copies into place):

```bash
git clone https://github.com/shaantanu9/fullstack-ts-scaffold
cd fullstack-ts-scaffold && ./install.sh
```

Claude Code picks up the skill from `SKILL.md`. You can also run the generator directly (below) —
it has **zero runtime dependencies** (plain Node).

---

## Usage

```bash
SKILL=~/.claude/skills/fullstack-ts-scaffold

# all three backends (default), full gate:
node $SKILL/scaffold.mjs ./my-app --name my-app

# one backend only (leaner, purpose-built):
node $SKILL/scaffold.mjs ./my-app --name my-app --only mongo   # or sql | supabase

# fast, guaranteed-quick working build (lint · type-check · build; skips DB tests):
node $SKILL/scaffold.mjs ./my-app --only mongo --fast

# grouped, story-telling git history (7 commits):
node $SKILL/scaffold.mjs ./my-app --only mongo --commits

cd my-app && pnpm db:up && pnpm dev      # client :3000, API :5002/5003/5004, Swagger /docs
```

**Flags:** `--fast` · `--budget <min>` · `--only sql|mongo|supabase` · `--commits` · `--no-install`
· `--no-verify` · `--no-db` · `--keep-changelogs`

> **Supabase variant note:** this repo is **secret-free** — it ships *no* Supabase keys. The
> `sql`, `mongo`, default, and `--fast` paths work with zero setup. For `--only supabase`'s tests,
> run `supabase start` then `supabase status -o env` and paste `SUPABASE_SERVICE_ROLE_KEY` /
> `SUPABASE_ANON_KEY` into `server-supabase/.env.test.example`. Until then the scaffold **skips**
> supabase tests (with a clear note) rather than failing — lint/type-check/build still run.

Every run prints **per-phase timings**, the **slowest three** checks, and a **≤ 20-min budget** line
(override with `--budget`). If a run exceeds budget it tells you exactly which lever to pull. See the
"Reliable setup in under 20 minutes" section of `SKILL.md`.

---

## Speed (measured 2026-07-10)

| Command | Result | Time |
|---------|--------|------|
| `--only mongo --fast` | green, boots live | **~1 min** |
| `--only mongo` (full gate, real DB) | 8/8 green | **~1–1.5 min** |
| `--only sql` (full, real Postgres) | 10/10 green | **~2 min** |
| default (all 3, real Postgres+Mongo+Supabase) | 18/18 green | **~3 min** |

The 20-minute budget is headroom. The *only* way to blow it is running the DB test step on a Docker
VM already saturated with other containers — the scaffold detects that and points you at `--fast`.

---

## Ports (per backend)

| Backend | API | Redis | Notes |
|---------|-----|-------|-------|
| `server-sql` | 5002 | 6381 | Postgres + Prisma (default) |
| `server-mongo` | 5003 | 6382 | MongoDB + Mongoose |
| `server-supabase` | 5004 | 6383 | supabase-js, needs the Supabase CLI stack |

---

## How it works

- **`template/`** — a frozen, secret-free snapshot of the whole boilerplate (~390 files). No real
  `.env`, no `node_modules`. This is the payload.
- **`scaffold.mjs`** — a zero-dependency Node regenerator: copies the template → renames → prunes to
  the chosen backend → seeds `.env` from examples (generates a real `AUTH_SECRET`) → `git init` →
  `pnpm install` → brings up local DBs → runs the gate (lint · type-check · test · build per backend
  + client) → prints a PASS/FAIL table and exits non-zero on any red.
- **`SKILL.md` / `ADAPT.md` / `PRACTICE.md`** — the skill definition, how to layer an assignment on
  top, and a timed practice walkthrough.

To improve the boilerplate, edit the reference repo, then re-freeze `template/` from its `main`
(recipe in `SKILL.md`).

---

## License

MIT — see [`LICENSE`](./LICENSE).
