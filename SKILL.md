---
name: fullstack-ts-scaffold
description: Use when scaffolding a full-stack TypeScript take-home, or deciding its commit order, speed budget, code-quality bar, or how to parallelise a build across agents. Ships a frozen `template/` + `scaffold.mjs` that regenerates a working repo and verifies it GREEN in <=30 min, plus a minimal walking skeleton (bootstrap measured at 1m04s). Covers: README-first/walking-skeleton commit order and its gate, `npm run dev` returning 404 with EMFILE (tsx watch), Docker image shrinking (1.09GB->316MB), React Testing Library wiring traps, and debugging rules. Triggers on "set up the boilerplate", "scaffold the take-home starter", "bootstrap the monorepo in 30 minutes", "new full-stack ts project", "walking skeleton", "commit order", "parallel agents build", "npm run dev 404", "EMFILE watchpack", "shrink docker image".
---

# Scaffold: Full-Stack TypeScript Take-Home Boilerplate

## Overview

Builds a production-shaped pnpm monorepo: a **Next.js 15** client and **three fully-segregated Express backends** exposing an identical API — `server-sql` (Postgres + Prisma, port 5002/redis 6381), `server-mongo` (MongoDB + Mongoose, port 5003/redis 6382), and `server-supabase` (`@supabase/supabase-js`, no ORM, port 5004/redis 6383, local Supabase-CLI stack). Ships JWT auth with rotating refresh tokens, Zod validation, RBAC, Redis-backed rate limiting, Swagger, a security audit trail, Vitest (unit + integration) + Bruno API + Puppeteer e2e, GitHub Actions CI, Husky/lint-staged/commitlint, and a SOC 2 control matrix.

**Core principle:** each backend is standalone (shares no files with the others); `client/`, `e2e/`, `bruno/` are DB-agnostic (HTTP only). Deleting any backend leaves a working repo. For the target architecture and reviewer rubric, pair with `takehome-fullstack-boilerplate` and `takehome-assignment-audit`.

## Fast path (≤ 30 min) — regenerate from the skill's own frozen bundle

**Do this, not the from-scratch build sequence below.** This skill ships a
verified, secret-free snapshot of the whole repo in `template/` (~390 files: client,
all three backends, e2e, bruno, CI, Husky, docs) plus a zero-dependency Node regenerator.
It writes the repo out, seeds env, inits git, installs, brings up local Docker DBs,
and **runs the exact `ci.yml` gate — it will not report "ready" until green.**

```bash
# all three backends (default):
node ~/.claude/skills/fullstack-ts-scaffold/scaffold.mjs ./my-assignment --name my-assignment

# one backend only (leaner, purpose-built submission):
node .../scaffold.mjs ./my-assignment --name my-assignment --only sql   # or --only mongo | --only supabase

# grouped, story-telling git history (7 commits) instead of one:
node .../scaffold.mjs ./my-assignment --only mongo --commits

# fast, guaranteed-quick working build (lint·tsc·build only, skips DB tests):
node .../scaffold.mjs ./my-assignment --only mongo --fast

# flags: --fast  --budget <min>  --commits  --no-install  --no-verify  --no-db  --keep-changelogs
```

Every run now prints **per-phase timings** (install, each `db:up`, each check), the **slowest
three** checks, and a **≤ 20-min budget** line (override with `--budget <min>`). If a run exceeds
the budget it prints exactly which lever to pull. See **"Reliable setup in under 20 minutes"** below.

**`--only supabase`** keeps `server-supabase` (port 5004), promotes its `*:supabase`
scripts to the base names, points the client at 5004, and its `db:up` runs
`docker compose up` (redis 6383) **and** `supabase start` (the local Supabase-CLI
stack on :54321). Its test suite needs that CLI stack — `tests/setup.ts` opens a DB
connection globally, so there is no unit-only subset. The scaffold detects the
`supabase` CLI: present → full `lint · tsc · test · build` (verified **8/8 green,
1.2 min**, 2026-07-10); absent → it runs `lint · tsc · build` and **skips** the test
step with a clear `no supabase cli` note (never a false red). `server-supabase` is
intentionally leaner — it has ImageKit uploads but **no BullMQ worker/`/users/stats`
parity** (the `--commits` grouping tolerates the missing paths).

**`--commits`** lays the same green tree down as a logical, reviewer-friendly history
instead of one `chore: scaffold` commit — verified 7 commits, tree fully grouped, 8/8 green:
`docs: README/license` → `chore: workspace + tooling + Husky + CI` →
`feat(server): backend` → `feat(client): Next.js + Tailwind` →
`feat: integrations (ImageKit + BullMQ worker + PWA)` → `test: Bruno + Puppeteer e2e` →
`docs: SOC 2 compliance + security + changelogs`. Integration files are carved out of the
backend/client "core" commits via git `:(exclude)` pathspecs. Then keep the same cadence for
your assignment (one layer = one conventional commit; commitlint + lint-staged enforce it).

What it does, in order: copy `template/` → freshen (drop reference-repo
changelogs/specs) → rename → prune the unused backend → seed `.env` from
`.env.example` (real secrets never in the bundle; optional integrations 503 when
blank) → `git init` + first commit → `pnpm install` → `docker compose up` pg/mongo/
redis → prisma generate + migrate the test DB → per-backend **lint · tsc · test ·
build** + client **lint · type-check · test · build** → PASS/FAIL table, non-zero
exit on any red. **Then open `ADAPT.md`** to layer the assignment feature on top.
For a timed, commands-only walkthrough to practice the ≤30-min setup, see **`PRACTICE.md`**
(measured 2026-07-09: two full scaffolds 14/14 green in 5.3 / 6.3 min on a warm store).

Elapsed is install-dominated (~15–25 min on a warm pnpm store). Writing the ~80
files by hand (the build sequence below) is 4–8 hrs — that path is kept only as the
reference for *why* each file exists, and for regenerating the bundle.

