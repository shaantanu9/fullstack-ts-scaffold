# Contributing

Thanks for contributing. This repo is a full-stack TypeScript boilerplate (Next.js client + Express server) intended as a take-home-assignment starter. Keep it clean, typed, and tested.

## Getting started

```bash
pnpm install
pnpm db:up                                   # Postgres + Redis via Docker
cp server/.env.example server/.env
cp client/.env.example client/.env.local
cp .env.example .env
pnpm --filter server db:deploy               # apply migrations
pnpm --filter server db:seed                 # seed admin user
pnpm dev                                      # client :3000 · server :5002
```

## Before you open a PR

Run the full local gate — CI runs the same checks:

```bash
pnpm lint
pnpm type-check
pnpm test
pnpm build
```

## Coding standards

- **TypeScript strict**; no stray `any` (use `unknown` at boundaries, then narrow).
- **Layering (server):** `routes → controllers → services → repositories → DB`. No business logic in routes or controllers.
- **Validation:** every external input goes through a Zod schema at the boundary; infer types from the schema.
- **Formatting:** Prettier + ESLint must pass clean. Run `pnpm format` before committing.
- **No dead code, no debug `console.log`, no committed secrets.** `.env` files are gitignored — update `.env.example` when you add a variable.

## Commit conventions

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add refresh-token rotation
fix: correct PORT default in env config
test: cover authMiddleware role checks
refactor: extract user pagination into service
chore: bump dependencies
docs: expand README testing section
```

Keep commits **atomic** — one logical change per commit, staged by explicit path. The git history should read as a story of how the feature was built.

## Tests

- **Unit** — services, utils, validations (Vitest).
- **Integration** — API endpoints via Supertest against real Postgres + Redis.
- **API contract** — Bruno collection under `bruno/`.
- **E2E** — Puppeteer flows in `e2e/`.

New behavior needs a test. Bug fixes need a regression test.
