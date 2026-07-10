# Take-Home Assignment — Best Practices & Reviewer Rubric

> A researched, opinionated guide to what makes an **excellent full-stack TypeScript take-home submission** — and how this boilerplate already gets you most of the way there.
>
> Sources synthesized from BigPanda Engineering, freeCodeCamp, Geshan Manandhar, Stanislav Myachenkov, The Muse, thoughtbot & GitLab code-review handbooks, Express security docs, and the Next.js production checklist (full list at the bottom).

---

## The one thing to internalize

> **A take-home is your business card.** The reviewer is answering one question: _"Would I want this person's code in my repo, and would I want to work with them?"_ They decide from four signals, in order:
>
> 1. **Does it run?** (clean clone → documented steps → works first try)
> 2. **Is it readable?** (clear layers, good names, no dead code)
> 3. **Is it tested?** (the _interesting_ logic, not trivial getters)
> 4. **Does the README show judgment?** (decisions, trade-offs, assumptions, "what I'd do next")
>
> There is usually **no single correct answer**. Reviewers score your **process and judgment**, not a perfect solution. Naming a trade-off you _didn't_ have time to build scores higher than a broken attempt at it.

---

## 1. The scoring rubric (what reviewers actually grade)

Use this as the master scorecard. Dimensions 1–2 are **GATES** — fail them and the rest barely matters.

| # | Dimension | "Excellent" looks like | Signal |
|---|-----------|------------------------|--------|
| 1 | **Correctness / it runs** | Fresh clone runs first try in a clean env; happy path + edge cases work | **GATE** — most rejections happen here |
| 2 | **Requirements fidelity** | Did exactly what was asked; didn't invent scope or ignore constraints | **GATE** |
| 3 | **Code organization** | Clear layers (routes → controllers → services → data); no god-files | High |
| 4 | **Readability** | Descriptive names, small functions, consistent style, no dead code / debug logs | High |
| 5 | **Testing** | Tests exist and pass; the _interesting_ logic is covered | High — top differentiator |
| 6 | **README / docs** | Setup works; decisions, trade-offs, assumptions, "with more time" | High |
| 7 | **Error handling & validation** | Inputs validated at the boundary; errors handled, not swallowed; no stack-trace leaks | Med-High |
| 8 | **Git hygiene** | Atomic conventional commits that tell a story; no secrets / `node_modules` | Med |
| 9 | **Security** | No committed secrets, hashed passwords, validated inputs, sane auth | Med (higher for backend) |
| 10 | **Judgment / self-awareness** | Names trade-offs, admits what's unfinished, proposes improvements | The "work with this person" signal |

**How reviewers read it:** the first reviewer is _you_ — read your own full diff before submitting. Reviewers weight architecture and logic over style (which is exactly why linters matter: they remove style bikeshedding so the reviewer focuses on your thinking).

**Follow-up questions they'll prepare** (pre-answer these in the README): (a) _improve the solution_ — validation, concurrency, memory, edge cases; (b) _scale it for production_ — deployment, monitoring, SLAs, security.

---

## 2. README essentials

The README is repeatedly called _"the key to a painless review."_ Required sections:

```markdown
# Project Name
One line: what it does.

## Quick start   ← the most important section
Prerequisites with exact versions (Node 20+, pnpm 9, Docker)
1. cp .env.example .env
2. pnpm install
3. pnpm dev            (or: docker compose up)
App → http://localhost:3000 · API → http://localhost:5002

## Architecture overview
- Monorepo: client/ (Next.js), server/ (Express)
- Layering: routes → controllers → services → repositories
- Key libraries and WHY each was chosen (a small diagram is a plus)

## Requirements coverage        ← tick each stated requirement → where it's met

## Decisions & trade-offs        ← the single highest-value section
- Chose X over Y because…
- What I deliberately did NOT build and why

## Assumptions                   ← every ambiguity you resolved and how

## Testing
- How to run + what's covered (and what you'd test next)

## API docs                      ← Swagger/OpenAPI link OR the Bruno/Postman collection

## What I'd do with more time     ← concrete P1/P2 list

## (Optional) Demo               ← 2-min Loom or screenshots
```

**Rules backed by every source:**
- **Test your own install steps in a fresh clone.** A README whose commands don't work is the most common _silent_ rejection.
- **Map requirements → where they're satisfied** so the reviewer can tick each box.
- The **"decisions & trade-offs"** and **"with more time"** sections are what separate senior from junior submissions.

---

## 3. Code-quality signals

**Structure / separation of concerns**
- Layered backend: `routes/` (HTTP) → `controllers/` (orchestration) → `services/` (business logic) → `repositories/` (persistence). **Business logic never lives in a route handler.**
- Feature-oriented client structure; organize by feature, not by type, once it grows.
- Shared types so client and server agree on the API contract (one source of truth).

