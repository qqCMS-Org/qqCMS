# Project Refactoring & Documentation Plan

## Phase 1: Infrastructure & Documentation
- [x] Initialize `docs/architecture.md` (high-level structure)
- [x] Initialize `docs/state.md` (frontend state management strategy)
- [x] Initialize `docs/api.md` (backend API overview)
- [x] Set up `docs/design.md` to link with `../qqCMS-design/` (HTML/JSX design source)
- [x] Add `docs/database.md` (schema, tables, dual-DB strategy)
- [x] Add `docs/auth.md` (JWT flow, credentials, protected routes)
- [x] Add `docs/env.md` (environment variables reference)
- [x] Add `docs/deployment.md` (Docker, docker-compose, Render.com)
- [x] Add `docs/i18n.md` (language routing, admin UI i18n)
- [x] Add `docs/media.md` (upload flow, MIME validation, storage)
- [x] Add `docs/rebuild-flow.md` (SSG webhook trigger)
- [x] Add `docs/adr/` (ADR-001 Bun, ADR-002 Elysia, ADR-003 Astro, ADR-004 Drizzle)

## Phase 2: Admin Panel

> **Agent rule**: complete one step, then **stop and ask the user to review** before proceeding to the next.

### Step 1 — Foundation
- [x] Install DaisyUI and `@preact/signals` in `apps/admin`
- [x] Create custom DaisyUI theme in `apps/admin/tailwind.config.mjs` from design tokens in `../qqCMS-design/index.html` CSS variables
- [x] Create FSD folder structure in `apps/admin/src/` (`app/`, `widgets/`, `features/`, `entities/`, `shared/`)
- [x] Create `apps/admin/src/app/layouts/AdminLayout.astro` — shell with sidebar + topbar slots
- [x] Create `apps/admin/src/shared/api/client.ts` — Eden Treaty client pointing to API

> ⛔ Stop here. Ask user to review layout shell and project structure before continuing.

### Step 2 — Login page (`/login`)
- [ ] Create `apps/admin/src/pages/login.astro` — redirect to `/` if already authenticated (check cookie via Astro middleware)
- [ ] Create `apps/admin/src/features/auth/LoginForm.tsx` — Preact island with email + password fields, Signals for loading/error state
- [ ] Create `apps/admin/src/app/middleware.ts` — protect all routes except `/login`, redirect to `/login` if no valid JWT cookie
- [ ] Wire `LoginForm` to `POST /auth/login` via Eden Treaty client

> ⛔ Stop here. Ask user to test login flow (valid credentials, invalid credentials, redirect after login).

### Step 3 — Dashboard (`/`)
- [ ] Create `apps/admin/src/pages/index.astro` — fetch basic stats server-side (page count, language count, media count) and pass as props
- [ ] Create `apps/admin/src/widgets/dashboard/StatsBar.tsx` — simple cards showing counts
- [ ] Add logout button in topbar wired to `POST /auth/logout`

> ⛔ Stop here. Ask user to verify dashboard loads, stats display, and logout works.

### Step 4 — Pages list (`/pages`)
- [ ] Create `apps/admin/src/pages/pages/index.astro` — fetch pages list server-side
- [ ] Create `apps/admin/src/widgets/pages-list/PagesTable.tsx` — Preact island, table with slug, title, language columns, delete button
- [ ] Create `apps/admin/src/features/pages/DeletePageButton.tsx` — calls `DELETE /pages/:id`, invalidates table

> ⛔ Stop here. Ask user to verify the pages list renders and delete works.

### Step 5 — Page editor (`/pages/new` and `/pages/:id/edit`)
- [ ] Create `apps/admin/src/pages/pages/new.astro`
- [ ] Create `apps/admin/src/pages/pages/[id]/edit.astro` — fetch page + translations server-side
- [ ] Create `apps/admin/src/widgets/page-editor/PageEditor.tsx` — Preact island with language tabs, slug field, TipTap editor per language
- [ ] Install TipTap (`@tiptap/core`, `@tiptap/starter-kit`, `@tiptap/react`)
- [ ] Wire save to `PUT /pages/:id/translations/:lang`

> ⛔ Stop here. Ask user to test creating a page, editing translations, and saving.

### Step 6 — Languages (`/languages`)
- [ ] Create `apps/admin/src/pages/languages/index.astro` — fetch languages server-side
- [ ] Create `apps/admin/src/widgets/languages/LanguagesTable.tsx` — Preact island, toggle active, add language, delete
- [ ] Wire to `GET /languages`, `POST /languages`, `PATCH /languages/:id`, `DELETE /languages/:id`

> ⛔ Stop here. Ask user to verify language management works end-to-end.

### Step 7 — Navigation editor (`/navigation`)
- [ ] Create `apps/admin/src/pages/navigation/index.astro`
- [ ] Create `apps/admin/src/widgets/navigation/NavigationEditor.tsx` — Preact island, list of nav items with drag-to-reorder, add/delete
- [ ] Wire to `GET /navigation`, `POST /navigation`, `PATCH /navigation/:id`, `DELETE /navigation/:id`, `PATCH /navigation/reorder`

> ⛔ Stop here. Ask user to verify navigation editing and reordering works.

### Step 8 — Media library (`/media`)
- [ ] Create `apps/admin/src/pages/media/index.astro`
- [ ] Create `apps/admin/src/widgets/media/MediaLibrary.tsx` — Preact island, grid of uploaded files, upload button
- [ ] Wire to `GET /media`, `POST /media` (multipart upload), `DELETE /media/:id`

> ⛔ Stop here. Ask user to verify file upload and media grid.

### Step 9 — Settings (`/settings`)
- [ ] Create `apps/admin/src/pages/settings/index.astro`
- [ ] Create `apps/admin/src/widgets/settings/SettingsForm.tsx` — Preact island, key-value settings form
- [ ] Wire to `GET /settings`, `PUT /settings/:key`
- [ ] Add "Rebuild site" button wired to rebuild webhook

> ⛔ Stop here. Ask user to verify settings save and rebuild trigger.

## Phase 3: Backend Initialization
- [x] Initialize Elysia server in `apps/api`
- [x] Set up Drizzle with PGLite (schemas, migrations, repositories)
- [x] Add core infrastructure (`Database`, `Logger`, `EventBus`, pagination utils)

## Phase 4: CI/CD & Tooling
- [x] Configure Biome for unified formatting across monorepo
- [ ] Set up Turborepo remote caching (if applicable)

## Phase 5: Feature Implementation
- [ ] Implement core CMS entities (Content, Schema, User)
