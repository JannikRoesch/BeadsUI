# ── Stage 1: Build frontend ──────────────────────────────────────────────────
FROM node:22-alpine AS web-builder

WORKDIR /app
RUN npm install -g pnpm

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY packages/web/package.json ./packages/web/
COPY packages/api/package.json ./packages/api/

RUN pnpm install --frozen-lockfile

COPY packages/web ./packages/web
COPY packages/api ./packages/api

RUN pnpm --filter @beadsui/web build

# ── Stage 2: API server (serves frontend + API) ────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app
RUN npm install -g pnpm

# Install bd CLI
RUN npm install -g beads-cli 2>/dev/null || true

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY packages/api/package.json ./packages/api/
RUN pnpm install --frozen-lockfile --filter @beadsui/api

COPY packages/api ./packages/api
COPY --from=web-builder /app/packages/web/dist ./packages/api/public

# Patch API to serve static files from ./public
RUN pnpm --filter @beadsui/api build 2>/dev/null || true

EXPOSE 3001

ENV PORT=3001
ENV NODE_ENV=production

# Mount your beads workspace as /workspace
VOLUME ["/workspace"]
ENV BEADS_WORKSPACE=/workspace

CMD ["node", "--experimental-strip-types", "packages/api/src/index.ts"]