### Refresh the bundle (when you improve the boilerplate)

The `template/` snapshot must be re-frozen from the reference repo after you change
it, so the skill stays current:

```bash
cd <reference-repo>   # e.g. boilerplate_nexjs_express, on a clean, green, committed HEAD
rm -rf ~/.claude/skills/fullstack-ts-scaffold/template
mkdir  ~/.claude/skills/fullstack-ts-scaffold/template
git archive HEAD | tar -x -C ~/.claude/skills/fullstack-ts-scaffold/template
```

`git archive HEAD` freezes exactly the tracked files — no `node_modules`, no real
`.env` (gitignored), no `.next`/`dist`, no untracked WIP. Verify: `find template -name .env | grep -v example` must be empty.

**Current snapshot tier (re-frozen 2026-07-10 from `main`, `--only supabase` verified 8/8 green in
1.2 min):** 3 backends (`server-sql` + `server-mongo` + `server-supabase`) + client + e2e + Bruno,
WITH ImageKit uploads, OpenAPI/Swagger, audit-trail + request-correlation-IDs, SOC 2 files, the
full CI, **plus the add-ons:** the **`/users/stats`** aggregation endpoint (Prisma `groupBy` + Mongo
`$facet`), the **BullMQ background worker** (welcome-email job, `pnpm --filter <server> worker`),
and client **PWA** (Next `app/manifest.ts` + offline-first `public/sw.js` + registrar). The stats
endpoint, worker, and PWA are at **sql+mongo parity**; `server-supabase` is intentionally leaner
(ImageKit uploads only, no worker/stats). Each add-on has its own atomic skill:
`mongodb-aggregation`, `background-worker`, `pwa-service-worker`, `auth-refresh-token`, `bruno-cli`,
`nextjs-client`, `imagekit-express-nextjs`.

**`server-supabase` is now INCLUDED in the bundle** (it was previously stripped). The generic
`git archive HEAD | tar -x` above already keeps it — do **not** strip `server-supabase/`, its
`pnpm-workspace.yaml` line, its `*:supabase` root scripts, or the supabase Bruno env. `main`'s
`pnpm-lock.yaml` already covers all three backends, so **no `--lockfile-only` step is needed**. Only
re-freeze from a clean, green, committed `main` — never a WIP feature branch. Note the supabase
variant needs the **Supabase CLI** (`brew install supabase/tap/supabase`) for its test/dev DB.

## Commit order: the walking skeleton must be clickable by commit 2

**Learned the hard way 2026-07-09** (photo-upload-pipeline). A 29-commit build with green tests
throughout, and the owner could not click, curl, or Bruno *anything* until commit 20 — the UI and
the API contract landed near the end. Tests passing is not the same as being able to steer. You
lose the ability to notice you are building the wrong thing.

**The rule: nothing lands before the thing that proves it runs.**

| # | Commit | Contains | Gate before you may proceed |
|---|--------|----------|------------------------------|
| 1 | `docs: add README` | Problem, stack + why, how to run, how to test, scope in/out. Written **before** the code, so it drives it. Numbers get corrected later. | It reads like a plan you'd follow |
| 2 | `chore: scaffold the walking skeleton` | Both workspaces, **every folder + index file**, lint/format, Husky + lint-staged + commitlint, **a server smoke test AND a component test for the four states**, Bruno collection hitting `/health`, `docker compose up`, CI | **`npm run dev` → browser shows a page that calls the API. `bru run` green. `verify` green. This is the gate.** |
| 3 | `feat: define the domain contract` | Types/interfaces + the API shape. No logic. | `npm run typecheck` |
| 4+ | one feature = one commit, each with its test | | `npm run verify` |
| last | `docs: correct the README` | Real numbers, real limitations | The README makes no claim you did not test |

Then, before you submit: score it with `takehome-assignment-audit`, and write the round-2 defence
pack with `acing-takehome-assignments` — drafting the defence is what finds the bug your tests
missed.

A skeleton that is not *exercised* is not a skeleton. `/health` returning `{"ok":true}` proves
nothing about the wiring. Commit 2's smoke path must cross every layer you intend to build on:
**browser → client fetch → CORS → route → middleware → database → response → render.**

### Commit 2 artifact manifest — every file, and the one thing each gets wrong

Copy this list. The right-hand column is the part people omit, and every omission has cost an hour
somewhere in this skill's history.

