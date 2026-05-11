# Architecture

## Monorepo Structure

- **apps/admin**: Astro SSR + Preact Islands — Admin panel, MPA with file-based routing and View Transitions.
- **apps/web**: Astro SSG + Preact Islands — Public-facing website.
- **apps/api**: Elysia — Backend server.
- **packages/types**: Shared TypeScript types, constants, and error classes used across all apps.
- **packages/ui**: Shared Preact components used by both `apps/admin` and `apps/web`.
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

The backend uses Elysia for high-performance API routing and Drizzle ORM for database access. By default it uses **PGLite** (PostgreSQL compiled to WASM, runs in-process with a local file). In production, set `DATABASE_URL` to switch to a real PostgreSQL server — no code changes required.

```
apps/api/src/
├── modules/
│   ├── auth/
│   ├── pages/
│   ├── navigation/
│   ├── media/
│   ├── settings/
│   ├── languages/
│   └── rebuild/
├── db/
│   ├── index.ts
│   ├── schema/
│   ├── repository/
│   └── migrations/
├── shared/
│   ├── config.ts
│   ├── constants.ts
│   ├── errors.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── cors.middleware.ts
│   │   └── rateLimit.middleware.ts
│   └── utils/
├── core/
│   ├── Database.ts
│   ├── Logger.ts
│   └── EventBus.ts
├── client.ts
└── index.ts
```

See [api.md](./api.md), [database.md](./database.md), [auth.md](./auth.md) for details.

## Further Documentation

| Document | Description |
|---|---|
| [api.md](./api.md) | API endpoints reference |
| [auth.md](./auth.md) | Authentication flow |
| [database.md](./database.md) | DB schema and migrations |
| [env.md](./env.md) | Environment variables |
| [i18n.md](./i18n.md) | Internationalization strategy |
| [media.md](./media.md) | File upload and storage |
| [rebuild-flow.md](./rebuild-flow.md) | SSG rebuild webhook |
| [deployment.md](./deployment.md) | Docker and hosting |
| [design.md](./design.md) | UI design references |
| [web.md](./web.md) | Public web client architecture |
| [adr/](./adr/) | Architecture decision records |
