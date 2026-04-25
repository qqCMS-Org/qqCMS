# ADR-004: Drizzle ORM with PGLite / PostgreSQL

**Date:** 2026-03-12  
**Status:** Accepted

## Context

The project needs database access that works out-of-the-box in development with no external server, and scales to a real PostgreSQL instance in production. Options considered: Prisma, TypeORM, Drizzle ORM, raw SQL.

## Decision

Use **Drizzle ORM** with Drizzle Kit for migrations.

Default driver: **PGLite** (`@electric-sql/pglite`) — PostgreSQL compiled to WASM, runs in-process, stores data in a local file. No server setup needed.

Production driver: **postgres** (`postgres` package) — activated by setting `DATABASE_URL`.

## Reasons

- Drizzle supports both `pglite` and `postgres` drivers with the **same `pgTable` schema** — no duplication
- Switching to production PostgreSQL requires only setting `DATABASE_URL` — zero code changes
- PGLite gives the convenience of SQLite (no server) while using the PostgreSQL dialect end-to-end
- Type-safe query builder with full TypeScript inference — no `any` in queries
- Drizzle Kit generates SQL migrations from schema changes; no manual SQL
- Lighter than Prisma — no Prisma Client binary, no separate runtime
- SQL-like syntax is explicit and predictable

## Decision: UUID v4 Primary Keys

All tables use UUID v4 as primary keys instead of auto-increment integers.

Reasons:
- Safe to generate on the client or server without DB roundtrip
- No sequential ID enumeration risk
- Consistent across PGLite and PostgreSQL

## Consequences

- Schema is defined once in `apps/api/src/db/schema/` using `pgTable` and works for both PGLite and PostgreSQL
- The `db` instance in `apps/api/src/db/index.ts` is initialized based on `DATABASE_URL` presence
- Migrations are tracked in `apps/api/src/db/migrations/` and committed to git
- Do not run raw SQL migrations — always use `bunx drizzle-kit migrate`