| File | Purpose | The non-obvious requirement |
|---|---|---|
| `.nvmrc` | pin the Node major | CI uses `node-version-file: .nvmrc`, not a hardcoded version |
| `.editorconfig` | whitespace | — |
| `.prettierrc` | one formatter | `printWidth` must match `commitlint`'s `body-max-line-length`, or a commit body quoting code gets reflowed into nonsense |
| `eslint.config.js` | flat config, both workspaces | `no-explicit-any: error`; ignore `**/next-env.d.ts` (Next regenerates it and it fails `triple-slash-reference`); `no-console: off` for `**/tests/**` **and** `**/lib/logger.ts` only |
| `.gitignore` | keep artifacts out | `.env` ignored, `.env.example` **un**-ignored; `*.tsbuildinfo` |
| `package.json` (root) | npm workspaces | Root is `"type": "module"`; **`web` must have no `type`** — setting it breaks `next dev` |
| `server/package.json` | | `"type": "commonjs"` explicitly, matching its tsconfig. `dev` is `node --watch --import tsx src/index.ts`, never `tsx watch` |
| `server/tsconfig.json` + `tsconfig.build.json` | typecheck vs emit | Typecheck must include `tests/`; build must exclude them |
| `web/next.config.ts` | | `output: 'standalone'`; `outputFileTracingRoot` pinned to the repo root; `eslint.ignoreDuringBuilds: true` |
| `web/next-env.d.ts` | | **Commit it.** Next gitignores it, and `tsc --noEmit` then fails on a clean runner |
| `web/vitest.config.mts` | component tests | `.mts` (plugin is ESM-only); `esbuild.jsx: 'automatic'`; re-declare tsconfig `paths` aliases |
| `web/vitest.setup.ts` | | `afterEach(cleanup)`; spy `URL.createObjectURL`/`revokeObjectURL` |
| `.husky/pre-commit` | | `npx lint-staged`. **Never `npm test`** — `husky init` writes that by default, and a 13-second hook is a bypassed hook |
| `.husky/commit-msg` | | `npx --no -- commitlint --edit "$1"`. **`chmod +x` both hooks** or git ignores them silently |
| `.lintstagedrc.json` | | `eslint --fix` then `prettier --write` for `*.{ts,tsx}` |
| `commitlint.config.mjs` | | `.mjs` if the root is ESM. Disable `subject-case`: a subject may start with `sharp`, `pHash`, `argon2id` |
| `bruno/bruno.json` + `environments/local.bru` | contract tests | `bru run . -r --env local` — there is **no** `--recursive` and **no** `--cwd` in bru 3.x |
| `Dockerfile` | | multi-stage; `node:22-bookworm-slim`; `npm prune --omit=dev`, never `--omit=optional`; `HOSTNAME=0.0.0.0` on the web stage |
| `.dockerignore` | | exclude `node_modules`, `.next`, `dist`, `.git`, `coverage`, `.env` |
| `docker-compose.yml` | | demo API runs `NODE_ENV=development` (production fails closed without a bucket) but still points at a **real** database |
| `.github/workflows/ci.yml` | | `format:check` → `lint` → `typecheck` → `test` → `build` → **Bruno**, in that order. `npm ci` needs the committed lockfile |
| `bin/new-project.sh` | bootstrap the next repo | `git archive`, not `cp -R` — copies only tracked files |

**Scripts the reviewer will actually type**, all of which must exist:

```jsonc
"dev":        "concurrently -n api,web -c blue,magenta \"npm:dev:server\" \"npm:dev:web\"",
"verify":     "npm run format:check && npm run lint && npm run typecheck && npm run test && npm run build",
"test":       "npm run test --workspace=server && npm run test --workspace=web",
"test:api":   "cd bruno && bru run . -r --env local",
"test:api:ci":"concurrently -k -s first -n api,bru \"npm run dev:server\" \"wait-on -t 60000 http-get://localhost:4000/health && npm run test:api\"",
"docker:up":  "docker compose up --build"
```

**Writing the commit message itself has a trap.** A `git commit -m "...backtick-quoted `word`..."`
in a shell runs `word` as a command and silently deletes it from the message. Use `-F <file>` or a
quoted heredoc for anything with backticks.

### The 10-minute testability check

Before writing a single feature, a reviewer (or you) must be able to do all three:

1. `npm run dev`, open `localhost:3000`, see data that came from the API.
2. `npm run test:api` (Bruno) green, or open the collection in the Bruno GUI and click Send.
3. `npm run verify` green — the exact command CI runs, in the same order.

If any of the three fails, **stop and fix it.** Everything you build on an unverified skeleton
inherits its bugs, and you will attribute them to your feature code.

### Practical bits that make commit 2 real

- `husky init` writes `npm test` into `pre-commit`. **Replace it with `lint-staged`.** A
  13-second suite on every commit teaches you to type `--no-verify`, and a bypassed hook enforces
  nothing.
- Use `concurrently` for `dev`, not `cmd-a & cmd-b` — a bare `&` orphans one process on Ctrl-C.
- Give Bruno a **fixture** it can upload and a pre-request script that generates a unique email,
  so re-runs don't 409. A collection that only passes once is a collection nobody runs twice.
- `docker compose` should boot a *real* database, not the in-memory dev fallback — that is the
  only way the compose file proves anything.
- One `verify` script. Reviewers do not read your CI yaml to find out what to run.

## Reliable setup in under 20 minutes (the guarantee, and how)

A clean scaffold+verify is **~1 minute**, not 20 — the 20-min budget is headroom. The scaffold now
makes that reliable and measurable. **Measured 2026-07-10 (this machine):** `--only mongo` full gate
**8/8 green in 1m07s**; `--only mongo --fast` **green in 54s** (and the app boots + serves
register/login/health). The *only* time this ever blew up was a **49-minute** run — caused entirely
by **26 Docker containers thrashing the Docker VM** during the DB test step. Nothing about the code
was slow; the machine was.

**So the whole game is the DB test step under Docker contention.** Two guaranteed paths:

1. **Default (full gate) on a quiet Docker.** `node scaffold.mjs ./app --only mongo`. Runs
   lint·tsc·**test**·build with real DB+Redis. Fast when the Docker VM isn't overloaded. The scaffold
   does a **Docker-load preflight**: if > 12 containers are running it warns the DB step may be slow
   and to free resources or use `--fast`. Free the VM with `docker ps` → stop stacks you don't need
   (e.g. an idle `supabase stop`), then re-run.
2. **`--fast` — the guarantee.** `node scaffold.mjs ./app --only mongo --fast`. Runs
   lint·type-check·**build** only, **skips the DB-backed test step** (the slow, contention-sensitive
   part) and never touches Docker. You get a **working, runnable** build in ~1 min regardless of
   machine load (a green build means it compiles and boots — verified: the `--fast` output serves
   `register` 201 / `/health` 200). Then run the full suite once the machine is quiet:
   `cd app && pnpm db:up && pnpm test`.

**How to read the output.** Every check prints `[Ns]`; the summary lists the **slowest three** and an
elapsed-vs-target line. If elapsed > budget, the scaffold tells you the two levers (free Docker / use
`--fast`). Tune the target with `--budget 15`.

