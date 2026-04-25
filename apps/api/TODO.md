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

- [x] Install `drizzle-orm`, `drizzle-kit`, `better-sqlite3` (SQLite), `postgres` (PostgreSQL)
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

- [ ] Create `src/shared/middleware/cors.middleware.ts` — allow origins from `CORS_ORIGINS` env var
- [ ] Create `src/shared/middleware/auth.middleware.ts` — verify JWT from httpOnly cookie; reject with `401` if invalid or missing
- [ ] Create `src/shared/middleware/rateLimit.middleware.ts` — rate limit all endpoints

## 6. Auth Module (`/auth`)

- [ ] Create `src/modules/auth/auth.service.ts`:
  - `login(login, password)` — compare against `ADMIN_LOGIN` + bcrypt verify against `ADMIN_PASSWORD_HASH`; sign JWT; return signed token
  - `logout()` — return cookie-clearing instructions
- [ ] Create `src/modules/auth/auth.controller.ts`:
  - `POST /auth/login` — call `login`, set httpOnly cookie, return `{ ok: true }` (401 on invalid credentials)
  - `POST /auth/logout` — call `logout`, clear cookie, return `{ ok: true }`
- [ ] Create `src/modules/auth/auth.types.ts` — TypeBox schema `LoginSchema` (`login`, `password`)
- [ ] Create `src/modules/auth/index.ts` — barrel export

## 7. Pages Module (`/pages`)

- [ ] Create `src/modules/pages/pages.service.ts`:
  - `listPages()` — get all pages
  - `getPage(id)` — get one page with all its translations; 404 if not found
  - `createPage(data)` — insert; enforce single `is_homepage` (unset previous if needed, use transaction)
  - `updatePage(id, data)` — patch slug / `is_homepage`; enforce homepage uniqueness
  - `deletePage(id)` — delete page (translations cascade)
  - `upsertTranslation(pageId, langCode, data)` — upsert translation for a language
- [ ] Create `src/modules/pages/pages.controller.ts`:
  - `GET /pages` — public
  - `GET /pages/:id` — public
  - `POST /pages` — protected
  - `PATCH /pages/:id` — protected
  - `DELETE /pages/:id` — protected (204)
  - `PUT /pages/:id/translations/:lang` — protected
- [ ] Create `src/modules/pages/pages.types.ts` — TypeBox schemas: `CreatePageSchema`, `UpdatePageSchema`, `UpsertTranslationSchema`
- [ ] Create `src/modules/pages/index.ts` — barrel export

## 8. Navigation Module (`/navigation`)

- [ ] Create `src/modules/navigation/navigation.service.ts`:
  - `listNavigationItems()` — ordered by `order`
  - `createNavigationItem(data)` — insert
  - `updateNavigationItem(id, data)` — patch
  - `deleteNavigationItem(id)` — delete
  - `reorderNavigationItems(orderedIds)` — batch update `order` field in a transaction
- [ ] Create `src/modules/navigation/navigation.controller.ts`:
  - `GET /navigation` — public
  - `POST /navigation` — protected
  - `PATCH /navigation/:id` — protected
  - `DELETE /navigation/:id` — protected (204)
  - `PATCH /navigation/reorder` — protected
- [ ] Create `src/modules/navigation/navigation.types.ts` — `CreateNavigationItemSchema`, `UpdateNavigationItemSchema`, `ReorderSchema`
- [ ] Create `src/modules/navigation/index.ts` — barrel export

## 9. Media Module (`/media`)

- [ ] Create `src/modules/media/media.service.ts`:
  - `listMedia()` — get all media records
  - `uploadMedia(file)` — validate MIME type (allow list) + size (≤ 10 MB); generate UUID filename; save to `UPLOAD_DIR`; insert DB record; return full record
  - `deleteMedia(id)` — delete file from disk + delete DB record; 404 if not found
- [ ] Create `src/modules/media/media.controller.ts`:
  - `GET /media` — protected
  - `POST /media` — protected, multipart/form-data
  - `DELETE /media/:id` — protected (204)
- [ ] Register static file serving for `UPLOAD_DIR` at `/uploads` path
- [ ] Ensure `UPLOAD_DIR` is created on server startup if it does not exist
- [ ] Create `src/modules/media/media.types.ts` — `MediaRecord` interface, allowed MIME list constant
- [ ] Create `src/modules/media/index.ts` — barrel export

## 10. Languages Module (`/languages`)

- [ ] Create `src/modules/languages/languages.service.ts`:
  - `listLanguages()` — get all languages
  - `createLanguage(data)` — insert; 409 if code already exists
  - `updateLanguage(id, data)` — patch label / `is_active`; 404 if not found
  - `deleteLanguage(id)` — delete; 404 if not found
- [ ] Create `src/modules/languages/languages.controller.ts`:
  - `GET /languages` — public
  - `POST /languages` — protected
  - `PATCH /languages/:id` — protected
  - `DELETE /languages/:id` — protected (204)
- [ ] Create `src/modules/languages/languages.types.ts` — `CreateLanguageSchema`, `UpdateLanguageSchema`
- [ ] Create `src/modules/languages/index.ts` — barrel export

## 11. Settings Module (`/settings`)

- [ ] Create `src/modules/settings/settings.service.ts`:
  - `listSettings()` — get all key-value pairs
  - `setSetting(key, value)` — upsert setting by key
- [ ] Create `src/modules/settings/settings.controller.ts`:
  - `GET /settings` — public
  - `PUT /settings/:key` — protected
- [ ] Create `src/modules/settings/settings.types.ts` — `SetSettingSchema`
- [ ] Create `src/modules/settings/index.ts` — barrel export

## 12. Entry Point

- [ ] Create `src/index.ts` — register all modules + middleware; `listen` on `PORT`; export `App` type
- [ ] Add `apps/api` `package.json` with `name: "@repo/server"` and `exports: { ".": "./src/index.ts" }` for Eden Treaty consumption
- [ ] Add `dev`, `start`, `build` scripts to `apps/api/package.json`

## 13. Error Handling

- [ ] Implement global error handler in Elysia — map thrown errors to `{ error, code }` JSON responses with correct HTTP status codes
- [ ] Return `{ error, code, details[] }` shape for TypeBox validation errors

## 14. Rebuild Webhook

- [ ] Create `src/modules/rebuild/rebuild.service.ts` — POST to `PUBLIC_CLIENT_URL/api/revalidate` with a shared secret
- [ ] Trigger rebuild after any write operation on pages, navigation, languages, or settings
- [ ] Create `src/modules/rebuild/index.ts` — barrel export

## 15. Tests

- [ ] Write unit tests for `auth.service.ts` (login happy path, wrong password, wrong login)
- [ ] Write unit tests for `pages.service.ts` (create, homepage uniqueness, 404 behavior)
- [ ] Write unit tests for `navigation.service.ts` (reorder logic)
- [ ] Write unit tests for `media.service.ts` (MIME validation, size validation)
- [ ] Write unit tests for `languages.service.ts` (duplicate code conflict)
- [ ] Write unit tests for `settings.service.ts` (upsert behavior)
