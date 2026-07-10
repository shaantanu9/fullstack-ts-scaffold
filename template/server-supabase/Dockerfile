# Self-contained image for the Supabase backend.
# Build context is THIS folder, so it does not depend on the pnpm workspace or
# the other server folders — you can delete them and this still builds:
#   docker build -t boilerplate-server-supabase server-supabase
#   docker run -p 5004:5004 --env-file server-supabase/.env boilerplate-server-supabase
# NOTE: the Supabase stack itself is managed by the Supabase CLI, not this image.

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm@9

COPY package.json ./
RUN pnpm install --no-frozen-lockfile

COPY . .
RUN pnpm build
RUN pnpm prune --prod

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache dumb-init

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 5004

USER node

CMD ["dumb-init", "node", "dist/server.js"]
