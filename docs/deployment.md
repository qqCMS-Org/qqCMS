# Deployment

> **Status: IMPLEMENTED** — root `Dockerfile` and `docker-compose.yml` support `api`, `admin`, and `web` targets.

## Dokploy (PGLite path)

Use Dokploy **Compose Application** with:

- Repository: `qqCMS-Org/qqCMS`
- Branch: `feat/admin-panel` (or your deployment branch with the same compose setup)
- Compose path: `docker-compose.yml`

`docker-compose.yml` is configured for the default **PGLite** mode:

- `api` mounts `pglite_data` to `/app/apps/api/data`
- API database file persists at `/app/apps/api/data/qqcms.db` (set in `apps/api/src/db/index.ts`)
- `DATABASE_URL` is not required unless you explicitly switch to PostgreSQL

Minimal required setup:

1. Set required API vars in Dokploy (`ADMIN_LOGIN`, `ADMIN_PASSWORD_HASH`, `JWT_SECRET`, `CORS_ORIGINS`)
2. Set `CORS_ORIGINS` to the actual admin/web origins (IP/localhost is fine before a final domain is ready)
3. Set `REVALIDATE_SECRET` for the `web` service in Dokploy environment variables
4. Keep `DATABASE_URL` unset to stay on PGLite

For optional API variables (such as `UPLOAD_DIR` or `RUN_MIGRATIONS_ON_STARTUP`), see [env.md](./env.md).

### `ADMIN_PASSWORD_HASH` note (`$` interpolation)

Avoid passing bcrypt hashes through Compose interpolation (e.g. `ADMIN_PASSWORD_HASH=${ADMIN_PASSWORD_HASH}`). The `$` characters in bcrypt hashes can be interpreted as variable references by Compose/Dokploy and corrupt the hash value.

Recommended for this repo:

- set API env vars directly in Dokploy (or an external secret manager)
- do not put `ADMIN_PASSWORD_HASH` in compose `${...}` expressions

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
