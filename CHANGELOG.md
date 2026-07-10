# Changelog

All notable changes to this skill are documented here.

## [1.0.0] — 2026-07-10

First public release.

### Included
- **Frozen template** (~390 files, secret-free) of a full-stack TypeScript boilerplate:
  Next.js 15 client + three Express backends (Postgres/Prisma, MongoDB/Mongoose, Supabase).
- **`scaffold.mjs`** — zero-dependency Node regenerator that writes the repo, seeds env
  (generates a real `AUTH_SECRET`), inits git, installs, brings up local DBs, and runs the
  full gate (lint · type-check · test · build per backend + client) with a PASS/FAIL table.
- **Three backend variants** via `--only sql|mongo|supabase`, plus the default all-three build.
- **`--fast` mode** — lint · type-check · build only (skips the DB-backed test step); a
  guaranteed-quick, still-runnable build that needs no Docker.
- **Per-phase timing + slowest-three + a ≤ 20-min budget** (override with `--budget <min>`),
  and a **Docker-load preflight** that warns when a saturated Docker VM will slow the gate.
- **`--commits`** — a 7-commit, reviewer-friendly grouped git history.
- **`SKILL.md` / `ADAPT.md` / `PRACTICE.md`** — skill definition, assignment-layering guide,
  and a timed practice walkthrough.

### Verified (2026-07-10)
- `--only mongo` full gate 8/8 green + boots live (register/login/`/me`/stats).
- `--only sql` full 10/10 green; `--only supabase` full 8/8 green (live Supabase stack).
- default (all three, real Postgres+Mongo+Supabase) 18/18 green in ~3 min + boots live.
- `--fast` green in ~1 min and serves.

[1.0.0]: https://github.com/shaantanu9/scaffold-takehome-boilerplate/releases/tag/v1.0.0
