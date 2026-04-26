# API Development TODO

## 1. Project Initialization

- [x] Scaffold Elysia app with `bun create elysia` inside `apps/api`
- [x] Configure `tsconfig.json` extending `@repo/typescript-config/base.json`
- [x] Add path aliases: `@core`, `@modules`, `@repository`, `@schema`, `@shared`
- [x] Configure Biome via shared `@repo/biome-config`
- [x] Add `apps/api` to `turbo.json` task graph

## 2. Environment & Configuration

- [x] Create `apps/api/.env.example` with all required variables (`ADMIN_LOGIN`, `ADMIN_PASSWORD_HASH`, `JWT_SECRET`, `CORS_ORIGINS`, `DATABASE_URL`, `UPLOAD_DIR`, `PUBLIC_CLIENT_URL`, `PORT`)
- [x] Add `apps/api/.env` to `.gitignore`
- [x] Implement env validation at startup — throw on missing required variables
- [x] Export typed `config` object from `src/shared/config.ts`

## 3. Database — Drizzle ORM

### 3.1 Core DB setup

- [x] Install `drizzle-orm`, `drizzle-kit`, `@electric-sql/pglite` (PGLite, локально), `postgres` (PostgreSQL)
- [x] Create `src/db/index.ts` — export `db` instance with dual-DB strategy (SQLite if no `DATABASE_URL`, PostgreSQL otherwise)
- [x] Register `db` to Drizzle relation query builder

### 3.2 Schema definitions

- [x] Create `src/db/schema/pages.ts` — `pages` table (UUID PK, `slug`, `is_homepage`, timestamps)
- [x] Create `src/db/schema/page-translations.ts` — `page_translations` table (UUID PK, `page_id` FK cascade, `language_code`, `title`, `content` JSON; unique on `(page_id, language_code)`)
- [x] Create `src/db/schema/navigation-items.ts` — `navigation_items` table (UUID PK, `label` JSON, `href`, `order`, `parent_id` self-ref FK nullable)
- [x] Create `src/db/schema/media.ts` — `media` table (UUID PK, `filename`, `original_name`, `mime_type`, `size`, `url`, `created_at`)
- [x] Create `src/db/schema/languages.ts` — `languages` table (UUID PK, `code` unique, `label`, `is_active`)
- [x] Create `src/db/schema/settings.ts` — `settings` table (UUID PK, `key` unique, `value` JSON)
- [x] Create `src/db/schema/index.ts` — re-export all schemas (required for drizzle-kit)

### 3.3 Repositories

- [x] Create `src/db/repository/pages.ts` — `getPages`, `getPage`, `insertPage`, `updatePage`, `deletePage`
- [x] Create `src/db/repository/page-translations.ts` — `getTranslationsByPage`, `upsertTranslation`, `deleteTranslation`
- [x] Create `src/db/repository/navigation-items.ts` — `getNavigationItems`, `getNavigationItem`, `insertNavigationItem`, `updateNavigationItem`, `deleteNavigationItem`, `reorderNavigationItems`
- [x] Create `src/db/repository/media.ts` — `getMediaFiles`, `getMediaFile`, `insertMedia`, `deleteMedia`
- [x] Create `src/db/repository/languages.ts` — `getLanguages`, `getLanguage`, `insertLanguage`, `updateLanguage`, `deleteLanguage`
- [x] Create `src/db/repository/settings.ts` — `getSettings`, `getSetting`, `upsertSetting`

### 3.4 Migrations

- [x] Configure `drizzle.config.ts` (pointing to `src/db/schema/index.ts`)
- [x] Generate initial migration with `bunx drizzle-kit generate`
- [x] Add `db:generate` and `db:migrate` scripts to `package.json`

## 4. Core Infrastructure

- [x] Create `src/core/Database.ts` — singleton `db` export used by all repositories
- [x] Create `src/core/Logger.ts` — structured logger (wrapping `console`)
- [x] Create `src/core/EventBus.ts` — minimal pub/sub for decoupled modules (if needed by rebuild flow)
- [x] Create `src/shared/constants.ts` — shared app-wide constants (allowed MIME types, max upload size, etc.)
- [x] Create `src/shared/utils/pagination.ts` — cursor-based pagination helper

## 5. Middleware

