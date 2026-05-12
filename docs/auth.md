# Authentication

## Overview

The system supports a single administrator role. There is no registration flow. Credentials are set via environment variables and never stored in the database.

## Credentials Storage

- `ADMIN_LOGIN` — plain text login, read from `.env`
- `ADMIN_PASSWORD_HASH` — bcrypt hash of the password, read from `.env`

The password is **never stored in the database**. On login, the server compares the incoming password against the hash from `.env` using bcrypt.

## Login Flow

```
POST /auth/login
  { login, password }
       │
       ▼
  Compare login === ADMIN_LOGIN
       │
       ▼
  bcrypt.compare(password, ADMIN_PASSWORD_HASH)
       │
    success
       │
       ▼
  Generate JWT (signed with JWT_SECRET, 7d expiry)
       │
       ▼
  Set-Cookie: token=<jwt>; HttpOnly; Secure; SameSite=Strict
       │
       ▼
  Return { ok: true }
```

## JWT Token

- Signed with `JWT_SECRET` from `.env`
- Expiry: 7 days
- Stored in **httpOnly cookie** — not accessible via `document.cookie`
- Cookie flags: `HttpOnly`, `Secure`, `SameSite=Strict`

## Protected Routes

All API routes except `POST /auth/login` require a valid JWT.

The auth middleware reads the `token` cookie, verifies it with `JWT_SECRET`, and rejects with `401 Unauthorized` if invalid or missing.

The JWT middleware lives in `apps/api/src/shared/middleware/`.

## Logout Flow

```
POST /auth/logout
  → Clears the token cookie (Set-Cookie: token=; Max-Age=0)
  → Returns { ok: true }
```

## Security Notes

- `NFR-SEC-01`: Password hash is in `.env`, never in DB
- `NFR-SEC-02`: JWT in httpOnly cookie, not accessible via JS
- `NFR-SEC-03`: All protected routes run auth middleware before handler