**Do-this checklist for a guaranteed <20-min working setup:**
- Warm the pnpm store once (any prior `pnpm install` on this machine) — install is then ~1 min.
- `docker ps` — if it's crowded, either stop idle stacks **or** add `--fast`.
- Prefer **`--only <db>`** over the default (one backend installs + verifies far less than three).
- Use `--fast` when you just need a runnable app now; run `pnpm test` later for full verification.
- Watch the per-phase timings — the slowest line tells you exactly where any minutes went.

## Speed: where the time actually goes

Measured, this machine, this stack. Optimise the top of the list; the rest is noise.

| Step | Cost | Parallelisable? |
|---|---|---|
| `npm install` (no native modules) | ~60 s | **No.** Start it in the background the moment the manifests exist |
| `npm install` (sharp + tfjs + argon2) | ~2 min | No. argon2 and sharp ship prebuilds; only tfjs is genuinely heavy |
| `next build` | ~15 s | No |
| Server unit + integration suite | ~15 s | No |
| Domain code + its tests | the real work | **Yes** — pure, imports nothing |
| Infra: lint, husky, CI, Bruno, Docker | ~10 min solo | **Yes** — no domain knowledge |
| `docker compose build` | 3–5 min | Yes, but keep it off the critical path |

**The two numbers that matter.** Bootstrapping from a frozen skeleton: **1m 04s** to two commits
with `verify` green. Building a skeleton from nothing with three parallel agents: **14m 47s**.

Where those 14m47s actually went — I first wrote "about half is `npm install` and `next build`",
and it is not true; the tooling is not the bottleneck:

| Span | Cost | What it was |
|---|---|---|
| 0:00–0:49 | 49 s | solo: README, manifests, folder tree |
| 0:49–1:59 | 70 s | `npm install` (background, overlapped with writing) |
| 2:13–4:13 | 2m 00s | three agents writing files |
| 4:13–9:57 | **5m 44s** | **gate iterations** — `prettier --check` failed, then a `.next` collision |
| 9:57–12:31 | 2m 34s | boot dev servers, Bruno |
| 12:31–14:47 | 2m 16s | browser check, commit |

**The bottleneck is gate iterations, not tooling.** `npm install` was ~8% and fully overlapped.
Every minute of that 5m44s was a failure this skill now prevents: run `npm run format` after
merging agent output, and wait for agents to report before touching `.next`. Read the Gotchas
before you build, and this collapses.

**So the way to be fast is not to type faster.** It is:

1. **Start from a skeleton you already verified.** `bin/new-project.sh` copies tracked files with
   `git archive`, makes commits 1 and 2, installs, and refuses to print `ready` unless `verify`
   passes.
2. **Kick off `npm install` in the background** as soon as `package.json` exists, then keep writing.
3. **Parallelise infra against pure domain**, never two agents against one file.
4. **Do not debug what a skill already knows.** Every hour in the Gotchas table below was paid for
   once. The single most expensive failure in this session — a dev server that answered `/health`
   and 404'd every page — is one line in a package.json.

## Code quality: the bar, and how it is enforced

Not aspiration — each item is a rule with a mechanism, because a bar without a mechanism is a wish.

| Rule | Mechanism |
|---|---|
| `any` is banned | ESLint `@typescript-eslint/no-explicit-any: error` |
| Console goes through the logger | `no-console`, with an override scoped to `lib/logger.ts` only |
| Config validated once, fails closed | zod at import; production refuses to boot on a missing required var |
| `parseInt(x) \|\| d` is a bug | Numeric env vars via `z.preprocess` — see Gotchas |
| One error boundary | A single `errorHandler`; unknown errors are logged and answered with a generic 500 |
| Nothing leaks an ORM's message | Integration test asserts the 404 body has no `CastError`/stack frame |
| Every remote-data screen has four states | Loading, error+retry, empty, data — with a test per state |
| Ownership is a `where` clause | Someone else's row is a **404, not a 403** — a 403 confirms it exists |
| Commits are atomic and conventional | `commitlint` in `commit-msg`; `lint-staged` in `pre-commit` |
| A slow hook is a bypassed hook | `pre-commit` runs `lint-staged`, never the suite |

**The test pyramid you actually need**, in the order it pays:

1. **Unit tests on the pure domain.** Hashing, scoring, reconciliation. No I/O, no framework. This
   is where the interesting logic lives and where a bug is cheapest to find.
2. **Integration tests through the HTTP surface** (supertest + in-memory DB). Assert the *shape* of
   failure too: a malformed id is a 404 whose body contains no ORM text.
3. **Component tests** (Vitest + React Testing Library, jsdom) for the four states. Mock the API
   client, not the network. Whether the server is reachable is Bruno's job; mixing them produces a
   test that fails for reasons unrelated to the component.
4. **API contract tests** (Bruno) against a running server. Unit tests pass while the wiring is
   broken.
5. **One browser check.** Not a suite — one look. It is the only thing that catches a dead app
   behind a green gate.

**Test the logic that carries risk, not the markup.** On a client, that is the hook: bounded
polling, geometric backoff, single-flight refresh, blob-URL revocation, and the local-rejection
delete path that must never reach the server. Six assertions on a hook beat sixty snapshot tests.

**Prove your tests can fail.** Mutate the code and check exactly one test goes red:

```bash
# force the poll to run forever      -> only "STOPS polling once nothing is in flight" fails
# make the local delete hit the API  -> only "removes a client-side rejection ..." fails
```

A test that stays green under a mutation of the thing it claims to test is decoration. This takes
two minutes and is the only evidence a suite is worth its runtime.

**Let the tests improve the component.** In this codebase they exposed a loading state with
`aria-busy` and no `role`, and a tooltip hidden by a CSS class rather than unmounted. If a state is
hard to select in a test, it is hard to perceive.

A skeleton with zero frontend tests is not "minimal", it is unfinished: every component is then
verified by someone looking at a screenshot, which does not survive a refactor.

## Debugging rules this workflow earned

**REQUIRED BACKGROUND:** superpowers:systematic-debugging — root cause before fix. These are the
specific traps this stack produces.

