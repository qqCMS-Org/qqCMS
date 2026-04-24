# Environment Variables

> **Status: IMPLEMENTED** — `.env.example` and validation logic are set up in `apps/api`.

## Required Variables

These must be set before the API server starts. The server validates their presence at startup and throws if any are missing.

| Variable | Description | Example |
|---|---|---|
| `ADMIN_LOGIN` | Administrator login | `admin` |
| `ADMIN_PASSWORD_HASH` | bcrypt hash of admin password | `$2b$10$...` |
| `JWT_SECRET` | Secret for signing JWT tokens (min 32 chars) | `supersecretkey...` |
| `CORS_ORIGINS` | Comma-separated list of allowed origins | `http://localhost:4321,https://mysite.com` |

## Optional Variables

| Variable | Description | Default |
|---|---|---|
| `DEBUG` | Enable debug logging output | `false` |
| `DATABASE_URL` | DB connection string. If not set → SQLite | — (SQLite) |
| `UPLOAD_DIR` | Path to file upload directory | `./uploads` |
| `PUBLIC_CLIENT_URL` | URL of the public Astro client (for rebuild webhook) | — |
| `PORT` | Port the API server listens on | `3000` |

## SQLite vs PostgreSQL

```sh
# SQLite (default — no variable needed)
# DATABASE_URL not set

# PostgreSQL
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
# login: admin / password: admin
# Bcrypt embeds the salt inside the hash — no separate SALT variable needed.
# To generate a new hash run:
#   bun -e "import bcrypt from 'bcryptjs'; console.log(await bcrypt.hash('YOUR_PASSWORD', 10));"
ADMIN_LOGIN=admin
ADMIN_PASSWORD_HASH=$2b$10$9DKY3FWLDwBeJ7D7aR9u3eIcsDuOQx6yCmMZ.YDr/fxgalr6W8aBm

# Debug logging (set to "true" to enable Logger.debug() output)
DEBUG=false

# JWT
JWT_SECRET=your-super-secret-jwt-key

# CORS
CORS_ORIGINS=http://localhost:3001,http://localhost:3000

# Database (leave empty to use SQLite)
DATABASE_URL=

# File uploads
UPLOAD_DIR=./uploads

# Public client URL (for rebuild webhook)
PUBLIC_CLIENT_URL=http://localhost:3001

# Server port
PORT=3000
```

## Security Rules

- Never commit `.env` to git — it is in `.gitignore`
- `ADMIN_PASSWORD_HASH` must be a bcrypt hash, not a plain password
- `JWT_SECRET` must be at least 32 characters of random data
