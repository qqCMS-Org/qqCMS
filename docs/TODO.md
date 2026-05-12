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
- [x] Create custom DaisyUI theme in `apps/admin/tailwind.config.mjs` from design tokens in `prototype/index.html` CSS variables
- [x] Create FSD folder structure in `apps/admin/src/` (`app/`, `widgets/`, `features/`, `entities/`, `shared/`)
- [x] Create `apps/admin/src/app/layouts/AdminLayout.astro` — shell with sidebar + topbar slots
- [x] Create `apps/admin/src/shared/api/client.ts` — Eden Treaty client pointing to API

> ⛔ Stop here. Ask user to review layout shell and project structure before continuing.

### Step 2 — Login page (`/login`)
- [x] Create `apps/admin/src/pages/login.astro` — redirect to `/` if already authenticated (check cookie via Astro middleware)
- [x] Create `apps/admin/src/features/auth/LoginForm.tsx` — Preact island with email + password fields, Signals for loading/error state
- [x] Create `apps/admin/src/app/middleware.ts` — protect all routes except `/login`, redirect to `/login` if no valid JWT cookie
- [x] Wire `LoginForm` to `POST /auth/login` via Eden Treaty client

> ⛔ Stop here. Ask user to test login flow (valid credentials, invalid credentials, redirect after login).

### Step 3 — Dashboard (`/`)
- [x] Create `apps/admin/src/pages/index.astro` — fetch basic stats server-side (page count, language count, media count) and pass as props
- [x] Create `apps/admin/src/widgets/dashboard/StatsBar.tsx` — simple cards showing counts
- [x] Add logout button in topbar wired to `POST /auth/logout`
- [x] Create `apps/admin/src/widgets/sidebar/SidebarNav.tsx` — responsive sidebar (desktop) + bottom tab bar (mobile)

> ⛔ Stop here. Ask user to verify dashboard loads, stats display, and logout works.

### Step 4 — Pages list (`/pages`)
- [x] Create `apps/admin/src/pages/pages/index.astro` — fetch pages list server-side
- [x] Create `apps/admin/src/widgets/pages-list/PagesTable.tsx` — Preact island, table with slug, title, language columns, delete button
- [x] Create `apps/admin/src/features/pages/DeletePageButton.tsx` — calls `DELETE /pages/:id`, invalidates table

> ⛔ Stop here. Ask user to verify the pages list renders and delete works.

### Step 5 — Page editor (`/pages/new` and `/pages/:id/edit`)
- [x] Create `apps/admin/src/pages/pages/new.astro`
- [x] Create `apps/admin/src/pages/pages/[id]/edit.astro` — fetch page + translations server-side
- [x] Create `apps/admin/src/widgets/page-editor/PageEditor.tsx` — Preact island with language tabs, slug field, TipTap editor per language
- [x] Install TipTap (`@tiptap/core`, `@tiptap/starter-kit`, `@tiptap/react`)
- [x] Wire save to `PUT /pages/:id/translations/:lang`

> ⛔ Stop here. Ask user to test creating a page, editing translations, and saving.

### Step 6 — Languages (`/languages`)
- [x] Create `apps/admin/src/pages/languages/index.astro` — fetch languages server-side
- [x] Create `apps/admin/src/widgets/languages/LanguagesTable.tsx` — Preact island, toggle active, add language, delete
- [x] Wire to `GET /languages`, `POST /languages`, `PATCH /languages/:id`, `DELETE /languages/:id`

> ⛔ Stop here. Ask user to verify language management works end-to-end.

### Step 7 — Navigation editor (`/navigation`)
- [x] Create `apps/admin/src/pages/navigation/index.astro`
- [x] Create `apps/admin/src/widgets/navigation/NavigationEditor.tsx` — Preact island, list of nav items with drag-to-reorder, add/delete
- [x] Wire to `GET /navigation`, `POST /navigation`, `PATCH /navigation/:id`, `DELETE /navigation/:id`, `PATCH /navigation/reorder`