1. **Change exactly one variable.** Two changes at once produce a confident wrong conclusion. In
   this session `"type": "module"` was blamed for a 404 because it was removed *and* the process
   was restarted differently. It was innocent; the commit had to be corrected in the history.
2. **Read the shape of the failure before the content.** `10 requests, 0 assertions, 0 ms` means
   *never executed* — the server was down. It does not mean the assertions failed. `Test Files 1
   failed | 12 passed` while `Tests 118 passed` means a whole file failed to *collect*.
3. **Re-run a flake before diagnosing it.** A suite that fails once and passes six times — while a
   Docker build saturates the CPU — is an unstable snapshot, not a bug. Then *reproduce the load*
   before claiming a fix: run the suite with every core pinned by busy loops.
4. **Green build ≠ working binary.** `docker build` says nothing about native modules. `npm run
   verify` says nothing about `npm run dev`, because `next build` never watches.
5. **Suspect your own harness first.** Before blaming an agent, a library, or the machine: did the
   server you are curling actually start? Are two of your own processes writing the same `.next`?
6. **When you cannot isolate it, say so.** Write down what was ruled out. The next person's hour is
   worth more than your certainty.

## Parallelising the build with agents — split on dependency boundaries, not on "two agents = 2x"

Two agents in one working directory clobber each other. Two agents on work that shares a
dependency serialise anyway, and then merge badly. The split that actually works:

```
        [ SOLO, ~5 min ]  freeze the contract: domain types + API shape + folder layout
                 │             (everything downstream imports this; it cannot be parallel)
      ┌──────────┴──────────┐
      ▼                     ▼
 Agent A: INFRA        Agent B: PURE DOMAIN
 scaffold, lint,       hash / blur / dedup /
 husky, docker,        validators + their unit
 bruno, CI            tests. Zero imports from
 (no domain knowledge) infra. Pure functions.
      └──────────┬──────────┘
                 ▼
        [ SOLO ] wire them together, integration tests, README
```

**Why it works:** pure domain logic imports nothing from the scaffold, and the scaffold cares
nothing about the domain. They touch disjoint files. Their only contract is the type file frozen
in step 1.

Rules, all of them non-negotiable:

- **One agent = one branch = one worktree** (`git worktree add`), or strictly disjoint paths with
  the shared files (`package.json`, lockfile, root configs) owned by **you**, never an agent.
  Two agents editing `package.json` is a guaranteed conflict.
- Tell each agent its scope *and* what it must not touch. "Another agent is editing X
  concurrently" is a sentence that works.
- **Make each agent verify its own work end-to-end** and report the verbatim output — `bru run`
  summary, `docker compose up` + a real `curl` of `/health`. An agent that reports success on a
  file it never executed has cost you more than it saved.
- Do **not** parallelise: anything touching the same file; work where B needs A's output;
  the final wiring; the README.

**Honest expectation.** The saving is on the infra half, which is the boring half. Domain work
still costs what it costs — you have to think. Expect to compress a ~60-minute build to ~40, not
to 30. The bigger win is that infra lands *first*, so you are steering from minute 10 instead of
minute 50.

### Measured run (2026-07-09, photo-upload-pipeline)

Two agents, disjoint paths, `package.json` owned by the main session.
Agent A → `bruno/` (10 chained requests, fixture, README). Agent B → `Dockerfile`,
`docker-compose.yml`, `.dockerignore`, `docker/`. **Zero collisions.** Both ran ~9–15 min wall
clock while the main session installed Husky, wrote `commitlint.config.mjs`, and rewrote the
scripts. Serially this is easily 30+ minutes.

Three things that generalise:

1. **The disjoint-path rule held.** `git status` showed only the agents' new paths plus the one
   file I edited. No agent touched the manifest.
2. **Verify your own harness before blaming the agent.** Agent A's Bruno run was green; mine
   showed *10 failed, 0 assertions, 0 ms*. The collection was fine — **my server had died**, so
   every request was connection-refused. `0 assertions / 0 ms` means "never executed", not
   "assertion failed". Read the shape of the failure before you accuse anyone.
3. **The bugs were in the glue I wrote, not the agent's output.** My `test:api` script used
   `bru run --recursive --cwd bruno`; neither flag exists in `bru` 3.x. Running it is what found
   that. The correct form is `cd bruno && bru run . -r --env local`.

**Wire the collection into CI in the same commit.** `concurrently -k -s first` boots the API,
`wait-on http-get://localhost:4000/health` blocks until it's ready, Bruno runs, then everything
gets SIGTERM'd. Unit tests pass while the wiring is broken; a green contract run is what proves
a client can actually talk to you.

## When to use

- Bootstrapping a new full-stack TS take-home starter or reference repo.
- Recreating this exact stack in a fresh repo.
- Not for auditing an existing repo (use `takehome-assignment-audit`) or for a single-backend app.

## Structure produced

```
├── client/            # Next.js 15 App Router (zustand, axios, tailwind, vitest+RTL)
├── server-sql/        # Express — Prisma/Postgres        (port 5002, redis 6381)
├── server-mongo/      # Express — Mongoose/MongoDB        (port 5003, redis 6382)
├── server-supabase/   # Express — supabase-js, no ORM     (port 5004, redis 6383, supabase-cli)
├── e2e/               # Puppeteer, DB-agnostic (E2E_SERVER_FILTER picks backend)
├── bruno/             # API collection with `sql` + `mongo` + `supabase` environments
├── scripts/free-port.mjs
├── .github/workflows/{ci.yml,security.yml}   .github/dependabot.yml
├── .husky/{pre-commit,commit-msg}   commitlint.config.js
├── docs/{COMPLIANCE.md,SUBMISSION_TEMPLATE.md}   SECURITY.md
├── LICENSE  CONTRIBUTING.md  .editorconfig  .nvmrc
├── README.md  TAKEHOME_BEST_PRACTICES.md
└── package.json  pnpm-workspace.yaml
```

