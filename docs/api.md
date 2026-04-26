# API Overview

> **Status: NOT IMPLEMENTED** — `apps/api` is empty. All endpoints listed here are planned.

## Backend Server

- **Framework**: ElysiaJS
- **Runtime**: Bun
- **Port**: `3000` (default)
- **Auth**: JWT in httpOnly cookie — see [auth.md](./auth.md)
- **Database**: Drizzle ORM (PGLite by default / PostgreSQL in production) — see [database.md](./database.md)

## Module Structure

```
apps/api/src/modules/
├── auth/          # POST /auth/login, POST /auth/logout
├── pages/         # CRUD for pages and page_translations
├── navigation/    # CRUD for navigation_items
├── media/         # Upload and list media files
├── settings/      # Key-value settings
└── languages/     # CRUD for site languages
```

## Endpoints

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/login` | No | Login with login + password |
| `POST` | `/auth/logout` | Yes | Clear JWT cookie |

### Pages

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/pages` | No | List all pages |
| `GET` | `/pages/:id` | No | Get page with all translations |
| `POST` | `/pages` | Yes | Create a new page |
| `PATCH` | `/pages/:id` | Yes | Update page (slug, is_homepage) |
| `DELETE` | `/pages/:id` | Yes | Delete page and translations |
| `PUT` | `/pages/:id/translations/:lang` | Yes | Upsert translation for a language |

### Navigation

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/navigation` | No | Get all navigation items (ordered) |
| `POST` | `/navigation` | Yes | Create navigation item |
| `PATCH` | `/navigation/:id` | Yes | Update item |
| `DELETE` | `/navigation/:id` | Yes | Delete item |
| `PATCH` | `/navigation/reorder` | Yes | Update order of items |

### Media

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/media` | Yes | List all media files |
| `POST` | `/media` | Yes | Upload file (multipart/form-data) |
| `DELETE` | `/media/:id` | Yes | Delete file from disk and DB |

### Languages

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/languages` | No | List all languages |
| `POST` | `/languages` | Yes | Add a language |
| `PATCH` | `/languages/:id` | Yes | Update label or is_active |
| `DELETE` | `/languages/:id` | Yes | Remove a language |

### Settings

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/settings` | No | Get all settings |
| `PUT` | `/settings/:key` | Yes | Set a setting value |

## Treaty Client

The `App` type is exported from `apps/api/src/index.ts` and imported in `apps/admin`:

```ts
// apps/admin/src/shared/api/client.ts (planned)
import { treaty } from "@elysiajs/eden"
import type { App } from "@repo/server"

export const api = treaty<App>(import.meta.env.PUBLIC_API_URL)
```

## Middleware

| Middleware | Description |
|---|---|
| `auth.middleware.ts` | Verifies JWT cookie on protected routes |
| `cors.middleware.ts` | Allows origins from `CORS_ORIGINS` env var |
| `rateLimit.middleware.ts` | Rate limits all API endpoints |
