---
id: project
category: project
description: Project-specific context and conventions
---

# Project: qqCMS

## Description

A headless CMS designed for quick and flexible content management.

## Stack

- **Monorepo:** Turborepo with Bun workspaces.
- **Frontend:** Astro (apps/admin, apps/web) with React components.
- **UI Library:** React components in packages/ui.
- **Backend:** Elysia (apps/api).
- **Database:** Drizzle ORM with PGLite (default, no server required) and PostgreSQL (production).
- **Tooling:** Biome (linting/formatting), TypeScript.

## Architecture

- **Frontend:** Feature-Sliced Design (FSD).
- **Monorepo Structure:** `apps/*` for applications, `packages/*` for shared libraries.

## Custom conventions

- Design is managed via `qqCMS.pen` and documented in `_designContext/`.
- No auto-commit.
- Architecture should strictly follow FSD principles in both apps and shared UI components where applicable.
