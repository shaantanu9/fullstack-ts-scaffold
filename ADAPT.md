# ADAPT — Layer the Assignment On Top of the Green Base

You just scaffolded a **verified-green** full-stack repo. The reviewer does not
reward the boilerplate — they reward **the assignment's feature, done cleanly, on a
solid base.** This is the mechanical playbook for that. Keep the base green after
every slice.

## 0. Read the assignment, then map it to the layers (5 min)

Write down, in one line each:

- **Domain entity/entities** the assignment adds (e.g. `Task`, `Order`, `Note`).
- **Endpoints** required (method + path + auth?).
- **UI screens/flows** required.
- **The one thing they're actually testing** (usually: can you model data + wire a
  clean request lifecycle + validate + test — not "how many features").

Then delete what you won't use so the diff looks purpose-built:
- Keep **one** backend unless the assignment explicitly wants DB-agnosticism
  (`--only sql|mongo` at scaffold time already did this if you chose).
- Remove demo features the assignment doesn't need (e.g. the ImageKit upload demo)
  so the submission reads as tailored, not padded.

## 1. Add the entity across the layer path (the core of the work)

Follow the repo's existing lifecycle — **route → validate → auth → rate-limit →
controller → service → repository → DB** — and copy the shape of the `User` feature,
which already threads all layers. Do it in this order:

1. **Schema / model**
   - `server-sql`: add the model to `src/database/prisma/schema.prisma`, then
     `pnpm --filter server-sql db:migrate --name add_<entity>`.
   - `server-mongo` (if kept): add a matching Mongoose model under
     `src/database/models/` with the **same fields** as the Prisma model.
2. **Repository** — add a `<Entity>Repository` **interface** + one implementation per
   backend (Prisma impl in server-sql, Mongoose impl in server-mongo). Guard invalid
   ids so "not found → 404" behaves identically on both.
3. **Service** — pure business logic, depends only on the repository interface. No
   `req`/`res`, no audit calls needing request context (do those in the controller).
4. **Controller** — reads validated input, calls the service, shapes the response,
   emits request-aware audit/log lines.
5. **Validation** — a Zod schema in `src/validations/`; wire it as route middleware.
6. **Route** — register under the versioned router; attach `authenticate` +
   `rateLimit` middleware exactly like the user routes.
7. **Keep the two backends' DB-agnostic files byte-identical** — controllers,
   services, validations, routes should differ ONLY in the repository wiring.

## 2. Prove the endpoint for real (not just a 200)

- **Bruno request** — add a request to `bruno/Boilerplate API/` for each new endpoint;
  set/read vars so it runs in both `sql` and `mongo` envs. Run it with the CI script
  that **boots the server first** (plain `pnpm test:api` needs a server already running):
  - both-backends repo: `pnpm test:api:ci` (sql) and `pnpm test:api:ci:mongo`.
  - `--only <db>` repo: just `pnpm test:api:ci` (mongo/sql is the default — no suffix).
- **Integration test** — add a Supertest spec under the backend's `tests/integration/`
  that hits the real route through the real DB (happy path + 401 + validation-fail +
  not-found). This is the highest-signal test a reviewer reads.
- **Unit test** — service logic with a mocked repository.

## 3. Client (Next.js + Tailwind)

- Add the typed API calls to the client's API layer (mirror the existing auth calls +
  axios refresh interceptor — don't hand-roll fetch).
- Build the screen/flow the assignment asks for; reuse the existing auth store +
  route protection. Wire the four UI states (loading / empty / error / data).
- Add a component/store test mirroring the existing ones.

## 4. Tell the story (what wins reviews)

- **README**: replace the boilerplate intro with — what the assignment asked,
  how to run it (one block), your **key decisions + trade-offs**, and what you'd do
  with more time. Reviewers grade this heavily.
- **Changelog**: one entry per slice under `changelogs/`.
- Remove any leftover demo/marketing copy that isn't about the assignment.

## 5. Green gate before every commit

Re-run the same gate the scaffold ran, for the backend(s) you kept. **Command names depend
on how you scaffolded:** a `--only <db>` repo has mongo/sql promoted to the **base** scripts
(`pnpm dev`, `pnpm test`, `pnpm db:up`, `pnpm test:api:ci` — no `:mongo`/`:sql` suffix); the
both-backends repo keeps sql as base and adds `:mongo` variants. Replace `<server>` with your
kept backend (`server-mongo` or `server-sql`):

```bash
# --only <db> repo (simplest — base names target the kept backend):
pnpm db:up && pnpm test && pnpm build        # server + client: lint·tsc·test·build
pnpm test:api:ci                             # Bruno contract (boots the server)
pnpm test:e2e                                # Puppeteer (optional but strong)

# both-backends repo (target one explicitly):
pnpm db:up            # (or db:up:mongo for the mongo stack)
pnpm --filter <server> lint && pnpm --filter <server> exec tsc --noEmit \
  && pnpm --filter <server> test && pnpm --filter <server> build
pnpm --filter client lint && pnpm --filter client type-check \
  && pnpm --filter client test && pnpm --filter client build
pnpm test:api:ci      # (or test:api:ci:mongo)
```

Commit small, one feature-slice per commit, conventional message, no vague "updates".
If it isn't green, it isn't done.

## Anti-patterns that cost points

- Sharing files between the two backends (breaks "delete one, no impact").
- Business logic in controllers, or `req` leaking into services.
- Endpoints with no validation, or that return 200 on bad input.
- A PR full of boilerplate demo features the assignment never asked for.
- "Works on my machine" — if you skipped the green gate, CI will out you.