> ⛔ Stop here. Ask user to verify navigation editing and reordering works.

### Step 8 — Media library (`/media`)
- [x] Create `apps/admin/src/pages/media/index.astro`
- [x] Create `apps/admin/src/widgets/media/MediaLibrary.tsx` — Preact island, grid of uploaded files, upload button
- [x] Wire to `GET /media`, `POST /media` (multipart upload), `DELETE /media/:id`

> ⛔ Stop here. Ask user to verify file upload and media grid.

### Step 9 — Settings (`/settings`)
- [x] Create `apps/admin/src/pages/settings/index.astro`
- [x] Create `apps/admin/src/widgets/settings/SettingsForm.tsx` — Preact island, key-value settings form
- [x] Wire to `GET /settings`, `PUT /settings/:key`
- [x] Add "Rebuild site" button wired to rebuild webhook

> ⛔ Stop here. Ask user to verify settings save and rebuild trigger.

## Phase 3: Backend Initialization
- [x] Initialize Elysia server in `apps/api`
- [x] Set up Drizzle with PGLite (schemas, migrations, repositories)
- [x] Add core infrastructure (`Database`, `Logger`, `EventBus`, pagination utils)

## Phase 2 (continued): Collections

### Step 10 — Collections backend
- [x] Add DB schema: `collections`, `collection_fields`, `collection_entries` tables
- [x] Generate and run Drizzle migration
- [x] Add repository functions: `collections.ts`, `collection-fields.ts`, `collection-entries.ts`
- [x] Add `apps/api/src/modules/collections/` (types, service, controller, index)
- [x] Register `collectionsModule` in `apps/api/src/index.ts`

### Step 11 — Collections admin UI
- [x] Create `apps/admin/src/pages/collections/index.astro`
- [x] Create `apps/admin/src/widgets/collections/CollectionsManager.tsx` (full UI per prototype)
- [x] Export widget from `apps/admin/src/widgets/collections/index.ts`

### Step 12 — Collection field editing
- [x] Add pencil icon button next to each field's delete button in `CollectionsManager.tsx`
- [x] Implement inline edit form (or modal) to change field name and field type
- [x] Add `PATCH /collections/:id/fields/:fieldId` endpoint in `apps/api/src/modules/collections/`
- [x] On field rename or type change — clear all values for that column in `collection_entries` (nullify the key in the JSON data)
- [x] On field delete — same clearing logic (already deletes the field row, ensure entry data is cleaned up too)

## Phase 4: CI/CD & Tooling
- [x] Configure Biome for unified formatting across monorepo
- [ ] Set up Turborepo remote caching (if applicable)

## Phase 5: Feature Implementation

## Phase 6: Shared TipTap renderer (`packages/ui`)

> **Why here**: TipTap node components are plain Preact TSX. In Astro they render as static HTML (no `client:*` directive = zero JS). Moving them to `packages/ui` now means `apps/admin` can import the same components later for a live page preview — no code duplication.

> **Flexibility principle**: adding a custom content block = (1) create one `.tsx` file in `packages/ui/src/tiptap/nodes/`, (2) add one line to `defaultRegistry`. Nothing else changes in either app.

> **Styling**: all node components use **Tailwind CSS** utility classes. `packages/ui` does not bundle Tailwind itself — classes are resolved by whichever app consumes the components (`apps/web`, `apps/admin`). Use semantic prose classes where possible (`prose` plugin if added, or explicit `text-base`, `font-bold`, `italic`, etc.).

> **Agent rule**: complete one step, then **stop and ask the user to review** before proceeding to the next.