Each backend: `src/{config,constants,controllers,database,docs,middlewares,routes,services,utils,validations,app.ts,server.ts}` + `tests/{unit,integration}`. Layering: **route → validate → auth → rate-limit → controller → service → repository → DB**. Services depend only on a `UserRepository` interface.

## Build sequence

1. **Workspace:** `pnpm-workspace.yaml` (`client`, `server-sql`, `server-mongo`); root `package.json` with default + `:mongo` script variants, `predev`/`free:ports` (via `scripts/free-port.mjs`), `prepare: husky`.
2. **server-sql:** Express app (helmet → cors → rate-limit → json → cookie → routes), envalid env validation (32-char secret floor), Prisma `User` model + repository implementing `UserRepository`, argon2 passwords, JWT access + **rotating** refresh (see gotchas), Zod schemas, central error handler + typed `ApiError`, Winston logger, `/health` + `/ready`, OpenAPI at `/docs`. Vitest unit + Supertest integration; 75% coverage gate.
3. **server-mongo:** copy server-sql, keep every DB-agnostic file byte-identical, swap only the data layer to Mongoose (connection singleton, `User` model matching the Prisma schema, `MongooseUserRepository`, `checkDatabaseHealth` via `db.admin().ping()`), env → `mongodb://`, port 5003, redis 6382.
4. **client:** Next.js App Router, zustand auth store (persist), axios with single-flight refresh interceptor, typed API layer, component/hook/store tests.
5. **Shared:** e2e (Puppeteer, `E2E_SERVER_FILTER`), Bruno (`sql`/`mongo` envs), security audit log + request-id middleware in both servers.
6. **Gates:** `ci.yml` (per-backend + client + api/e2e jobs), `security.yml` (pnpm audit + gitleaks + CodeQL), Dependabot, Husky (`pre-commit` → lint-staged per-package `.lintstagedrc.json`; `commit-msg` → commitlint), `docs/COMPLIANCE.md` (SOC 2 matrix), `SECURITY.md`.
7. **Verify** (bring up infra first): for each backend `pnpm --filter <s> exec tsc --noEmit && pnpm --filter <s> lint && pnpm --filter <s> test && pnpm --filter <s> build`; client the same; then `pnpm test:e2e`.

## Gotchas (battle-tested — these WILL bite)

| Symptom | Fix |
|---|---|
| `rate-limit-redis` peer error (wants express-rate-limit v8) | Pin `rate-limit-redis@^4` for express-rate-limit v7; `sendCommand: (...a)=> (redis.call as (...x:string[])=>Promise<RedisReply>)(...a)` |
| Refresh "rotation" returns the SAME token | `jwt.sign` is deterministic per second — add `jwtid: randomUUID()` so each refresh token is unique |
| `redis.keys()` scan for refresh lookup | Store key = `refresh_token:{userId}:{sha256(token)}`, value `'1'` → O(1) `get`; rotate = del old + store new |
| Two backends' Redis clash on one port | Give each a distinct host port (6381 / 6382) + distinct app port (5002 / 5003); `E2E_*` and CI set `PORT` explicitly |
| pnpm Dockerfile fails (`npm ci`, no lockfile) | Self-contained Dockerfile, build context = the server folder, `npm i -g pnpm@9 && pnpm install --no-frozen-lockfile` |
| lint-staged can't find eslint from root | Per-package `.lintstagedrc.json` scoped to `{src,tests}/**/*.ts`; lint-staged runs from the config's dir |
| `--coverage` fails: missing `@vitest/coverage-v8` | Add it as a dev dep in each package before setting `coverage.thresholds` |
| Mongo integration tests hang/skip | Mongoose needs explicit `connect()` in `beforeAll` (Prisma connects lazily); `deleteMany({})` + `redis.flushdb()` between tests |
| Mongo `findById` throws CastError on UUID test ids | Guard invalid ObjectId → return `null` so "not found → 404" matches the Prisma behavior |
| envalid rejects `mongodb://` URL? | It doesn't — `url()` accepts any scheme; keep DATABASE_URL as `url()` for both |
| eslint type-check errors on `dist/`/config files | lint only `src tests`; keep `dist/` gitignored and out of the lint glob |
| **Flaky suite under load** — "created 2 users, found 1", "DELETE → 404", intermittent (worse on `server-mongo`) | Root cause is Vitest's default **10s `hookTimeout`** abandoning a slow `afterEach` mid-cleanup (the suite reconnects the DB per file, ~77s setup) → state leaks to the next test. Set `hookTimeout: 30000` + `testTimeout: 30000` in `vitest.config.ts`. **NOT a BullMQ bug** — both backends share identical BullMQ; only the slower Mongo reconnect flaked. (Also gate `register()`'s email enqueue behind `NODE_ENV!=='test'` so it doesn't touch the shared Redis every test.) Verified 8/8 mongo + 2/2 full-scaffold green. |

### Reference skeletons on disk

- `~/Documents/GitHub/takehome-skeleton-30min` — the minimal walking skeleton (52 files; no DB, no
  auth; Docker, Bruno, Husky, CI, **9 server + 5 component tests**). Run its
  `bin/new-project.sh <path>`: it copies tracked files via `git archive`, makes commits 1 and 2,
  installs, and runs `verify`. **Measured: 1m 04s from nothing to a verified project**, and it
  refuses to print `ready` unless `verify` passes.
- `~/Documents/GitHub/photo-upload-pipeline` — a finished assignment on the same shape: auth,
  per-user scoping, Bruno, Docker, **118 server + 19 web tests**.

### Timed proof: 14m 47s, both gates green (2026-07-09)

A fresh Next.js + Express + Tailwind skeleton, built to the commit order above, with three
parallel agents. Wall clock from `git init` to commit 2:

