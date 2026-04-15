# Architecture

## Monorepo Structure

- **apps/admin**: Astro + React - Admin management interface.
- **apps/web**: Astro + React - Public-facing website.
- **apps/api**: Elysia - Backend server.
- **packages/ui**: Shared React components.
- **packages/biome-config**: Unified linting and formatting.
- **packages/typescript-config**: Shared TS compiler options.

## Frontend: Feature-Sliced Design (FSD)

The frontend applications (apps/admin, apps/web) and the shared UI package follow FSD:

- **app**: App initialization logic (providers, styles).
- **pages**: Main routes and composition of widgets.
- **widgets**: Independent, self-contained business blocks.
- **features**: User-facing actions that bring business value.
- **entities**: Domain objects (Content, Schema, User).
- **shared**: Generic UI components, helpers, and configurations.

## Backend: Elysia + Drizzle

The backend uses Elysia for high-performance API routing and Drizzle ORM for database access, supporting both SQLite (development/lightweight) and PostgreSQL (production/heavyweight).