**Readability**
- Descriptive names; small, single-responsibility functions.
- **No dead code, no commented-out blocks, no `console.log` debug artifacts, no dangling `TODO`s.**
- Comments explain _why_, not _what_.

**Type safety (high signal for this stack)**
- `strict: true`, no stray `any`; `unknown` at boundaries then narrow.
- **Zod at every external boundary** (request bodies, env vars, third-party responses); infer TS types from the schemas so validation and types can't drift.

**Git & secrets**
- `.gitignore` excludes `node_modules/`, `.env`, `dist/`, `.next/`, coverage.
- **`.env.example` present** (keys, no values); real `.env` never committed; no secrets anywhere in history.
- **Atomic, conventional commits** (`feat:`, `fix:`, `test:`, `refactor:`, `chore:`) — each a coherent, revertable change; together a narrative of how you built it. **Never one giant "initial commit."**

---

## 4. Testing expectations

The strongest differentiator: **tests are rarely mandatory but almost always what makes you stand out.**

**What to test under time pressure (80/20):**
1. **Happy path** of the core feature.
2. **The interesting logic** — the algorithm/calculation/business rule that is the _point_ of the assignment. Test this before framework glue.
3. **Edge cases** — invalid input, empty/boundary values, auth failures, not-found.
4. Skip trivial getters/setters when time is short.

**The pyramid, scoped for a take-home:**
- **Unit** — services / pure functions. Cheapest, highest ROI, write first.
- **Integration** — API endpoints against a real/test DB (supertest). Proves the layers connect. High signal for backend roles.
- **E2E** — one or two happy-path flows through the UI (Playwright/Puppeteer). Impressive but expensive; add last.

Don't chase a coverage number — **test what matters and say so in the README.** 8 meaningful tests beat 60 trivial ones. If you ran out of time, write _what_ you'd test next and _why_.

---

## 5. Red flags — the rejection list

Any of these can sink a submission. Treat the first group as **hard GATE fails**.

**Hard fails (GATE)**
- ❌ **Doesn't run** — missing deps, undocumented setup, crashes on start. _#1 killer._
- ❌ **No README**, or README steps that don't work.
- ❌ **Ignored the actual requirements** — solved a different problem / missed constraints.
- ❌ **Committed secrets** (`.env`, API keys) or **committed `node_modules/`** / build artifacts.

**Strong negatives**
- No tests at all (for anything beyond a trivial script).
- One giant commit — no story, no reviewability.
- **Over-engineering** — needless microservices, premature abstractions.
- **Under-engineering** — everything in one file, business logic in route handlers.
- No input validation / swallowed errors / stack traces leaked to clients.
- Inconsistent formatting, dead code, debug logs left in.
- Learning too many new tools at once (max **one** new tech per challenge).
- Unstated assumptions — silently guessing instead of documenting the choice.
- Emailing a zip instead of a Git repo/host link.

**Soft negatives**
- Scope creep leaving core features half-done; gold-plated UI on a backend task (or vice-versa); can't critique own work.

---

## 6. Professional polish (the "senior" tier)

Not required, but each one signals production maturity. A good boilerplate ships these for free.

**One-command setup**
- `docker compose up` **or** a single `pnpm dev` brings up the whole stack. Kills "works on my machine" — the biggest ease-of-evaluation win.

**Express backend hardening (order matters):**
1. `helmet()` **first** (headers attach to all responses, including errors).
2. `cors()` **second**, specific origins (not `*` in prod).
3. `express-rate-limit` **third** (per-IP, returns 429) — before auth so limits hit before expensive lookups.
4. Auth, then routes.
- Structured JSON logging (Pino/Winston) with request/correlation IDs.
- **`/health` + `/ready`** endpoints that probe DB/Redis connectivity.
- **Graceful shutdown** on SIGTERM/SIGINT (drain in-flight, close pools).
- Centralized error middleware + typed `AppError`; async handler wrapper; never leak stack traces.
- Zod validation middleware on every route's body/params/query.

**Auth / security (if the assignment involves auth):**
- Passwords hashed with **argon2 / bcrypt** (never plaintext, never fast hashes).
- **Short-lived access token (~15m) + refresh token (~7d)**; **rotate** the refresh token and store a **hash** of it, not the raw value.
- Prefer **httpOnly, secure, sameSite cookies** over `localStorage` where feasible.
- Rate-limit login/refresh endpoints.

**API docs, CI, gates**
- **OpenAPI/Swagger** at `/docs`, OR a committed **Bruno/Postman** collection.
- **GitHub Actions**: `lint → typecheck → test → build` on push, green badge in README.
- ESLint + Prettier clean; `tsc --noEmit` passes with `strict`.
- Optional: Husky + lint-staged pre-commit, commitlint for conventional commits.

---

## 7. Time management

The meta-skill being tested is **prioritization under constraint** — exactly what you do at work.

**Plan before coding:** read requirements twice → list technical decisions → sketch the design → write a 5–10 case test plan → break into a task checklist.

