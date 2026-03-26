# ── shared base ──────────────────────────────────────────────────────────────
FROM oven/bun:1.3-alpine AS base
WORKDIR /app
COPY package.json bun.lock turbo.json ./
COPY packages/ ./packages/

# ── api ───────────────────────────────────────────────────────────────────────
FROM base AS api
COPY apps/api/ ./apps/api/
RUN bun install --frozen-lockfile
WORKDIR /app/apps/api
EXPOSE 3000
CMD ["bun", "run", "src/index.ts"]

# ── admin builder ─────────────────────────────────────────────────────────────
FROM base AS admin-builder
COPY apps/admin/ ./apps/admin/
RUN bun install --frozen-lockfile
RUN cd apps/admin && bun run build

FROM nginx:alpine AS admin
COPY --from=admin-builder /app/apps/admin/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# ── web builder ───────────────────────────────────────────────────────────────
FROM base AS web-builder
COPY apps/web/ ./apps/web/
RUN bun install --frozen-lockfile
RUN cd apps/web && bun run build

FROM oven/bun:1.3-alpine AS web
WORKDIR /app
COPY --from=web-builder /app/apps/web/dist ./dist
EXPOSE 3002
CMD ["bun", "./dist/server/entry.mjs"]
