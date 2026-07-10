# Boilerplate Next.js + Express

[![CI](https://github.com/shaantanu9/boilerplate_nexjs_express/actions/workflows/ci.yml/badge.svg)](https://github.com/shaantanu9/boilerplate_nexjs_express/actions/workflows/ci.yml)

Production-ready monorepo boilerplate with **Next.js 15 (App Router)** on the client and **Express + TypeScript** on the server — shipped with **two interchangeable backends** so you can start on either database in seconds.

## Choose your database

The repo ships **two fully-independent backend folders** that expose the **identical REST API** (same routes, same response envelope). They listen on distinct ports and use distinct Redis instances, so you can even run **both at once**:

| Folder | Database | ORM/ODM | Server port | Redis |
|--------|----------|---------|-------------|-------|
| **`server-sql/`** (default) | PostgreSQL (5434) | Prisma | 5002 | 6381 |
| **`server-mongo/`** | MongoDB (27018) | Mongoose | 5003 | 6382 |
| **`server-supabase/`** | Supabase (54321) | `@supabase/supabase-js` (no Prisma) | 5004 | 6383 |

The shared `client/`, `e2e/`, and `bruno/` talk only over HTTP, so they work against **either** backend unchanged. When you start a real project, **pick one and delete the other** — nothing else references it:

```bash
# Going Postgres-only:
rm -rf server-mongo
# then remove the "- 'server-mongo'" line from pnpm-workspace.yaml
#      and the *:mongo scripts from package.json

# Going Mongo-only:
rm -rf server-sql
# remove "- 'server-sql'" from pnpm-workspace.yaml, then rename the
# *:mongo scripts to the defaults (or just use pnpm dev:mongo etc.)
```

Every `pnpm` script has a default (SQL) form and a `:mongo` variant — e.g. `pnpm dev` / `pnpm dev:mongo`, `pnpm test` / `pnpm test:mongo`.

## Stack

- **Client:** Next.js 15, React 19, TypeScript, Tailwind CSS, Zustand, Axios
- **Server:** Express, TypeScript, Redis, JWT (access + rotating refresh), Zod, Winston, Argon2, Swagger/OpenAPI — with Prisma/PostgreSQL, Mongoose/MongoDB, **or** Supabase
- **DevOps:** Docker Compose, PM2, GitHub Actions CI, Husky + lint-staged + commitlint
- **API Testing:** Bruno CLI collection
- **E2E Testing:** Puppeteer

## Project Structure

```
.
├── bruno/                     # Bruno API test collection
├── client/                    # Next.js frontend
│   ├── src/
│   │   ├── app/              # Next.js App Router pages
│   │   ├── components/       # Reusable UI components (ui/ + common/)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # API client and utilities
│   │   ├── stores/           # Zustand state management
│   │   ├── styles/           # Global styles
│   │   ├── types/            # TypeScript types
│   │   └── constants/        # App constants
│   ├── tests/               # Vitest + React Testing Library
│   └── ...config files
├── e2e/                       # Puppeteer end-to-end tests
│   ├── setup.ts             # Spawns real client + server, launches browser
│   ├── globalSetup.ts       # Vitest global setup
│   ├── helpers.ts           # waitForUrl, clickByText, waitForText, …
│   ├── *.test.ts            # auth + home flow tests
│   └── vitest.config.ts
├── server-sql/                # Express backend — PostgreSQL + Prisma (default)
│   ├── src/
│   │   ├── config/           # Environment and app config
│   │   ├── constants/        # HTTP status, messages, roles
│   │   ├── controllers/      # Route controllers
│   │   ├── database/         # Prisma client, repositories + Redis setup
│   │   ├── docs/             # OpenAPI/Swagger spec
│   │   ├── middlewares/      # Express middlewares
│   │   ├── routes/           # Route definitions
│   │   ├── services/         # Business logic
│   │   ├── utils/            # Logger, errors, JWT, password helpers
│   │   ├── validations/      # Zod schemas
│   │   ├── app.ts            # Express app setup
│   │   └── server.ts         # Server bootstrap
│   ├── tests/                # Vitest unit + integration (Supertest)
│   ├── docker-compose.yml    # Postgres + Redis
│   ├── Dockerfile
│   └── ecosystem.config.js   # PM2 config
├── server-mongo/              # Express backend — MongoDB + Mongoose (same API)
│   └── ...                   # identical layout; data layer uses Mongoose
├── .github/workflows/ci.yml   # GitHub Actions CI
├── package.json               # Root workspace config
├── TAKEHOME_BEST_PRACTICES.md # Reviewer rubric + submission guide
└── README.md
```

## Quick Start

### 1. Prerequisites

- Node.js >= 20
- pnpm >= 9
- Docker & Docker Compose

### 2. Install dependencies

```bash
pnpm install
```

> The steps below use the **default Postgres** backend (`server-sql`). For MongoDB, use the `:mongo` variants noted in each step.

### 3. Start infrastructure

```bash
pnpm db:up          # Postgres (5434) + Redis (6381)
# Mongo:  pnpm db:up:mongo   # MongoDB (27018) + Redis (6381)
```

### 4. Setup server environment

```bash
cp server-sql/.env.example server-sql/.env
cp .env.example .env
pnpm --filter server-sql db:deploy   # apply Prisma migrations
pnpm --filter server-sql db:seed     # seed admin user

# Mongo instead:
# cp server-mongo/.env.example server-mongo/.env
# pnpm --filter server-mongo db:seed
```

### 5. Setup client environment

```bash
cp client/.env.example client/.env.local
```

### 6. Run development servers

```bash
pnpm dev            # server-sql + client   (or: pnpm dev:mongo)
```

The two backends use **fixed, distinct ports** so they can run side by side and never collide — `pnpm dev` / `pnpm dev:mongo` each free their own port first (via `predev`), so a leftover server from a previous run is killed and the port reused automatically.

| | App | Postgres/Mongo | Redis | Swagger · Health · Ready |
|---|---|---|---|---|
| **server-sql** | http://localhost:5002 | 5434 | 6381 | `/docs` · `/health` · `/ready` |
| **server-mongo** | http://localhost:5003 | 27018 | 6382 | `/docs` · `/health` · `/ready` |
| **server-supabase** | http://localhost:5004 | 54321 (Supabase CLI) | 6383 | `/docs` · `/health` · `/ready` |

- Client: http://localhost:3000
- If a port is ever stuck, free them all with `pnpm free:ports`.

## Scripts

### Root

| Script | Description |
|--------|-------------|
Each script has a default (Postgres / `server-sql`) form and a `:mongo` variant.

| Script | Description |
|--------|-------------|
| `pnpm dev` / `pnpm dev:mongo` | Run the chosen server + client in dev mode |
| `pnpm build` / `pnpm build:mongo` | Build the chosen server + client |
| `pnpm start` / `pnpm start:mongo` | Start the production server |
| `pnpm test` / `pnpm test:mongo` | Run server + client unit/integration tests |
| `pnpm test:api:sql` / `pnpm test:api:mongo` | Run Bruno API contract tests against a running server (`sql`/`mongo` env) |
| `pnpm test:api:ci` / `pnpm test:api:ci:mongo` | Start the chosen backend and run its Bruno API tests |
| `pnpm free:ports` | Kill anything listening on 5002 / 5003 / 3000 |
| `pnpm test:e2e` / `pnpm test:e2e:mongo` | Run Puppeteer end-to-end tests |
| `pnpm test:all` | Run unit/integration + Bruno + Puppeteer tests |
| `pnpm lint` / `pnpm lint:mongo` | Lint the chosen server + client |
| `pnpm format` | Format code with Prettier |
| `pnpm type-check` / `pnpm type-check:mongo` | Type-check the chosen server + client |
| `pnpm db:up` / `pnpm db:up:mongo` | Start DB + Redis containers |
| `pnpm db:down` / `pnpm db:down:mongo` | Stop infrastructure containers |

### Server (`server-sql` — Prisma scripts; `server-mongo` omits the Prisma-only ones)

| Script | Description |
|--------|-------------|
| `pnpm dev` | Run with tsx watch |
| `pnpm build` | Build with tsup |
| `pnpm start` | Start production build |
| `pnpm test` | Run Vitest tests |
| `pnpm lint` | Lint source and tests |
| `pnpm db:migrate` | Create Prisma migration (server-sql only) |
| `pnpm db:deploy` | Deploy migrations (server-sql only) |
| `pnpm db:studio` | Open Prisma Studio (server-sql only) |
| `pnpm db:seed` | Seed admin user |

### Client

| Script | Description |
|--------|-------------|
| `pnpm dev` | Run Next.js dev server |
| `pnpm build` | Build Next.js app |
| `pnpm test` | Run Vitest tests |
| `pnpm type-check` | Run TypeScript check |

## Architecture & Flow

### Request/Response Flow

```
┌─────────────┐     POST /api/v1/auth/login     ┌──────────────┐
│   Client    │ ───────────────────────────────> │    Server    │
│  /login     │                                  │  Express     │
└─────────────┘                                  └──────┬───────┘
       │                                                │
       │                                                ▼
       │                                       ┌─────────────────┐
       │                                       │ validateRequest │
       │                                       │   (Zod schema)  │
       │                                       └────────┬────────┘
       │                                                │
       │                                                ▼
       │                                       ┌─────────────────┐
       │                                       │ authController  │
       │                                       └────────┬────────┘
       │                                                │
       │                                                ▼
       │                                       ┌─────────────────┐
       │                                       │  authService    │
       │                                       │ - repository    │
       │                                       │ - argon2 check  │
       │                                       │ - JWT tokens    │
       │                                       └────────┬────────┘
       │                                                │
       │                                                ▼
       │                                       ┌─────────────────┐
       │                                       │      Redis      │
       │                                       │  refresh token  │
       │                                       └────────┬────────┘
       │                                                │
       │         { success, data, message }             │
       │ <──────────────────────────────────────────────┘
       │
       ▼
┌─────────────┐
│ Zustand     │
│ authStore   │
└─────────────┘
```

### Authentication Flow

1. User submits credentials on `/login`.
2. Client calls `POST /api/v1/auth/login` via the API wrapper (`lib/api.ts`).
3. Server validates the request body with Zod (`validations/auth.schema.ts`).
4. `authController.login` delegates to `authService.login`.
5. Service verifies the user through the repository abstraction (Prisma **or** Mongoose, depending on the backend).
6. On success, server issues a short-lived JWT access token and a longer-lived refresh token (unique `jti` per token).
7. Only a **SHA-256 hash** of the refresh token is stored in Redis (key = `refresh_token:{userId}:{hash}`), so lookups are O(1) and the raw token is never persisted.
8. Client stores access token in Zustand (`stores/authStore.ts`) and refresh token via Zustand persist.
9. Authenticated requests include `Authorization: Bearer <accessToken>`.
10. `authMiddleware` verifies the access token and attaches `req.user`.
11. On 401, the Axios interceptor silently refreshes — the endpoint **rotates** the refresh token (old one revoked, new pair issued) and the client stores the new one.
12. On logout, the presented refresh token is deleted from Redis.

### Authorization Flow

- `authMiddleware` ensures the user is authenticated.
- `requireRole(...)` restricts routes to specific roles (`USER`, `ADMIN`, `MODERATOR`).
- Only `ADMIN` and `MODERATOR` can update users; only `ADMIN` can delete users.

## API Endpoints

### Auth

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/register` | Register new user | No |
| POST | `/api/v1/auth/login` | Login user | No |
| POST | `/api/v1/auth/refresh-token` | Refresh access token | No |
| POST | `/api/v1/auth/logout` | Logout user | Yes |
| GET | `/api/v1/auth/me` | Get current user | Yes |

### Users

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/v1/users` | List users | Yes | Any |
| GET | `/api/v1/users/:id` | Get user by ID | Yes | Any |
| PATCH | `/api/v1/users/:id` | Update user | Yes | Admin/Moderator |
| DELETE | `/api/v1/users/:id` | Delete user | Yes | Admin |

### Operational

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Liveness probe (process is up) |
| GET | `/ready` | Readiness probe (checks DB + Redis) |
| GET | `/docs` | Swagger UI |
| GET | `/openapi.json` | Raw OpenAPI 3 spec |

## Database

The repository pattern (`src/database/repositories/`) keeps business logic database-agnostic — services depend only on a `UserRepository` interface, which is implemented by Prisma (`server-sql`) or Mongoose (`server-mongo`).

```env
# server-sql
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/boilerplate_db?schema=public
# server-mongo
DATABASE_URL=mongodb://mongo:mongo@localhost:27018/boilerplate_db?authSource=admin
```

For `server-sql`, apply Prisma migrations after starting the container:

```bash
pnpm --filter server-sql db:deploy
```

## Environment Variables

### Server (`server-sql/.env` or `server-mongo/.env`)

```env
NODE_ENV=development
PORT=5002
CLIENT_URL=http://localhost:3000
API_PREFIX=/api/v1

# server-sql:  postgresql://postgres:postgres@localhost:5434/boilerplate_db?schema=public
# server-mongo: mongodb://mongo:mongo@localhost:27018/boilerplate_db?authSource=admin
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/boilerplate_db?schema=public

REDIS_URL=redis://localhost:6381
ACCESS_TOKEN_SECRET=change-me-access-token-secret-min-32-chars-long
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=change-me-refresh-token-secret-min-32-chars-long
REFRESH_TOKEN_EXPIRY=7d
LOG_LEVEL=info
```

### Client (`client/.env.local`)

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5002/api/v1
```

## Testing

### Server

```bash
pnpm test          # server-sql + client   (or: pnpm test:mongo)
```

Each backend covers utilities, middlewares, validations, services, repositories, and integration tests for auth and user endpoints using Supertest (including refresh-token rotation and the `/ready` probe).

### Client

```bash
cd client
pnpm test
```

Uses Vitest + React Testing Library + jsdom for component, hook, store, and utility tests.

### API Contract Tests (Bruno)

A Bruno collection is provided under `bruno/Boilerplate API/` covering all endpoints.

```bash
# Start the dev server first
pnpm dev                 # server-sql on :5002   (or: pnpm dev:mongo on :5003)

# In another terminal, run the API tests against the matching backend
pnpm test:api:sql        # env sql   → http://localhost:5002
pnpm test:api:mongo      # env mongo → http://localhost:5003
```

The collection ships two Bruno environments (`sql`, `mongo`) that differ only by `baseUrl`, so the same requests run against either backend.

### End-to-End Tests (Puppeteer)

Puppeteer tests spin up the real client and server in a headless browser and verify full user flows.

```bash
pnpm test:e2e
```

Note: E2E tests manage their own client and server processes. If you already have `pnpm dev` running, stop it first or run `pnpm test:api` separately.

### Run Everything

```bash
pnpm test:all
```

This runs unit/integration tests, Bruno API tests, and Puppeteer E2E tests in sequence.

## Deployment

### Server with PM2 (example: `server-sql`)

```bash
cd server-sql
pnpm install --frozen-lockfile
pnpm build
pnpm db:deploy        # server-sql only
pm2 start ecosystem.config.js
```

### Server with Docker

Each server's Dockerfile is self-contained (build context = the server folder), so it builds even after you delete the other backend:

```bash
docker build -t boilerplate-server-sql server-sql
docker run -p 5002:5002 --env-file server-sql/.env boilerplate-server-sql

# or Mongo (listens on 5003 per server-mongo/.env):
docker build -t boilerplate-server-mongo server-mongo
docker run -p 5003:5003 --env-file server-mongo/.env boilerplate-server-mongo
```

### Client

Build the Next.js app and deploy the `out` or `.next` folder to your hosting provider:

```bash
cd client
pnpm install --frozen-lockfile
pnpm build
```

## Security

- **Helmet** for secure HTTP headers
- **CORS** configured for the client origin (allows all origins in development)
- **Redis-backed rate limiting** (shared across PM2 cluster workers) — global limit + stricter limits on auth routes
- **Zod** request validation at every boundary
- **Argon2id** password hashing
- **JWT** access + **rotating** refresh tokens (unique `jti`); only a SHA-256 hash of the refresh token is stored in Redis
- **Redis** token revocation (logout + rotation)

## Code quality & git hooks

- **ESLint + Prettier** (strict, type-checked rules) and strict `tsconfig`
- **Husky** pre-commit hook → **lint-staged** (auto-lint/format staged files)
- **commitlint** commit-msg hook enforcing [Conventional Commits](https://www.conventionalcommits.org/)
- **GitHub Actions CI**: lint → typecheck → test → build for both backends + client, plus Bruno API + Puppeteer E2E

## Using this as a take-home starter

This repo is designed as a starting point for full-stack take-home assignments.

- **`TAKEHOME_BEST_PRACTICES.md`** — the reviewer rubric, README essentials, red-flag list, and how this repo maps to each.
- **`docs/SUBMISSION_TEMPLATE.md`** — a fill-in write-up (decisions, trade-offs, assumptions, "with more time") to paste into your README before submitting.
- **`CONTRIBUTING.md`** — local dev setup, coding standards, and commit conventions.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE) © Shantanu Bombatkar