| t | Step |
|---|---|
| 0:00 | `git init`, folder tree |
| 0:49 | **Commit 1: README** + root/workspace manifests, `npm install` started in background |
| 1:59 | install done (59s — no native modules) |
| 2:13 | three agents dispatched: `server/`, `web/`, infra (`bruno/`, husky, eslint, CI) |
| 4:13 | all three agents' files on disk |
| 9:57 | **Gate 1** — `npm run verify` exits 0 |
| 12:31 | **Gate 2a** — Bruno 3/3 requests, 7/7 assertions |
| 13:30 | **Gate 2b** — real browser renders the API's string |
| 14:47 | **Commit 2: walking skeleton** |

44 tracked files, no artifacts, no secrets, hooks executable. Thirty minutes is comfortable;
half of it is `npm install` and `next build`, neither of which parallelism can shorten.

**Two failures the parallel run produced — expect both.**

1. **Agents don't run the repo formatter.** All three passed their own `tsc` and `vitest`, and
   `npm run verify` still died on step one: `prettier --check` found 8 unformatted files,
   including manifests the main session wrote. After merging agent output, the main session runs
   `npm run format` **before** the gate. Budget one round-trip for it.
2. **Disjoint source paths are not disjoint *build artifacts*.** The web agent was still running
   `next build` when the main session ran `npm run verify`. Two builds, one `.next/`. Symptoms
   were nonsense — first `Could not find a production build … before starting the static export`,
   then `Cannot find module for page: /_document`. Neither is a code bug. **Wait for every agent
   to report before running the gate**, or give each a worktree. If you see either message, delete
   `.next/` and rebuild before you debug anything.

**`npm run dev` serves 404 while `npm run verify` is green — `tsx watch` is the cause (macOS).**
Two watchers (`tsx watch` for the API, Next's for the client, under `concurrently`) exhaust file
descriptors. Next logs `Watchpack Error … EMFILE: too many open files`, silently fails to scan
`app/`, compiles only `/_not-found`, and 404s every route. `/health` still answers 200, so curl and
Bruno pass. `next build` never watches, so `verify` stays green — a green gate over a dead app.

**Fix:** use Node 22's native watcher, which follows the module graph instead of the tree.

```json
"dev": "node --watch --import tsx src/index.ts"
```

Ruled out by elimination before finding it — record these so nobody re-runs the experiment:
raising `ulimit` (no effect), `--turbopack` (no effect), gating `outputFileTracingRoot` to
production (no effect), `tsx watch --ignore '**/node_modules/**'` (no effect), and
`"type": "module"` on the web package (no effect — I wrongly blamed this one first, because I
changed two variables at once). Replacing `tsx watch` with plain `tsx` fixed it instantly, which
named the culprit.

**Diagnostic shape:** an API answering `/health` while every page 404s is a *watcher* problem, not
a routing problem. Look for `EMFILE` before you look at your routes.

**Real root cause + THE FIX (verified 2026-07-09, `--only mongo` on Desktop) — it is the CLIENT's
Watchpack watcher, not `tsx watch`, and NOT system FD saturation.** Running `pnpm --filter client dev`
alone (no API watcher) still 404'd every route with `EMFILE`. **Watchpack's *native* file-watching
opens one FD per watched file and follows pnpm's symlinks into the enormous `node_modules/.pnpm`
store** — so it exhausts descriptors even though the machine is nowhere near `kern.maxfiles`.

**Fix — poll instead of native-watch (no FD per file):**

```json
// client/package.json
"dev": "WATCHPACK_POLLING=true next dev"
```

Verified: with `WATCHPACK_POLLING=true`, `/ /login /register` → 200, `/dashboard` → 307,
**`EMFILE: 0`** — and it works *with* the Supabase stack still running. (Use `cross-env` for Windows.)

Things that were tried and DID NOT help — don't repeat them: raising `ulimit -n` (was already
1048576; 90000 no effect), `--turbopack`, webpack `watchOptions.ignored: node_modules` (Next 15
App Router uses a separate route watcher), killing stray processes, and **stopping the 13-container
Supabase stack** (open-file count barely moved — it was never the cause). Emergency alternative if you
can't edit the script: run prod locally (no watcher at all) — `pnpm build` then `start`.

**A browser "issue" badge is not necessarily yours.** Next's dev overlay flagged a hydration
mismatch on the skeleton. The culprit attribute was `cz-shortcut-listen="true"`, injected by a
browser extension — React's own error text lists that as a cause. Read the diff before you chase it.

### Docker gotchas (measured 2026-07-09, photo-upload-pipeline)

Every one of these builds green and fails later, which is what makes them expensive.

| Symptom | Cause | Fix |
|---|---|---|
| `npm ci --omit=dev` → `husky: not found`, exit 127 | The root `prepare: husky` lifecycle script runs on install, but husky is a devDependency and `.git` is excluded from the build context | Derive a `prod-deps` stage from the full `deps` stage and run **`npm prune --omit=dev`**. `prune` runs no lifecycle scripts and keeps already-built native modules |
| Build is green; **first upload dies** with `Could not load the "sharp" module using the linux-arm64 runtime` | `npm prune --omit=optional` — sharp's platform binary (`@img/sharp-linux-arm64`) is a *transitive optional* dependency | Never `--omit=optional` when sharp is present. Move genuinely optional heavy stacks (TensorFlow) out of `optionalDependencies` instead |
| `next build` fails on `/404` with `<Html> should not be imported outside of pages/_document` | `next build` was run under `NODE_ENV=development` (set so `npm ci` would install devDeps) | Keep `NODE_ENV=production` and force dev deps with **`npm ci --include=dev`** |
| Client calls `localhost:4000` from inside a container, or can't be retargeted | `NEXT_PUBLIC_*` is **inlined at build time**, not read at runtime | Pass it as a `build-arg`, not only as a runtime `environment:` |
| `sharp`/`argon2` compile from source, build takes forever, or dies on musl | `node:22-alpine` | Use `node:22-bookworm-slim` (glibc). Both ship glibc prebuilds |
| The app fails closed in the compose demo (`S3_BUCKET is required in production`) | Your own fail-closed env validation, working correctly | Run the demo container as `NODE_ENV=development` so it uses local-disk storage, but still set `MONGODB_URI` so it hits a **real** database. Never invent a fake bucket — every upload would PUT to nowhere |
| Runtime images ~1 GB | npm workspaces hoist one `node_modules`, so the api image carries `next` + `react` | Three fixes, measured: 1.09 GB → **316 MB** (see below) |

