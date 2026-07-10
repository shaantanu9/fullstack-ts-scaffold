# Self-contained image for the MongoDB/Mongoose backend.
# Build context is THIS folder, so it does not depend on the pnpm workspace or
# the other server folder — you can delete server-sql/ and this still builds:
#   docker build -t boilerplate-server-mongo server-mongo
#   docker run -p 5003:5003 --env-file server-mongo/.env boilerplate-server-mongo

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

EXPOSE 5003

USER node

CMD ["dumb-init", "node", "dist/server.js"]
