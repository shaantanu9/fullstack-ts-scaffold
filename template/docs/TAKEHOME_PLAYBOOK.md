# The Take-Home Playbook & Engineering Standards

> A team-shareable, internet-researched rulebook for producing a take-home submission (and everyday code) that any teammate or recruiter reads as **top-tier**. It combines (1) the full take-home lifecycle, (2) what reviewers actually score, (3) 2024–2026 AI-era realities, (4) an exhaustive categorized rule list (code, quality, architecture, git, PR, testing, docs, security), and (5) exactly how **this boilerplate** implements each. Every section cites primary sources.
>
> **Audience:** the candidate building the submission · teammates reviewing a PR · the recruiter/hiring manager scoring it. Bring this doc to the interview and you can walk any rule → file → test.

## Contents
1. [The take-home lifecycle (stage by stage)](#1-the-take-home-lifecycle)
2. [What reviewers actually score (rubric + weights)](#2-what-reviewers-actually-score)
3. [2024–2026 realities: the AI era](#3-20242026-realities-the-ai-era)
4. [The rulebook](#4-the-rulebook) — Code · Clean code · Architecture · Git · PRs · Testing · Docs · Security
5. [Reviewer confessions & ranked green/red flags](#5-reviewer-confessions--ranked-flags)
6. [The keyword / signal bank](#6-the-keyword--signal-bank)
7. [Real example prompts & where to practice](#7-real-example-prompts--where-to-practice)
8. [The debrief interview (questions + strong answers)](#8-the-debrief-interview)
9. [Logistics, negotiation & ethical AI use](#9-logistics-negotiation--ethical-ai-use)
10. [How this boilerplate implements the rules](#10-how-this-boilerplate-implements-the-rules)
11. [Drop-in checklists (candidate + reviewer)](#11-drop-in-checklists)
12. [Sources](#12-sources)

---

## 1. The take-home lifecycle

The take-home is your "business card" — it communicates more than a resume because it shows your thinking unmediated. Treat every stage as a signal.

| Stage | What "excellent" looks like |
|---|---|
| **a. Clarify the prompt** | Read it twice; honor every constraint (libraries, language, deadline). Ask a short specific question if ambiguous, or state assumptions in the README. *Not asking questions is itself a red flag.* Decline assignments that are effectively unpaid product work. |
| **b. Scope / time-box** | Set a hard time limit; list what's in and what's deliberately out. Narrow-done-fully beats broad-done-partially. Typical: 2–7 day window but only 2–4 hours expected work — "double your estimate." |
| **c. Plan & design** | Break into small chunks; write a test plan *before* coding to surface edge cases. Write a skeleton README before coding. |
| **d. Setup** | Start from proven scaffolding (create-next-app, this boilerplate). Add linter + formatter in the **first commit** so style is consistent throughout. Commit `.gitignore` first. |
| **e. Implement** | Build the simplest end-to-end flow first ("make it work"), then loop back for names, tests, edge cases. Functionality is prioritized above all else. |
| **f. Test** | Show testing *philosophy*, not a coverage number (see §4.6). |
| **g. Document** | The most decisive artifact after "does it run" (see §4.7). |
| **h. Self-review** | Remove commented code, TODOs, `console.log`, unused imports; run the linter. **Then clone into a clean dir and run your own setup from scratch** — "doesn't run" is the #1 rejection. |
| **i. Submit** | Via Git host, not a zip. Message: thanks → point to key files → note deviations → **proactively disclose known issues** → request feedback. Consider a PR off the template commit so the diff is exactly your work. |
| **j. Follow-up / defence** | Often *more important than the code*. A 45–90 min walkthrough: justify architecture, defend trade-offs, critique your own work, explain what you'd change and how it scales. LLM-generated code "often contains subtle bugs candidates cannot justify" — this round exists to expose that. |

---

## 2. What reviewers actually score

Most teams use an **analytic rubric** (score each axis, then sum), not a single grade. A representative weighted model observed in 2026 hiring: **30% functionality · 30% requirements completeness · 25% architecture/decision-engineering · 15% code quality**, with documentation, tests, and git hygiene folded in as first-class supporting signals.

Universally scored axes:

- **Functionality / correctness** — runs cleanly, handles edge cases, meets spec. *The floor; failing it is terminal.*
- **Requirements fidelity** — did exactly what was asked; honored constraints.
- **Code quality & readability** — naming, structure, consistency, no dead code.
- **Architecture & extensibility** — sensible layering, right-sized (not over/under-engineered). "Solve the problem you have now, not a speculative future one."
- **Testing** — presence and *judgment*, not raw coverage.
- **Documentation** — README quality, trade-off reasoning.
- **Git hygiene** — atomic commits that show the development process.
- **"Would I work with them?"** — communication clarity and DX empathy. Good setup is "a tell-tale sign that an engineer will take care of the DX of their colleagues."

Take-homes have "arguably the lowest false-negative rate of any interview format" — weaknesses are hard to hide, so polish matters.

---

## 3. 2024–2026 realities: the AI era

- **AI use is largely permitted, rarely banned — but disclosure + defensibility is the bar.** Most companies are silent; a few (Hudson River Trading, Wolters Kluwer) prohibit it; OpenAI allows it but "don't dump the whole problem into ChatGPT and paste the output."
- **GitLab's disclosure model is the reference standard:** disclose *which* AI tools and *when*; answer in your own words reflecting your synthesis; be ready to explain your prompts and decisions; never present AI output as your own. Misrepresentation disqualifies.
- **"Knowledge is free — judgment isn't."** Reviewers now measure engineering judgment: questioning assumptions, verifying correctness, spotting missing edge cases / security holes / outdated patterns in AI output, and knowing *when not* to apply an AI solution.
- **Detection happens at the walkthrough** — subtle bugs you can't justify, or polished code paired with shallow reasoning. **Never submit a line you can't explain.**
- **Take-home fatigue is real** — senior candidates refuse long unpaid tasks; companies respond with paid take-homes, hard time caps, or in-office pairing. Respect the stated time budget.

---

## 4. The rulebook

~250 source-cited rules. Each is a crisp one-liner; hard numeric limits are quoted. In this repo, most of these are **enforced automatically** (strict `tsconfig`, ESLint type-checked rules, Prettier, commitlint, CI, coverage gate) — see §5.

### 4.1 Code rules (TypeScript & JavaScript)

**Compiler strictness (`tsconfig`):** `strict: true` · `noImplicitAny` · `strictNullChecks` · `strictFunctionTypes` · `strictPropertyInitialization` · `noImplicitThis` · `useUnknownInCatchVariables` · `noUnusedLocals` · `noUnusedParameters` · `noImplicitReturns` · `noFallthroughCasesInSwitch` · `noUncheckedIndexedAccess` · `exactOptionalPropertyTypes` · `forceConsistentCasingInFileNames` · `isolatedModules`.

**Types & `any`:** never `any` (prefer a specific type or `unknown`) · no unsafe-`any` flows (`no-unsafe-*`) · no non-null `!` (write a real check) · rely on inference for trivial types · no `{}` type · no wrapper types (`String`/`Number`) · arrays as `T[]`/`readonly T[]` · prefer `interface` for object shapes · discriminated unions + exhaustive `never` default · `switch-exhaustiveness-check` · `no-unnecessary-condition` · `@ts-expect-error` must carry a description · `import type` for type-only imports · avoid `enum`, never `const enum`.

**Variables, immutability, equality:** `const` by default, `let` only when reassigned, never `var` · one variable per declaration · `===`/`!==` only · mark unchanging fields `readonly` · no mutable exports · parse numbers with `Number()` and check `NaN`.

**Functions, async, errors:** `no-floating-promises` (await/return/void every promise) · `no-misused-promises` · `await-thenable` · `require-await` · prefer async/await over callbacks · only throw `Error` subclasses · catch as `unknown` and narrow (no silent empty catch) · never reassign params · prefer `??` and `?.` over `||`/manual `&&` · no `eval`/`Function(string)`.

**Objects, arrays, syntax:** literals `{}`/`[]` · shorthand + spread over `Object.assign` · destructure · `for...of`/`Object.keys` (not unfiltered `for...in`); prefer `map`/`filter`/`reduce` · no nested ternaries · braces on all control statements · template literals over concatenation.

**Naming & modules:** `camelCase` vars/functions · `PascalCase` classes/types/components · `CONSTANT_CASE` globals · no leading/trailing underscores or cryptic abbreviations · prefer named exports, avoid default exports · group/order imports (external before internal) · no circular deps.

**React / Next.js:** Rules of Hooks (top level only, from React functions) · custom hooks start with `use`, components `PascalCase` · components/hooks pure (same input → same output; side effects in effects/handlers) · props & state immutable · `react-hooks/exhaustive-deps` · stable unique `key` from data IDs (never index/`Math.random()`) · one component per file, typed props · Server Components by default, `'use client'` only for interactivity, boundary pushed to the leaf · secrets/DB stay server-side (`server-only`; only `NEXT_PUBLIC_` reaches the browser; Client-Component props serializable) · `no-console`, no dead code.

*Sources:* Airbnb JS/React style guides · Google TS Style Guide · typescript-eslint rules · TS tsconfig reference · React "Rules of React" · Next.js Server/Client Components.

### 4.2 Clean code & quality

**Naming:** intention-revealing (if it needs a comment, it fails) · descriptive, pronounceable, searchable · meaningful distinctions (no noise words) · no disinformation/encodings/Hungarian · class = noun, method = verb, one word per concept.

**Functions:** keep them small, then smaller · do one thing at one level of abstraction (Stepdown Rule) · fewer args (0 ideal → 3 needs justification; wrap 3+ in an object) · no flag/boolean args · no output args or hidden side effects · Command-Query Separation · prefer exceptions to error codes; never pass or return `null` · Tell-Don't-Ask + Law of Demeter (no `a.getB().getC()`).

**Comments:** explain yourself in code, not comments · WHY not WHAT · delete commented-out/dead code · no noise/banner/brace comments; keep them accurate.

**Structure:** guard clauses / early return over nesting · declare variables near use, callers near callees · short lines (80–120) · follow existing conventions; be consistent.

**Data & objects:** encapsulate internals (behavior, not fields) · small classes, SRP, high cohesion · prefer polymorphism to `switch`/`if-else`; value objects over primitives.

**Principles:** DRY · KISS · YAGNI · no magic numbers/strings · Boy-Scout Rule (leave it cleaner; fix root causes) · immutability / no shared mutable state · dependency injection · avoid negative conditionals; use explanatory variables · **SOLID**.

**Quantitative gates (hard limits reviewers apply):** Sandi Metz — classes ≤ **100 lines**, methods ≤ **5 lines**, ≤ **4 params**, controllers instantiate one object · cyclomatic complexity ≤ **10** per function (≤15 with justification) · functions ideally < ~20 lines / one screen.

**Code smells to flag:** *Bloaters* (Long Method, Large Class, Primitive Obsession, Long Parameter List, Data Clumps) · *OO abusers* (type-code Switch, Temporary Field, Refused Bequest) · *Change preventers* (Divergent Change, Shotgun Surgery) · *Dispensables* (Duplicate/Dead Code, Lazy Class, Speculative Generality, Data Class) · *Couplers* (Feature Envy, Inappropriate Intimacy, Message Chains, Middle Man) · *Decay markers* (Rigidity, Fragility, Immobility, Needless Complexity/Repetition, Opacity).

*Sources:* Clean Code (Martin) · Refactoring Guru — Code Smells · Sandi Metz' Rules (thoughtbot) · Fowler (Code Smell, Tell-Don't-Ask, CQS) · McCabe/NIST cyclomatic complexity.

### 4.3 Architecture & separation of concerns

- **Thin controllers** — routing, parsing, validation, response shaping only; **no business logic, never touch the DB directly.**
- **Business logic lives in a Service Layer** that owns transactions and defines the app's operations (Fowler).
- **Data access behind a Repository** — a collection-like interface that isolates the domain from persistence (Fowler).
- **The Dependency Rule** — source dependencies point only inward; inner layers know nothing of outer ones (Clean Architecture).
- **Dependency Inversion** — high- and low-level modules both depend on abstractions; depend on interfaces, not concretions; inject dependencies (constructor injection), don't `new` them inside a class.
- **Framework/UI/DB independence** — business rules are testable without the web server, UI, or DB. Cross layers via contracts passing simple/serializable data, never DB rows/entities.
- **12-Factor:** config in the environment (no hardcoded secrets/hosts) · declared & isolated deps with a lockfile · backing services as attached resources · separate build/release/run · stateless processes · logs to stdout · dev/prod parity · disposability.
- **Validate & shape input at the boundary (DTOs/Zod) before it reaches domain logic.** Prefer feature/domain folders over type-based.

*Sources:* Clean Architecture (Martin) · Fowler (Service Layer, Repository) · NestJS (Controllers, Providers/DI) · Dependency Inversion Principle · The Twelve-Factor App.

### 4.4 Git rules

**Commit message (Chris Beams 50/72):** subject separated from body by a blank line · subject ≤ ~50 chars (72 hard ceiling), Capitalized, no trailing period, **imperative mood** ("Fix login redirect") · body wrapped at 72, explaining **what & why, not how**.

**Conventional Commits:** `<type>[optional scope]: <description>` · types `feat fix docs style refactor perf test build ci chore revert` · `feat`→MINOR, `fix`→PATCH · breaking change via `!` or `BREAKING CHANGE:` footer → MAJOR.

**Atomic history:** one logical change per commit (builds, passes tests, independently revertible) · separate refactors from features/fixes · no `WIP`/`fix stuff`/`asdf`/`final` in submitted history (squash/reword first) · history reads top-to-bottom as a story · tests in the same commit as the code they verify.

**Secrets & ignores:** never commit secrets — no `.env`/keys/tokens anywhere in history (if ever committed, **rotate**, don't just delete) · commit `.env.example` · ignore `node_modules/`, `dist/`/`build/`/`.next/`/`coverage/`, OS/editor cruft · **always commit the lockfile**.

**Branches:** typed kebab-case prefixes `feature/ fix/ chore/ docs/ refactor/` · prefer clean, mostly linear history (rebase local WIP; never rebase shared history).

**Attribution:** credit real humans with `Co-Authored-By:` only; remove AI/tool co-author trailers and "Generated with…" lines from work you present as your own; keep author name/email consistent.

*Sources:* Conventional Commits v1.0.0 · Chris Beams "How to Write a Git Commit Message" · Angular commit guidelines · SemVer · GitHub gitignore templates.

### 4.5 Pull request rules

**Small PRs (SmartBear/Cisco + Google):** target **200–400 LOC**; defect-detection drops sharply beyond ~400 · one review sitting ≤ 60–90 min & ≤ ~400 LOC hits 70–90% defect discovery · Google: ~100 lines reasonable, ~1000 too large (may be rejected on size alone) · one self-contained change per PR, including its tests · split large work by layer, feature, or stacked PRs; separate refactors.

**Description:** imperative one-line summary, blank line, then body explaining the problem, the approach, why over alternatives, and known limitations · link the issue/design doc · before/after screenshots for visual changes · document how it was tested · never "Fix bug"/"Fix build" · re-read & update before submitting.

**Author workflow:** self-review your own diff first · draft/WIP until ready; request review only when CI is green · never merge red · push feedback fixes as isolated follow-up commits · respond to every comment.

**Reviewer standard:** approve once the change definitely improves overall code health, even if imperfect ("no perfect code, only better code") · decide on technical facts, not taste; defer to the style guide · signal approval clearly; never approve something that worsens code health.

**Etiquette & speed:** respond within one business day · comment on the code, not the person; assume competence · explain the WHY; prefix optional feedback `Nit:`/`Consider:` · ask questions, offer alternatives, note what you like · avoid "just/simply", hyperbole, sarcasm.

*Sources:* Google eng-practices (Small CLs, CL Descriptions, Standard of Review, Comments, Speed) · thoughtbot Code Review guide · SmartBear Best Practices for Peer Code Review.

### 4.6 Testing rules

**Shape & strategy:** test pyramid/trophy — many fast unit, fewer integration, very few E2E; weight toward integration (best confidence-to-effort) · add a static layer (lint + types) as the cheapest tier · push each test as low as it can go; delete duplicate higher-level coverage · order the pipeline by speed · prioritize critical paths & business logic.

**Behavior, not internals:** test observable behavior ("input → output"), not implementation · a refactor should rarely change tests · interact like a real user (roles/labels/visible text) · don't test private methods or trivial getters · "the more your tests resemble the way software is used, the more confidence they give you."

**Quality:** Arrange-Act-Assert · one concept per test · descriptive names (`should <behavior> when <condition>`) · no logic in tests; treat test code as production code · **FIRST** — Fast, Independent, Repeatable (no flakiness), Self-validating, Timely.

**Mocking & coverage:** mock only at boundaries (DB/network/fs/external); don't over-mock · use local/in-memory doubles, never production · integration-test wherever data crosses a serialization boundary · add a regression test for every bug · treat coverage as a guide (diminishing returns beyond ~70%), not a target.

*Sources:* Fowler "Practical Test Pyramid" · Kent C. Dodds (Write Tests, Testing Trophy) · Testing Library Guiding Principles · FIRST (Clean Code ch.9).

### 4.7 Documentation rules

**README must-haves:** self-explaining title + description · prerequisites (versions, services) · step-by-step setup for a novice · usage examples with expected output · how to run the app and the tests · tech stack · status/license.

**Take-home-specific:** one-command / reproducible setup · **assumptions & trade-offs** and **"what I'd do with more time"** (critical for grading) · `.env.example` listing every variable · API documented with OpenAPI/Swagger · a **requirements-coverage map** (spec → where implemented).

**Code docs:** comment WHY not WHAT · document the public API with JSDoc/TSDoc (`@param`, `@returns`, `@example`).

**Changelog & versioning:** human-written `CHANGELOG.md`, reverse-chronological with `Unreleased`, grouped Added/Changed/Deprecated/Removed/Fixed/Security, ISO-8601 dates (Keep a Changelog) · **SemVer** `MAJOR.MINOR.PATCH`.

*Sources:* makeareadme.com · Keep a Changelog · SemVer · TSDoc · OpenAPI Specification.

### 4.8 Security & dependency rules

**Secrets/config:** no secrets in code or history (repo safe to open-source anytime) · config in env vars; ship `.env.example`, gitignore real `.env`.

**Input & injection:** validate all input at the boundary, allowlist, server-side; syntactic + semantic validation · parameterized queries (never string-concat SQL) · context-encode output (XSS) · validate uploads; enforce request-size limits (413).

**Passwords/auth:** never store plaintext — **Argon2id** (preferred), scrypt, or bcrypt; per-password salt; constant-time compare · generic login-failure errors (anti-enumeration) · rate-limit/lockout after N failures · HTTPS only · least privilege / default-deny; log auth events.

**JWT:** verify signature before trusting (`verify`, never bare `decode`); reject `alg:none`, allowlist the algorithm · validate `exp/nbf/iss/aud` every request · short-lived access (5–15 min) + **rotating** refresh · secret ≥32 random bytes from env/KMS; no sensitive data in payload · prefer HttpOnly+Secure+SameSite cookies; support revocation.

**Access control (OWASP A01 — #1 risk):** enforce authorization server-side at every endpoint · object-level (own the record → prevents IDOR/BOLA), function-level, and property-level (no mass-assignment).

**Transport/headers/CORS:** HTTPS + security headers (HSTS, `nosniff`, CSP) via Helmet · don't wildcard CORS with credentials — allowlist origins · no sensitive data in URLs · rate limiting (429).

**Errors & dependencies:** generic errors (no stack traces to clients) · run `npm/pnpm audit` and remediate before submitting; don't ship known-vulnerable components (A06); commit the updated lockfile after `audit fix`; minimize/justify every dependency.

**Reference checklists:** OWASP Top 10 (2021) A01–A10 · OWASP API Security Top 10 (2023) API1–API10.

*Sources:* OWASP Top 10 (2021), API Security Top 10 (2023), REST/Input-Validation/Password-Storage/Authentication Cheat Sheets · 12-Factor Config · npm audit docs.

---

## 5. Reviewer confessions & ranked flags

Real, attributable quotes from people who **review/grade take-homes** (Hacker News, engineering blogs). This is what actually happens in the review room.

- **"It MUST work."** A "great deal of submissions fail on execution" from undeclared dependencies — first-run errors are the #1 reject trigger. Tests "make your task stand out, simply because other candidates tend to spare them." *(Daniel Korn, BigPanda — reviews take-homes)*
- **The shibboleth trick:** one reviewer plants a subtle trap in the test — "there are ~20 solutions on GitHub and 80% are wrong. Feel free to copy them, it makes it easier to grade… I'll happily bring the original author to the interview to probe the flaws." *(HN `morelisp`)*
- **"You MUST follow it up with a live review. It becomes painfully obvious who cheated based on their ability to reason about their decisions."** *(HN `codegrappler`)* Echoed by many: the debrief is an authenticity check.
- **Over-specific ≠ good.** Demonstrating deep framework trivia instead of general problem-solving judgment reads as a red flag; transparency about what you *didn't* do "shows maturity." *(Mario Fernandez — reviewer)*
- **"It's less about IF you can solve it, but HOW."** Green flags: passing tests, no compiler warnings/TODOs, separation of concerns, documented decisions & alternatives, documented DB-index rationale, restating the problem in your own words, reviewing your own work before submitting. Red flags: half-assing it, neglecting tests, over-engineering (inventing requirements), under-engineering (one giant module), and — memorably — "cussing out the company in git history." *(Tobias Pfeiffer / pragtob — reviewer)*
- **"Write down the pros/cons of each library you chose. Be prepared to be asked 'why this over that.'"** The most common practical failure he sees: reviewers can't run it (missing env vars, locally-installed DBs/tools). *(Elia Bar — senior reviewer)*
- **The niche, self-validated take-home worked:** "it was the most accurate measure of how good someone was… we found great candidates and didn't hire any duds" — after a phone screen, with a task you can't google. *(HN `jclarkcom`, VMware)*

**Ranked GREEN flags** (most-repeated across independent reviewers): 1) runs on a clean clone, first try; 2) a README with a **Decisions/Trade-offs** section (assumptions, why-this-library, what you skipped); 3) tests even when optional; 4) logical story-telling commit history on a Git host; 5) respecting scope/time-box + "with more time"; 6) being able to explain every line in the debrief; 7) Docker / one-command setup.

**Ranked RED flags:** 1) doesn't run / missing deps; 2) no or weak README; 3) no tests when expected; 4) over-engineering (too much code / too many libraries / invented requirements); 5) under-engineering (everything in one module); 6) leftover cruft (TODOs, `console.log`, unused deps); 7) one giant squashed commit or email submission; 8) can't explain your own code (the AI-copy tell).

> **The one rule that prevents most modern rejections:** never submit a line you can't explain cold. A candidate won an offer specifically by defending *rejecting* an AI's bloated backend and explaining exactly why *(Brian Jenney)*; others lose specifically because "the explanation doesn't match the code."

## 6. The keyword / signal bank

The specific terms/concepts reviewers (and recruiters skimming) reward when they appear **correctly used** in your code, commits, and README. Use them where they genuinely apply — each is a small seniority signal, and each is a likely debrief question.

- **Architecture & design:** separation of concerns · layering (controller/service/repository) · repository pattern · dependency injection · idempotency · statelessness · SOLID / single responsibility · domain modeling / bounded context · interface / contract-first · configuration over hardcoding (12-factor).
- **API / backend:** cursor/keyset pagination (over offset) · rate limiting (token bucket, 429, `X-RateLimit-*`) · caching (TTL, ETag, cache-control) · graceful shutdown · liveness & readiness health checks · retries with exponential backoff + jitter · schema/input validation · consistent error envelope · API versioning (`/v1`) · idempotency keys · correct HTTP verb/status semantics · timeouts / circuit breakers.
- **Testing:** unit / integration / e2e · test pyramid (or trophy) · coverage (measured) · mocking / stubs / fakes · fixtures / factories · TDD · edge-case / boundary tests · regression tests · deterministic (no flaky) tests.
- **Frontend:** accessibility / a11y (semantic HTML, ARIA, `jsx-a11y`, axe) · responsive / mobile-first · the **four states** (loading / error / empty / data) · skeletons over spinners (`aria-busy`) · optimistic UI with rollback · memoization (`useMemo`/`React.memo`) · code-splitting / lazy loading · debounce/throttle · controlled components.
- **Performance & scale:** time/space complexity (Big-O, noted in README) · N+1 elimination · database indexing · pagination of data · streaming / generators (row-at-a-time) · connection pooling · batching / bulk ops · profile-before-optimize.
- **Security:** salted hashing (argon2/bcrypt) · JWT / token auth (rotation) · CORS config · OWASP Top 10 awareness · parameterized queries · secrets via env (`.env.example`, never committed) · least privilege · input sanitization / output encoding · HTTPS / secure cookies · brute-force/rate-limit protection.
- **DevOps / quality:** CI/CD (GitHub Actions) · Docker / reproducible env · ESLint + Prettier · Conventional Commits · meaningful incremental commit history · OpenAPI/Swagger · structured logging · observability (logs/metrics/tracing) · one-command run · typed code (TS) · `docker-compose up`.
- **README phrases reviewers explicitly love:** "Trade-offs" · "Assumptions" · "With more time / next steps" · "Known limitations" · "Design decisions / why I chose X" · "Out of scope" · "Testing strategy" · "Time complexity is O(…)" · "Given production, I would add…" · a **requirements-coverage map**.

## 7. Real example prompts & where to practice

**How companies run them** (real formats): GitLab uses a **code-review-style MR** graded on security/performance/problem-solving/communication (≤4–6h, 1-week window); Automattic and some OpenAI roles use **paid work trials**; DoorDash uses a **time-boxed 24–48h** realistic deliverable; Atlassian lets you use any libraries; the healthy **time cap is ~2h (3h max) for unpaid**, with a multi-day window.

**Paraphrased real prompts by domain:**
- *Frontend:* "Given this JSON API, build a small React app that lists/searches items and handles loading/error/empty states, responsively."
- *Backend/API:* "Implement a REST API for [wallets / rewards / URL shortener] with CRUD, validation, pagination, and tests; README with setup + design decisions."
- *Full-stack:* "Build a small blog/CRUD app end-to-end (DB + API + UI), containerized, with auth and tests."
- *Data/ETL:* "Extract from this CSV/API, transform/validate, load into a DB; make it reproducible and **idempotent**, add data-quality checks."
- *Algorithms:* "Solve [problem] as production code — clear naming, tests, complexity noted — as if it will be code-reviewed."

**Where to practice (public repos & collections):** [github.com/topics/take-home-test](https://github.com/topics/take-home-test) · [take-home-assignment](https://github.com/topics/take-home-assignment) · [felipefialho/frontend-challenges](https://github.com/felipefialho/frontend-challenges) (100+ real company challenges) · [poteto/hiring-without-whiteboards](https://github.com/poteto/hiring-without-whiteboards) · examples: [dailypay/react-take-home-test](https://github.com/dailypay/react-take-home-test), [finimize/frontend-dev-challenge](https://github.com/finimize/frontend-dev-challenge), [aircall/frontend-test](https://github.com/aircall/frontend-test), [amussey/opendoor-takehome-coding-challenge](https://github.com/amussey/opendoor-takehome-coding-challenge), [parthvyas7/tha-blog-management](https://github.com/parthvyas7/tha-blog-management) (MERN full-stack), [nemanjam/nextjs-prisma-boilerplate](https://github.com/nemanjam/nextjs-prisma-boilerplate) (reference bar for this stack).

## 8. The debrief interview

The take-home is "the first step of a larger conversation." Reviewers use your code as a shared artifact to probe *how you think* — and to verify the code is really yours.

**The predictable question set:** "Walk me through your architecture." · "Critique your own code — what don't you like?" · "What would you do with 10–20 more hours?" · "What did you cut, and why?" · "What feature would you add/remove?" · "How would this scale? What breaks first under load?" · "How did you test it? What's untested and why?" · "Why this library/pattern over the alternative?"

**How to answer well:**
- Bring a **pre-built self-critique list** (naming you'd fix, a shortcut you took, a missing test, an unvalidated boundary). Volunteering weaknesses = senior; being defensive = junior.
- For "what would you differently," take ownership — never blame the time limit or vague spec; end on the concrete **lesson**.
- For scaling, use **bottleneck → fix → trade-off**.
- There's no single answer they're waiting for — narrate reasoning and alternatives. "Talking about *the* solution" as if it's the only one is itself a red flag.

**Example strong answers:**
- *"What did you cut?"* → "Real auth — I stubbed the session because the prompt centered on the data model. I designed the middleware seam so JWT drops in without touching the services (points at it)."
- *"Critique your code."* → "`OrderService` does two jobs — pricing and persistence. I'd extract pricing so it's unit-testable without the DB. I only covered the happy path for refunds; partial-refund is the first test I'd add."
- *"How does it scale?"* → "Fine to single-node throughput. First bottleneck is the N+1 on `order.items`; I mitigated with Prisma `include`, but at 100× I'd paginate, add a Redis read-cache on products, and move email to a queue to keep the request path fast."

## 9. Logistics, negotiation & ethical AI use

**The senior/staff level ladder:** *Junior* — follows instructions precisely (answers *what*). *Senior* — answers *how* and *why*: maintainability, trade-offs, cross-team impact. *Staff* — frames it like a **consulting review**: links to business goals, designs for 10× growth *and* failure, leaves handoff/maintenance notes. "If your take-home looks like finished homework you're seen as an expense; if it looks like a consulting review that points out dangers, you're seen as something that makes money." Consider 3–5 lightweight **ADRs** (context → decision → consequences).

**Time reality:** the advertised "1–2h" task realistically takes **2–4×** that done properly. Timebox hard and **cut scope to fit** — don't gold-plate (reviewers can't extract signal from someone who spent 8h on a 2h task, and one engineer spent **50h then got ghosted**). Set a personal deadline before the real one; double your estimate.

**When the prompt is ambiguous or too large:** get the reviewing engineer's contact and **ask clarifying questions before starting** — companies often leave prompts vague on purpose to see if you ask. If it's too big, **scope it down in the README**, ship a smaller thing done well, and log deferred work + assumptions (a documented wrong guess reads as a decision, not a mistake).

**Should you do it / declining politely:** it's your call; ~20% of candidates (disproportionately senior) decline, so it's respectable. If a large task looks like free consulting, it's fine to **ask for compensation with a number**. To decline: thank them → state the constraint plainly → **propose an alternative** (portfolio deep-dive, live pairing, review of an existing PR) → keep the door open. **Always reply — never ghost back.**

**Ethical AI use (2024–2026):** ask the AI policy before starting (an unclear policy is the company's problem — clarify in writing). AI-friendly for take-homes: Stripe, Shopify, Vercel, most YC startups; AI-disabled: big-tech live algorithmic loops. Treat AI output as a **draft from a fast junior** — read it, run it, **write the tests yourself**. Keep a one-line "AI use" note; be able to **explain and whiteboard every line cold**. Don't paste a company's proprietary prompt into a public AI tool (IP/trade-secret risk). Detection is real (large pasted blocks, timing/focus anomalies) — an unexplained AI wall is genuinely risky.

## 10. How this boilerplate implements the rules

This repo is built so most of the rulebook is **enforced automatically** — a reviewer sees green gates, not promises.

| Rule area | Where it lives in this repo |
|---|---|
| Strict TS + lint rules (§4.1) | `strict` + `noUnused*`/`noImplicitReturns`/`noFallthroughCasesInSwitch` tsconfig; ESLint type-checked config with `no-floating-promises`, `no-explicit-any` (warn), Prettier |
| Thin controllers / service / repository (§4.3) | `server-*/src/{routes,controllers,services,database/repositories}`; services depend only on the `UserRepository` interface; two implementations (Prisma, Mongoose) |
| Boundary validation (§4.1, §4.8) | Zod schemas in `validations/`, applied by `middlewares/validateRequest.ts` on body/params/query |
| Env config / 12-Factor (§4.3) | `config/env.ts` (envalid, 32-char secret floor); `.env.example` per package; `.env` gitignored |
| Error handling (§4.2, §4.8) | central `middlewares/errorHandler.ts` + typed `utils/ApiError.ts`; no stack traces in prod; consistent `ApiResponse` envelope |
| Passwords & JWT (§4.8) | Argon2id (`utils/password.ts`); access + **rotating** refresh with unique `jti`; only a SHA-256 hash of the refresh token stored in Redis (`services/auth.service.ts`) |
| Access control (§4.8 A01) | `authMiddleware` + `requireRole(...)`; object/role checks server-side |
| Security headers / CORS / rate limit (§4.8) | `helmet()` → `cors(origin)` → Redis-backed `express-rate-limit` in `app.ts` |
| Audit trail & traceability (§4.8) | `utils/audit.ts` (login/logout/refresh/authz-denied/user-CRUD events) + `middlewares/requestId.ts` (`x-request-id`) |
| Health/observability | `/health`, `/ready` (probes DB + Redis); Winston JSON logs; graceful shutdown |
| API docs (§4.7) | OpenAPI spec → Swagger UI at `/docs`; Bruno collection (`sql`/`mongo` envs) |
| Testing (§4.6) | Vitest unit + Supertest integration + Puppeteer e2e; **75% coverage gate** on both servers |
| Git rules (§4.4) | commitlint (Conventional Commits) via Husky `commit-msg`; lint-staged `pre-commit`; `.gitignore` + committed `pnpm-lock.yaml` |
| PR/CI gates (§4.5) | `.github/workflows/ci.yml` (lint → typecheck → test → build, per backend + client + API/e2e) |
| Dependency/security scanning (§4.8) | `security.yml` (pnpm audit + gitleaks + CodeQL); `dependabot.yml` |
| Docs (§4.7) | this file, `README.md`, `TAKEHOME_BEST_PRACTICES.md`, `docs/COMPLIANCE.md` (SOC 2), `docs/SUBMISSION_TEMPLATE.md`, `changelogs/` |

**Request flow (trace it in the walkthrough):**
`client lib/api.ts (Bearer + single-flight rotating refresh)` → `requestId → helmet → cors → rate-limit → body-parse → morgan(+request-id)` → `route → validate(Zod) → authMiddleware → requireRole → controller (+audit) → service → repository(interface) → Prisma/Mongoose → DB/Redis` → `{ success, data, message }` envelope → `errorHandler` on failure.

---

## 11. Drop-in checklists

### Pre-submission checklist (candidate)
```
GATE — does it run?
[ ] Fresh clone into an empty dir: clone → install → run → succeeds
[ ] All deps declared (no global-only); lockfile committed
[ ] .env.example present; app starts with documented env
[ ] One-command start (docker compose / pnpm dev) works

REPO HYGIENE
[ ] .gitignore excludes node_modules, dist/build/.next, .env, coverage
[ ] No secrets/keys/PII anywhere in history
[ ] Atomic, Conventional Commits — history tells the build story
[ ] (optional) Submitted as a PR off the template commit

CODE
[ ] Linter + formatter pass clean; strict TS, no `any` leaks
[ ] No dead code, TODOs, console.logs, unused imports
[ ] Zod validation at every request boundary
[ ] Thin controllers; logic in services; global error handler + consistent responses

TESTS
[ ] Core logic unit-tested; key flows integration-tested; CI green
[ ] Test scope explained in README (or a test plan if time-boxed out)

DOCS / README
[ ] Overview · Setup · Run & Test · Tech used
[ ] Decisions & trade-offs · Assumptions · Scope (in/out)
[ ] Requirements-coverage map · "What I'd do with more time"
[ ] (senior) Security notes · API docs (OpenAPI/Bruno) · Loom walkthrough

SECURITY / POLISH
[ ] Hashed passwords, JWT expiry/rotation, rate limiting, security headers
[ ] Health check; structured logging; secrets via env only; `pnpm audit` clean

SUBMISSION
[ ] Re-read the prompt twice — every requirement & constraint met
[ ] Message: thanks + key files + deviations + known issues + AI disclosure
[ ] AI use disclosed honestly; I can explain every line & prompt
```

### Reviewer scorecard (weighted)
```
Candidate: ______   Reviewer: ______   Time-boxed to: ___h

GATE (fail here usually = reject)
[ ] Runs from a clean clone with documented steps
[ ] No node_modules/secrets committed; README present

SCORED (1 poor · 3 meets · 5 excellent)
Functionality / correctness / edge cases          (~30%)  __/5
Requirements completeness                          (~30%)  __/5
Architecture & decision engineering (trade-offs,   (~25%)  __/5
   layering, right-sized — not over/under-eng.)
Code quality & readability                         (~15%)  __/5
--- supporting signals ---
Tests (judgment > coverage)                                __/5
Documentation (decisions, assumptions, coverage map)       __/5
Git hygiene (atomic, conventional, story)                  __/5
Professional polish (Docker, CI, lint, health, security)   __/5
"Would I want to work with them?" (DX, honesty)            __/5

RED FLAGS (any → discuss before advancing)
[ ] Doesn't run / global deps   [ ] node_modules or secrets committed
[ ] One giant commit            [ ] No/weak README
[ ] Ignored requirements        [ ] Over-engineered / speculative
[ ] Snapshot-only or no tests   [ ] AI output can't be explained

FOLLOW-UP (defence) — did they justify architecture, critique own work,
explain what they'd change/scale, and explain AI use & prompts?

Recommendation:  Strong hire / Hire / Lean no / No
```

---

## 12. Sources

**Lifecycle / reviewer POV:** [BigPanda](https://medium.com/bigpanda-engineering/secrets-from-the-interview-room-what-reviewers-look-for-in-a-take-home-coding-assignment-1aaec70dabe0) · [How not to fail the take-home test](https://dev.to/latobibor/how-not-to-fail-the-take-home-test-568a) · [Geshan](https://geshan.com.np/blog/2020/09/take-home-coding-challenges-outshine-competition/) · [canro91](https://canro91.github.io/2021/11/22/CodingChallengeTips/) · [freeCodeCamp](https://www.freecodecamp.org/news/the-essential-guide-to-take-home-coding-challenges-a0e746220dd7/) · [TieTalent](https://tietalent.com/en/blog/225/home-challenge-strategies-for-success-under-time-pressure) · [Holloway Guide](https://www.holloway.com/g/technical-recruiting-hiring/sections/take-homes) · [AI Engineering Field Guide — home assignments](https://github.com/alexeygrigorev/ai-engineering-field-guide/blob/main/interview/questions/06-home-assignments.md) · [Field Guide — 2026 trends](https://github.com/alexeygrigorev/ai-engineering-field-guide/blob/main/interview/05-trends.md) · [GitLab AI interview policy](https://about.gitlab.com/jobs/ai-interview-process/) · [Tech Interview Handbook rubrics](https://www.techinterviewhandbook.org/coding-interview-rubrics/)

**Code / style:** [Airbnb JS](https://github.com/airbnb/javascript) · [Airbnb React](https://github.com/airbnb/javascript/tree/master/react) · [Google TS Style Guide](https://google.github.io/styleguide/tsguide.html) · [typescript-eslint rules](https://typescript-eslint.io/rules/) · [tsconfig reference](https://www.typescriptlang.org/tsconfig/) · [React — Rules of React](https://react.dev/reference/rules) · [Next.js Server/Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)

**Clean code / architecture:** [Clean Code summary](https://gist.github.com/wojteklu/73c6914cc446146b8b533c0988cf8d29) · [Refactoring Guru — Smells](https://refactoring.guru/refactoring/smells) · [Sandi Metz' Rules](https://thoughtbot.com/blog/sandi-metz-rules-for-developers) · [Fowler — Code Smell](https://martinfowler.com/bliki/CodeSmell.html) · [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) · [Fowler — Service Layer](https://martinfowler.com/eaaCatalog/serviceLayer.html) · [Fowler — Repository](https://martinfowler.com/eaaCatalog/repository.html) · [NestJS Controllers](https://docs.nestjs.com/controllers) · [12-Factor](https://12factor.net/)

**Git / PR:** [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) · [Chris Beams](https://cbea.ms/git-commit/) · [Angular commit guidelines](https://github.com/angular/angular/blob/main/contributing-docs/commit-message-guidelines.md) · [SemVer](https://semver.org/) · [gitignore templates](https://github.com/github/gitignore) · [Google Small CLs](https://google.github.io/eng-practices/review/developer/small-cls.html) · [Google CL Descriptions](https://google.github.io/eng-practices/review/developer/cl-descriptions.html) · [Google Standard of Review](https://google.github.io/eng-practices/review/reviewer/standard.html) · [thoughtbot Code Review](https://github.com/thoughtbot/guides/blob/main/code-review/README.md) · [SmartBear](https://smartbear.com/learn/code-review/best-practices-for-peer-code-review/)

**Testing / docs:** [Fowler — Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html) · [Kent C. Dodds — Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications) · [Testing Library Principles](https://testing-library.com/docs/guiding-principles/) · [makeareadme](https://www.makeareadme.com/) · [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) · [TSDoc](https://tsdoc.org/) · [OpenAPI](https://swagger.io/specification/)

**Security:** [OWASP Top 10 (2021)](https://owasp.org/Top10/2021/) · [OWASP API Top 10 (2023)](https://owasp.org/API-Security/editions/2023/en/0x11-t10/) · [REST Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html) · [Input Validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html) · [Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) · [Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) · [npm audit](https://docs.npmjs.com/auditing-package-dependencies-for-security-vulnerabilities/)

**Field notes (real experiences / keyword bank / logistics):** [Mario Fernandez — how not to do a take-home](https://hceris.com/how-not-to-do-a-take-home-coding-assignment/) · [pragtob — technical challenges](https://pragtob.wordpress.com/2023/11/29/interviewing-tips-technical-challenges-coding-more/) · [Elia Bar — make it stand out](https://eliya-b.medium.com/make-your-take-home-coding-assignment-stand-out-477f6f1efa81) · [Brian Jenney — the AI penalty](https://brianjenney.medium.com/the-ai-penalty-is-real-coding-interviews-just-got-weirder-97d1606a1a90) · [AskCruit — senior framing](https://www.askcruit.com/interviews/technical/acing-take-home-assignment) · [Kitty Giraudel — on take-homes](https://kittygiraudel.com/2026/05/08/on-take-home-coding-assignments/) · [This Dot — common pitfalls](https://www.thisdot.co/blog/how-to-avoid-common-pitfalls-and-ace-your-take-home-assignment) · [techinterview — AI rules 2026](https://www.techinterview.org/post/3233475415/ai-coding-interviews-rules-2026/) · [MindStudio — full-stack TS](https://www.mindstudio.ai/blog/how-to-use-typescript-full-stack-development) · [ADRs](https://adr.github.io/) · HN threads [19739083](https://news.ycombinator.com/item?id=19739083) · [32597502](https://news.ycombinator.com/item?id=32597502) · [40151180](https://news.ycombinator.com/item?id=40151180) · [40200397](https://news.ycombinator.com/item?id=40200397) · GitHub example repos [take-home-test topic](https://github.com/topics/take-home-test) · [felipefialho/frontend-challenges](https://github.com/felipefialho/frontend-challenges) · [poteto/hiring-without-whiteboards](https://github.com/poteto/hiring-without-whiteboards)

---

*Related docs in this repo: [`TAKEHOME_BEST_PRACTICES.md`](../TAKEHOME_BEST_PRACTICES.md) (rubric quick-reference) · [`docs/COMPLIANCE.md`](COMPLIANCE.md) (SOC 2 control matrix) · [`docs/SUBMISSION_TEMPLATE.md`](SUBMISSION_TEMPLATE.md) (fill-in write-up). Companion skills: `takehome-assignment-audit`, `takehome-fullstack-boilerplate`, `scaffold-takehome-boilerplate`.*
