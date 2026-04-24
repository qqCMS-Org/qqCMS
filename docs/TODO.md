# Project Refactoring & Documentation Plan

## Phase 1: Infrastructure & Documentation
- [x] Initialize `docs/architecture.md` (high-level structure)
- [x] Initialize `docs/state.md` (frontend state management strategy)
- [x] Initialize `docs/api.md` (backend API overview)
- [x] Set up `docs/design.md` to link with `qqCMS.pen` and `_designContext/`
- [x] Add `docs/database.md` (schema, tables, dual-DB strategy)
- [x] Add `docs/auth.md` (JWT flow, credentials, protected routes)
- [x] Add `docs/env.md` (environment variables reference)
- [x] Add `docs/deployment.md` (Docker, docker-compose, Render.com)
- [x] Add `docs/i18n.md` (language routing, admin UI i18n)
- [x] Add `docs/media.md` (upload flow, MIME validation, storage)
- [x] Add `docs/rebuild-flow.md` (SSG webhook trigger)
- [x] Add `docs/adr/` (ADR-001 Bun, ADR-002 Elysia, ADR-003 Astro, ADR-004 Drizzle)

## Phase 2: Frontend Refactoring (FSD)
- [ ] Refactor `apps/admin/src` to FSD layers
- [ ] Refactor `apps/web/src` to FSD layers
- [ ] Refactor `packages/ui/src` into a shared library structure aligned with FSD principles

## Phase 3: Backend Initialization
- [x] Initialize Elysia server in `apps/api`
- [x] Set up Drizzle with dual-DB support (SQLite & PostgreSQL)

## Phase 4: CI/CD & Tooling
- [x] Configure Biome for unified formatting across monorepo
- [ ] Set up Turborepo remote caching (if applicable)

## Phase 5: Feature Implementation
- [ ] Implement core CMS entities (Content, Schema, User)
