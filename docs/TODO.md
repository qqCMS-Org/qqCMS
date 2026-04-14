# Project Refactoring & Documentation Plan

## Phase 1: Infrastructure & Documentation
- [ ] Initialize `docs/architecture.md` (high-level structure)
- [ ] Initialize `docs/state.md` (frontend state management strategy)
- [ ] Initialize `docs/api.md` (backend API overview)
- [ ] Set up `docs/design.md` to link with `qqCMS.pen` and `_designContext/`

## Phase 2: Frontend Refactoring (FSD)
- [ ] Refactor `apps/admin/src` to FSD layers
- [ ] Refactor `apps/web/src` to FSD layers
- [ ] Refactor `packages/ui/src` into a shared library structure aligned with FSD principles

## Phase 3: Backend Initialization
- [ ] Initialize Elysia server in `apps/api`
- [ ] Set up Drizzle with dual-DB support (SQLite & PostgreSQL)

## Phase 4: CI/CD & Tooling
- [ ] Configure Biome for unified formatting across monorepo
- [ ] Set up Turborepo remote caching (if applicable)

## Phase 5: Feature Implementation
- [ ] Implement core CMS entities (Content, Schema, User)
