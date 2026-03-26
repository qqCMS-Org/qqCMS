FROM oven/bun:1.3-alpine AS builder

WORKDIR /app

COPY package.json bun.lock turbo.json ./
COPY packages/ ./packages/
COPY apps/web/ ./apps/web/

RUN bun install --frozen-lockfile
RUN cd apps/web && bun run build

FROM oven/bun:1.3-alpine

WORKDIR /app

COPY --from=builder /app/apps/web/dist ./dist

EXPOSE 3002

CMD ["bun", "./dist/server/entry.mjs"]
