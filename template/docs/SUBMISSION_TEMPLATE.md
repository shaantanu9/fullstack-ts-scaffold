# Submission Write-Up Template

> Fill this in and paste it near the top of your README (or keep it here and link it) before submitting a take-home built on this boilerplate. These are the sections reviewers score hardest — see `../TAKEHOME_BEST_PRACTICES.md` for why.

## What this is

One or two sentences: what the app does and which requirements it satisfies.

## Quick start

> Verify these steps in a **fresh clone** before submitting — "doesn't run" is the #1 rejection.

```bash
cp .env.example .env            # + server/.env, client/.env.local
pnpm install
pnpm db:up
pnpm --filter server db:deploy && pnpm --filter server db:seed
pnpm dev
```

App → http://localhost:3000 · API → http://localhost:5002

## Requirements coverage

| Requirement from the prompt | Where it's implemented | Status |
|---|---|---|
| … | `server/src/services/…` | ✅ |
| … | … | 🟡 partial |

## Architecture & key decisions

- **Layering:** routes → controllers → services → repositories → DB.
- Brief bullets on the shape of the solution and the request/data flow.

## Decisions & trade-offs

> The highest-value section. Show your judgment.

- Chose **X** over **Y** because … (cost, time, simplicity, the actual requirement).
- Deliberately did **not** build **Z** because … .

## Assumptions

- Every ambiguity in the prompt you resolved, and how you resolved it.

## Testing

- What's covered (unit / integration / e2e) and **why those parts** — the interesting logic.
- `pnpm test` · `pnpm test:api` · `pnpm test:e2e`

## What I'd do with more time

- Concrete P1/P2 list (e.g. refresh-token rotation, OpenAPI docs, more edge-case tests, deeper `/health`).

## (Optional) Demo

- 2-minute Loom or a couple of screenshots/GIFs.
