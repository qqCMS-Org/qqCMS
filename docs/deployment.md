# Deployment

> **Status: NOT IMPLEMENTED** — `Dockerfile` and `docker-compose.yml` exist in the repo root but are not yet configured for the actual apps. Multi-app Docker setup is not done.

## Architecture

Three separate Docker images — one per app:

| Image | App | Port |
|---|---|---|
| `qqcms-api` | `apps/api` (Elysia) | `3000` |
| `qqcms-admin` | `apps/admin` (Astro SSR) | `4321` |
| `qqcms-web` | `apps/web` (Astro SSG, static files) | `4322` |

## docker-compose.yml (planned)

```yaml
services:
  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    ports:
      - "3000:3000"
    env_file:
      - apps/api/.env
    volumes:
      - uploads:/app/uploads

  admin:
    build:
      context: .
      dockerfile: apps/admin/Dockerfile
    ports:
      - "4321:4321"
    depends_on:
      - api

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    ports:
      - "4322:80"
    depends_on:
      - api

volumes:
  uploads:
```

## Per-App Dockerfile Pattern

Each app gets its own `Dockerfile` inside `apps/<name>/`.

```dockerfile
# apps/api/Dockerfile (planned)
FROM oven/bun:1 AS base
WORKDIR /app

COPY package.json bun.lockb turbo.json ./
COPY apps/api/package.json ./apps/api/

RUN bun install --frozen-lockfile

COPY apps/api ./apps/api

EXPOSE 3000
CMD ["bun", "run", "apps/api/src/index.ts"]
```

## Production on Render.com

- Each app can be deployed as a separate **Web Service** on Render.com
- API uses **Bun** as the runtime command: `bun run src/index.ts`
- Admin uses Astro SSR adapter (Node or Bun)
- Web (SSG) is deployed as a **Static Site** — output from `astro build`

## Rebuild Flow on Deploy

See [rebuild-flow.md](./rebuild-flow.md) for how content changes trigger a static rebuild of `apps/web`.

## Environment Variables

See [env.md](./env.md) for the full list of required variables per service.
