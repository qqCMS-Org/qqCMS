# Environment Variables

> **Status: IMPLEMENTED** — `.env.example` and validation logic are set up in `apps/api`.

## Required Variables

These must be set before the API server starts. The server validates their presence at startup and throws if any are missing.

| Variable | Description | Example |
|---|---|---|
| `ADMIN_LOGIN` | Administrator login | `admin@example.com` |
| `ADMIN_PASSWORD_HASH` | bcrypt hash of admin password | `$2b$10$...` |
| `JWT_SECRET` | Secret for signing JWT tokens (min 32 chars) | `supersecretkey...` |
| `CORS_ORIGINS` | Comma-separated list of allowed origins | `http://localhost:4321,https://mysite.com` |

If you do not have a final domain yet, use the real temporary origins you open in browser (e.g. server IP + port):

```sh
CORS_ORIGINS=http://YOUR_SERVER_IP:3001,http://YOUR_SERVER_IP:3002
```

Use this only as a temporary setup for testing. Replace IP/localhost origins with final HTTPS domains before production.

## Optional Variables

| Variable | Description | Default |
|---|---|---|
| `DEBUG` | Enable debug logging output | `false` |
| `DATABASE_URL` | DB connection string. If not set → PGLite (local file) | — (PGLite) |
| `UPLOAD_DIR` | Path to file upload directory | `./uploads` |
| `PUBLIC_CLIENT_URL` | URL of the public website (for rebuild webhook) | `http://localhost:4322` |
| `PORT` | Port the API server listens on | `3000` |
| `RUN_MIGRATIONS_ON_STARTUP` | Run DB migrations on every startup. Disable in multi-instance deployments. | `false` |

## Public Website Variables (`apps/web`)

| Variable | Description | Example |
|---|---|---|
| `PUBLIC_API_URL` | API endpoint visible to the browser | `http://localhost:3000` |
| `REVALIDATE_SECRET` | Shared secret for `/api/revalidate` webhook (must match API caller) | `some-random-secret` |

> The rebuild webhook in `apps/web/src/pages/api/revalidate.ts` validates the `x-revalidate-secret` header against this variable. If the variable is not set, the endpoint rejects all requests.

## PGLite vs PostgreSQL

```sh
# PGLite (default — no variable needed)
# DATABASE_URL not set → uses ./data/qqcms.db via PGLite

# PostgreSQL (production)
DATABASE_URL=postgresql://user:password@localhost:5432/qqcms
```

## Generating a Password Hash

```sh
# Run once to generate ADMIN_PASSWORD_HASH
bun -e "import bcrypt from 'bcryptjs'; console.log(await bcrypt.hash('YOUR_PASSWORD', 10));"
```

## `.env.example`

> **Created in `apps/api/.env.example`.**

```sh
# Admin credentials
# login: admin@example.com / password: admin
# To generate a new hash run:
#   bun -e "import bcrypt from 'bcryptjs'; console.log(await bcrypt.hash('YOUR_PASSWORD', 10));"
# Note: Bun expands $ in .env — prefix each $ with \ to prevent it
ADMIN_LOGIN=admin@example.com
ADMIN_PASSWORD_HASH=\$2b\$10\$ETeFKRO0Bjf/sjtc2kpdQuGQL69BdpjbVcPn8t9iDjqkF5TKJk/rW

# Debug logging
DEBUG=false

# JWT
JWT_SECRET=your-super-secret-jwt-key

# CORS (comma-separated allowed origins)
CORS_ORIGINS=http://localhost:4321,http://localhost:3001

# Database (leave empty to use PGLite)
DATABASE_URL=

# Public website URL (for rebuild webhook)
PUBLIC_CLIENT_URL=http://localhost:4322

# File uploads
UPLOAD_DIR=./uploads

# Server port
PORT=3000
```

For Dokploy + Compose, set API values in Dokploy environment variables and avoid compose interpolation (`${...}`) for bcrypt hash values.

## Security Rules

- Never commit `.env` to git — it is in `.gitignore`
- `ADMIN_PASSWORD_HASH` must be a bcrypt hash, not a plain password
- `JWT_SECRET` must be at least 32 characters of random data