- [x] Create `src/shared/middleware/cors.middleware.ts` — allow origins from `CORS_ORIGINS` env var
- [x] Create `src/shared/middleware/auth.middleware.ts` — verify JWT from httpOnly cookie; reject with `401` if invalid or missing; exposes `authPlugin` with `requireAuth` macro
- [x] Create `src/shared/middleware/rateLimit.middleware.ts` — rate limit all endpoints (100 req/min per IP)
- [x] Create `src/shared/errors.ts` — `NotFoundError`, `ConflictError`, `UnauthorizedError` custom error classes

- [x] Create `src/shared/middleware/cors.middleware.ts` — allow origins from `CORS_ORIGINS` env var
- [x] Create `src/shared/middleware/auth.middleware.ts` — verify JWT from httpOnly cookie; reject with `401` if invalid or missing
- [x] Create `src/shared/middleware/rateLimit.middleware.ts` — rate limit all endpoints

## 6. Auth Module (`/auth`)

- [x] Create `src/modules/auth/auth.service.ts`
- [x] Create `src/modules/auth/auth.controller.ts`
- [x] Create `src/modules/auth/auth.types.ts` — TypeBox schema `LoginSchema`
- [x] Create `src/modules/auth/index.ts` — barrel export

## 7. Pages Module (`/pages`)

- [x] Create `src/modules/pages/pages.service.ts`
- [x] Create `src/modules/pages/pages.controller.ts`
- [x] Create `src/modules/pages/pages.types.ts`
- [x] Create `src/modules/pages/index.ts` — barrel export

## 8. Navigation Module (`/navigation`)

- [x] Create `src/modules/navigation/navigation.service.ts`
- [x] Create `src/modules/navigation/navigation.controller.ts`
- [x] Create `src/modules/navigation/navigation.types.ts`
- [x] Create `src/modules/navigation/index.ts` — barrel export

## 9. Media Module (`/media`)

- [x] Create `src/modules/media/media.service.ts`
- [x] Create `src/modules/media/media.controller.ts`
- [x] Register static file serving for `UPLOAD_DIR` at `/uploads` path
- [x] Ensure `UPLOAD_DIR` is created on server startup if it does not exist
- [x] Create `src/modules/media/media.types.ts`
- [x] Create `src/modules/media/index.ts` — barrel export

## 10. Languages Module (`/languages`)

- [x] Create `src/modules/languages/languages.service.ts`
- [x] Create `src/modules/languages/languages.controller.ts`
- [x] Create `src/modules/languages/languages.types.ts`
- [x] Create `src/modules/languages/index.ts` — barrel export

## 11. Settings Module (`/settings`)

- [x] Create `src/modules/settings/settings.service.ts`
- [x] Create `src/modules/settings/settings.controller.ts`
- [x] Create `src/modules/settings/settings.types.ts`
- [x] Create `src/modules/settings/index.ts` — barrel export

## 12. Entry Point

- [x] Update `src/index.ts` — register all modules + middleware; `listen` on `PORT`; export `App` type
- [x] Add `apps/api` `package.json` with `name: "@repo/server"` and `exports: { ".": "./src/index.ts" }` for Eden Treaty consumption
- [x] Add `dev`, `start`, `build` scripts to `apps/api/package.json`

## 13. Error Handling

- [x] Implement global error handler in Elysia — map thrown errors to `{ error, code }` JSON responses with correct HTTP status codes
- [x] Return `{ error, code, details }` shape for TypeBox validation errors

## 14. Rebuild Webhook

- [x] Create `src/modules/rebuild/rebuild.service.ts` — POST to `PUBLIC_CLIENT_URL/api/revalidate` with a shared secret
- [x] Trigger rebuild after any write operation on pages, navigation, languages, or settings
- [x] Create `src/modules/rebuild/index.ts` — barrel export

## 15. Tests

- [x] Write unit tests for `auth.service.ts` (login happy path, wrong password, wrong login)
- [x] Write unit tests for `pages.service.ts` (create, homepage uniqueness, 404 behavior)
- [x] Write unit tests for `navigation.service.ts` (reorder logic)
- [x] Write unit tests for `media.service.ts` (MIME validation, size validation)
- [x] Write unit tests for `languages.service.ts` (duplicate code conflict)
- [x] Write unit tests for `settings.service.ts` (upsert behavior)