#### Wiring React Testing Library into a workspace (four traps, measured)

All four fail loudly, none is obvious, and together they cost an hour.

| Symptom | Cause | Fix |
|---|---|---|
| Every assertion: `Invalid Chai property: toHaveAttribute` | **Two vitest majors.** `npm i -D vitest --workspace=web` pulled 4.x while the server had 2.x. `@testing-library/jest-dom` extends the *hoisted* copy, so its matchers never reach the tests | One vitest, declared at the **root**, shared by both workspaces |
| `"@vitejs/plugin-react" resolved to an ESM file. ESM file cannot be loaded by require` | The plugin is ESM-only and the web package has no `"type": "module"` — and it must not have one (it breaks `next dev`) | Name the config **`vitest.config.mts`**. The extension forces ESM without touching the package type |
| Every render: `ReferenceError: React is not defined` | `tsconfig` sets `jsx: "preserve"` because Next owns that transform; vitest's esbuild reads it and emits the **classic** runtime | `esbuild: { jsx: 'automatic', jsxImportSource: 'react' }` in the vitest config |
| `Failed to resolve import "@/lib/api"` | Vitest does not read `tsconfig` `paths` | Re-declare the alias in `resolve.alias` |

| `URL.createObjectURL is not a function` | jsdom implements neither `createObjectURL` nor `revokeObjectURL` | Spy them in `vitest.setup.ts` — as **spies, not no-ops**, so a test can assert the revoke happened. A leaked blob URL leaks the decoded image |
| `toBeVisible()` fails on an element hidden by a Tailwind class | jsdom applies no CSS | Do not hide with a class. **Conditionally render.** A class hides an element from sight but not from the accessibility tree, so a screen reader reads every collapsed tooltip on the page |
| `expect(label).toHaveFocus()` fails after one `userEvent.tab()` | Something earlier in the DOM took the tab | Assert the tab order explicitly; it is real information about your markup |

Two more worth knowing: `afterEach(cleanup)` is required with `globals: true`, or the previous
test's DOM is still mounted and `getByRole` silently matches the wrong element. And mock the **API
client**, not `fetch` — mocking the network couples a component test to transport.

**Let the tests improve the component.** Writing them here exposed a loading state with `aria-busy`
but no `role`: nothing for a screen reader to announce, and nothing for a test to find. It now has
`role="status"`. If a state is hard to select in a test, it is hard to perceive.

#### Shrinking a workspace image: 1.09 GB → 316 MB (measured)

| Cause | Fix |
|---|---|
| Next ships the whole hoisted tree (1.0 GB) | `output: 'standalone'` in `next.config.ts` → 64 MB. Entrypoint is `standalone/web/server.js` when `outputFileTracingRoot` is the repo root; copy `.next/static` alongside. **Set `HOSTNAME=0.0.0.0`** — the standalone server binds `localhost` and is otherwise unreachable from outside the container |
| Hoisting puts `next`+`react` (196 MB) in the api image | `npm ci --omit=dev --ignore-scripts --workspace=server --include-workspace-root` |
| `--ignore-scripts` sounds dangerous | It is required (root `prepare: husky` is a devDependency → `husky: not found`, exit 127) **and safe**: sharp's install script only *verifies*, its binaries are `@img/*` optional deps; argon2 ships `prebuilds/` resolved by `node-gyp-build` at *require* time. Check `scripts` + `prebuilds/` before assuming |
| Optional heavy stacks (TensorFlow, 310 MB) | Drop **by name** behind a build arg: `rm -rf node_modules/@tensorflow node_modules/@vladmandic`. Make the code fail fast with an actionable message when the feature is then requested |

**`npm prune --omit=optional` is the trap.** It is the obvious way to drop an optional stack, and
`@img/sharp-linux-*` is *itself* a transitive optional dependency — so the image builds perfectly
and dies on the first upload with `Could not load the "sharp" module`. Remove packages by name.

**Prove the container, don't prove the build.** A green `docker build` says nothing about native
modules. Boot the stack and drive a request that exercises them — for an image pipeline that means
a real upload (sharp) after a real registration (argon2), not `curl /health`. The best check is
running your Bruno collection against the containerised API: 10/10 there means a client can
actually use the image you're about to ship.

## Common mistakes

- Sharing files between the two backends (breaks "delete one, no impact") — keep them fully separate, DB-agnostic files identical by copy.
- Putting business logic or audit calls that need `req` into services — do request-aware logging in controllers/middleware; keep services pure.
- Skipping the coverage/CI gates — they're the change-management evidence a reviewer (and SOC 2) rewards.
- **Building features before the app is clickable.** Commit 2 is the walking skeleton; `npm run dev` in a browser and `bru run` must be green before commit 3 exists.
- **Treating `/health` as proof of wiring.** It proves the process is up. The smoke path must cross browser → fetch → CORS → route → middleware → DB → render.
- **Keeping `husky init`'s default `npm test` pre-commit hook.** Swap for `lint-staged`; a slow hook is a bypassed hook, and a bypassed hook enforces nothing.
- **Letting two agents share `package.json`.** Shared files (manifest, lockfile, root configs) are yours. Agents get strictly disjoint paths and an explicit "do not touch X".
- **Trusting an agent that reports "done".** Make it execute the thing — `bru run`, `docker compose up` + a real `curl` — and paste the verbatim output.
