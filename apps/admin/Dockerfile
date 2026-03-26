FROM oven/bun:1.3-alpine AS builder

WORKDIR /app

COPY package.json bun.lock turbo.json ./
COPY packages/ ./packages/
COPY apps/admin/ ./apps/admin/

RUN bun install --frozen-lockfile
RUN cd apps/admin && bun run build

FROM nginx:alpine

COPY --from=builder /app/apps/admin/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