### Step 1 — TipTap renderer in `packages/ui`
- [x] Add `astro` as a dev dependency in `packages/ui` (needed only for type compat with Astro imports; no integration required)
- [x] Create `packages/ui/src/tiptap/types.ts` — `TipTapNode` interface and `NodeRegistry` type (`Record<string, ComponentType<{ node: TipTapNode }>>`)
- [x] Create node renderer components in `packages/ui/src/tiptap/nodes/`:
  - `DocNode.tsx` — renders `node.content` children recursively
  - `ParagraphNode.tsx` — `<p class="mb-4">`
  - `HeadingNode.tsx` — `<h1>`–`<h6>` based on `node.attrs.level`; apply `text-3xl font-bold` … `text-lg font-semibold` via level map
  - `TextNode.tsx` — raw text with marks applied (`bold` → `<strong class="font-bold">`, `italic` → `<em class="italic">`, `underline` → `<u>`, `strike` → `<s>`, `code` → `<code class="bg-base-200 px-1 rounded text-sm font-mono">`, `link` → `<a class="link link-primary" href>`); use **DaisyUI** `link` class for links
  - `BulletListNode.tsx` — `<ul class="list-disc pl-6 mb-4">`
  - `OrderedListNode.tsx` — `<ol class="list-decimal pl-6 mb-4">`
  - `ListItemNode.tsx` — `<li class="mb-1">`
  - `BlockquoteNode.tsx` — `<blockquote class="border-l-4 border-base-300 pl-4 italic text-base-content/70">`
  - `CodeBlockNode.tsx` — `<pre class="bg-base-200 rounded p-4 overflow-x-auto text-sm font-mono"><code>`
  - `HardBreakNode.tsx` — `<br />`
  - `HorizontalRuleNode.tsx` — `<hr class="divider" />` (DaisyUI `divider`)
  - `ImageNode.tsx` — `<img class="rounded-box max-w-full" src alt>` from `node.attrs`
  - `YoutubeNode.tsx` — `<div class="aspect-video"><iframe class="w-full h-full" ...>` from `node.attrs`
- [x] Create `packages/ui/src/tiptap/TipTapRenderer.tsx` — accepts `node: TipTapNode` and `registry: NodeRegistry`; recursively maps `node.content[]` through registry; falls back to `<span data-unknown-node={type} />` for unregistered types
- [x] Create `packages/ui/src/tiptap/registry.ts` — `defaultRegistry` mapping all standard node types to their components above
- [x] Create `packages/ui/src/tiptap/index.ts` barrel — export `TipTapRenderer`, `defaultRegistry`, `NodeRegistry`, `TipTapNode`
- [x] Re-export from `packages/ui/src/index.ts`

> ⛔ Stop here. Ask user to review the renderer and registry before wiring to any app.

## Phase 7: Public Web Client (`apps/web`)

> **Architecture**: mirrors `apps/admin` exactly — same FSD layers, same path alias set, same Eden Treaty client pattern, same Tailwind + DaisyUI. `apps/web` is Astro **hybrid** mode: content pages are prerendered (SSG), root `/` and `/api/revalidate` are SSR.

> **UI rule**: use components from `@repo/ui` (`Button`, `Card`, `Input`, `Toggle`, `Logo`) wherever applicable. All markup must use **Tailwind CSS** utility classes + **DaisyUI** component classes — no inline styles, no custom CSS unless there is no Tailwind equivalent.

> **Agent rule**: complete one step, then **stop and ask the user to review** before proceeding to the next.

