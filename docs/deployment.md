# Deployment

> **Status: IMPLEMENTED** — root `Dockerfile` and `docker-compose.yml` support `api`, `admin`, and `web` targets.

## Dokploy (branch `feat/admin-panel`, PGLite path)

Use Dokploy **Compose Application** with:

- Repository: `qqCMS-Org/qqCMS`
- Branch: `feat/admin-panel`
- Compose path: `docker-compose.yml`

`docker-compose.yml` is configured for the default **PGLite** mode:

- `api` mounts `pglite_data` to `/app/apps/api/data`
- API database file persists at `/app/apps/api/data/qqcms.db`
- `DATABASE_URL` is not required unless you explicitly switch to PostgreSQL

Minimal required setup:

1. Create `apps/api/.env` from `apps/api/.env.example`
2. Set required API vars (`ADMIN_LOGIN`, `ADMIN_PASSWORD_HASH`, `JWT_SECRET`)
3. Set `CORS_ORIGINS` to the actual admin/web origins (IP/localhost is fine before a final domain is ready)
4. Set `REVALIDATE_SECRET` for the `web` service in Dokploy environment variables

### `ADMIN_PASSWORD_HASH` note (`$` interpolation)

Avoid passing bcrypt hashes through Compose interpolation (for example `ADMIN_PASSWORD_HASH=${ADMIN_PASSWORD_HASH}`), because `$` fragments can be interpreted as variables by Compose/Dokploy.

Recommended for this repo:

- keep API secrets in `apps/api/.env`
- use escaped `$` in that file (as in `.env.example`): `\$2b\$10\$...`

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