**Priority ladder under a deadline:**
1. **Non-negotiable:** it runs, core requirements met, happy path works.
2. **Important:** readability, error handling, tests for the interesting logic, a working README.
3. **Nice-to-have:** performance, extra features, UI polish, bonus items.

**Rules:** Do one thing well, not five poorly. **Cut deliberately and say so** ("descoped X; with more time I'd do it via Y" scores higher than a broken X). Respect stated time budgets. One new technology max.

---

## 8. Presentation

- **Commit history that tells a story** — reviewers read your `git log`. Atomic, conventional, chronological.
- **Clean diff** — no dead code, debug output, or commented experiments. Read your own full diff before submitting.
- **Demo** — a 2-minute Loom or a few screenshots/GIFs in the README dramatically lowers reviewer effort.
- **Submission** — brief, personable message; link to a repo, never a zip.

---

## Master checklist (copy into your submission review)

**Runs & requirements**
- [ ] Fresh clone → documented steps → runs first try (verified in a clean env / container)
- [ ] `docker compose up` OR single `pnpm dev` brings up the whole stack
- [ ] Every stated requirement met and mapped in the README
- [ ] `.env.example` present; app fails fast with a clear message if env is missing

**Code quality**
- [ ] Layered architecture; no business logic in route handlers
- [ ] `strict` TS, no `any`, Zod validation at boundaries, inferred types
- [ ] Consistent Prettier/ESLint; no dead code, debug logs, or commented blocks

**Testing**
- [ ] Unit tests on the interesting business logic
- [ ] ≥1 integration test on an API endpoint (supertest)
- [ ] `pnpm test` passes; README says what's covered and what's next

**Security & polish**
- [ ] No secrets in code or git history; `node_modules`/build artifacts ignored
- [ ] helmet → cors(specific origin) → rate-limit → auth ordering
- [ ] Central error middleware; no stack-trace leakage; graceful shutdown; `/health`
- [ ] Passwords hashed; access+refresh JWT with rotation
- [ ] OpenAPI/Swagger or Bruno/Postman collection committed
- [ ] GitHub Actions CI green: lint + typecheck + test + build

**Git & README**
- [ ] Atomic conventional commits telling a build story (not one giant commit)
- [ ] README: quick start, architecture, decisions & trade-offs, assumptions, testing, "with more time"
- [ ] Own full diff re-read before submit

---

## How this boilerplate maps to the rubric

| Rubric area | Status in this repo |
|---|---|
| Layered architecture | ✅ routes → controllers → services → repositories (with a repository interface) |
| Env validation | ✅ `envalid` with 32-char secret enforcement (`server/src/config/env.ts`) |
| Auth | ✅ Argon2id + JWT access/refresh + Redis revocation |
| Security middleware | ✅ helmet, CORS, dual-tier rate limiting, Zod validation |
| Error handling | ✅ central `errorHandler` + typed `ApiError`, no stack leak in prod |
| Logging / shutdown | ✅ Winston JSON logs, graceful SIGTERM/SIGINT |
| Testing | ✅ 4 layers — unit, integration (supertest), Bruno API, Puppeteer e2e; **75% coverage gate** on servers |
| CI | ✅ lint + typecheck + test + build for **both backends** + client, **plus Bruno API + e2e** |
| README | ✅ architecture diagram, endpoint tables, flow docs |
| API docs | ✅ OpenAPI 3 spec + **Swagger UI at `/docs`** + Bruno collection |
| Refresh token | ✅ **rotation** on use; O(1) hashed-key lookup; only a SHA-256 hash stored |
| Health check | ✅ `/health` liveness + `/ready` probing DB + Redis |
| Housekeeping | ✅ dead code removed, ports unified to 5002, `BCRYPT_SALT_ROUNDS` dropped, self-contained pnpm Dockerfiles |
| Pre-commit | ✅ Husky + lint-staged + commitlint (Conventional Commits) |
| DB flexibility | ✅ two segregated backends (`server-sql` Prisma / `server-mongo` Mongoose), identical API |

See the **`takehome-assignment-audit`** skill for the full gap punch-list and how to score any repo against this rubric.

---

## Sources

- BigPanda Engineering — _Secrets from the Interview Room_
- Stanislav Myachenkov — _SWE Interview: Take-home Assignment_
- freeCodeCamp — _The Essential Guide to Take-home Coding Challenges_ and _Secure Auth with JWT & Refresh Tokens_
- Geshan Manandhar — _Outclass your competition in take-home coding challenges_
- The Muse — _What Hiring Managers Are Actually Looking For_
- thoughtbot & GitLab — Code Review guides/handbooks
- Express — _Production Best Practices: Security_
- Next.js — _Production Checklist_ & _TypeScript config_
- Krystal Campioni — _Atomic & Conventional Commits_
- Hacker News — _Library of realistic engineering take-home tests, ranked_