### Step 1 — Foundation & Config
- [x] Switch `output` to `static` (Astro v5+ removed `hybrid`; same behaviour — individual pages use `export const prerender = false`) in `apps/web/astro.config.mjs`
- [x] Install Tailwind CSS v4 + `@tailwindcss/vite` in `apps/web` (same versions as `apps/admin`)
- [x] Install DaisyUI in `apps/web` + add custom theme from design tokens in `prototype/index.html` (same as `apps/admin`)
- [x] Mirror `apps/admin/tsconfig.json` path aliases in `apps/web/tsconfig.json`: `@app/*`, `@layouts`, `@widgets/*`, `@features/*`, `@entities/*`, `@shared/*`, `@repo/types`, `@repo/server/client`, `@repo/ui`, `@api-shared/*`
- [x] Create FSD folder skeleton: `src/app/styles/`, `src/widgets/`, `src/features/`, `src/entities/`, `src/shared/ui/`, `src/shared/api/`, `src/shared/config/`
- [x] Create `src/shared/api/client.ts` — Eden Treaty client using `PUBLIC_API_URL` env var (mirror `apps/admin/src/shared/api/client.ts`)
- [x] Create `src/layouts/WebLayout.astro` — HTML shell: `<head>` with title/description slots, `<body class="bg-base-100 text-base-content">` with `<Header>` slot + `<slot />`; accepts `title`, `description`, `lang` props; sets `<html lang={lang} data-theme="...">`; import Tailwind global CSS from `@app/styles`
- [x] Create `src/layouts/index.ts` barrel

> ⛔ Stop here. Ask user to review the foundation before continuing.

### Step 2 — Header widget
- [x] Create `src/widgets/header/Header.astro` — accepts `navItems`, `languages`, `currentLang`, `currentSlug` as props (data fetched by the page, not inside the widget); use `<Logo />` from `@repo/ui`; use DaisyUI `navbar`, `menu`, `btn` classes for layout and nav links
- [x] Create `src/features/language-switch/LanguageSwitcher.astro` — renders `<a class="btn btn-ghost btn-xs">` links for each active language; active lang gets `btn-active`; zero JS
- [x] Create `src/widgets/header/index.ts` barrel

> ⛔ Stop here. Ask user to verify the header renders nav and language switcher correctly.

### Step 3 — SSG page generation
- [x] Create `src/entities/page/getAllPublishedPages.ts` — calls `GET /languages` + `GET /pages`, returns `{ lang, page }[]` pairs for all published pages × active languages
- [x] Create `src/entities/page/getPageTranslation.ts` — calls `GET /pages/:id`, returns the translation for a given language
- [x] Create `src/entities/page/index.ts` barrel
- [x] Create `src/pages/[lang]/[...slug].astro`:
  - `export const prerender = true`
  - `getStaticPaths()` uses `getAllPublishedPages()` to emit all `{ params, props }` pairs
  - Fetches translation via `getPageTranslation()`
  - Renders `<WebLayout>` + `<Header>` + `<TipTapRenderer node={translation.published_content} registry={defaultRegistry} />` (imported from `@repo/ui`)

> ⛔ Stop here. Ask user to run `bun run build --cwd apps/web` and verify static pages are generated.

### Step 4 — Root redirect (SSR)
- [x] Replace placeholder `src/pages/index.astro`:
  - Read `Accept-Language` header → parse language codes
  - Fetch active languages from API
  - Match to active languages; fall back to first active
  - Fetch homepage slug (`is_homepage: true`)
  - `return Astro.redirect(\`/\${lang}/\${slug}\`, 302)`
- [x] Fix `src/middleware.ts` — skip caching for non-200 responses (currently missing this guard)

> ⛔ Stop here. Ask user to verify root `/` redirects correctly.

### Step 5 — Revalidate webhook (SSR)
- [x] Implement `src/pages/api/revalidate.ts` (`export const prerender = false`):
  - Verify `x-revalidate-secret` with `crypto.timingSafeEqual` against `REVALIDATE_SECRET` env var
  - On valid: POST to `DEPLOY_HOOK_URL` if set, otherwise return `{ ok: true }`
  - On invalid: return `401`

> ⛔ Stop here. Ask user to test revalidation end-to-end.

### Step 6 — 404 page & polish
- [x] Create `src/pages/404.astro` using `WebLayout`; use DaisyUI `hero` class for the not-found message layout; use `<Button>` from `@repo/ui` for the "go home" link
- [x] Add `PUBLIC_API_URL`, `REVALIDATE_SECRET`, `DEPLOY_HOOK_URL` to `.env.example`
- [x] Update `docs/web.md` with final structure and custom block guide
