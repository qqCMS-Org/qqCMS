# Environment Variables

> **Status: PARTIALLY IMPLEMENTED** — `.env.example` does not exist yet. Variables listed here are defined in the SRS.

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
bun -e "console.log(await Bun.password.hash('yourpassword'))"
```

## `.env.example`

> **Not created yet.** Should be committed to the repo with all keys and no real values.

```sh
# apps/api/.env.example (to be created)
ADMIN_LOGIN=
ADMIN_PASSWORD_HASH=
JWT_SECRET=
CORS_ORIGINS=http://localhost:4321,http://localhost:4322
DATABASE_URL=
UPLOAD_DIR=./uploads
PUBLIC_CLIENT_URL=http://localhost:4321
PORT=3000
```

## Security Rules

- Never commit `.env` to git — it is in `.gitignore`
- `ADMIN_PASSWORD_HASH` must be a bcrypt hash, not a plain password
- `JWT_SECRET` must be at least 32 characters of random data
