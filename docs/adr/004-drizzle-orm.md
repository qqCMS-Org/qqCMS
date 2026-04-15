# ADR-004: Drizzle ORM with Dual-Database Support

**Date:** 2026-03-12  
**Status:** Accepted

## Context

The project needs database access with support for both SQLite (lightweight, zero-config) and PostgreSQL (production). Options considered: Prisma, TypeORM, Drizzle ORM, raw SQL.

## Decision

Use **Drizzle ORM** with Drizzle Kit for migrations.

## Reasons

- Drizzle supports both `better-sqlite3` / `bun:sqlite` and `postgres` drivers with the same schema definition
- Switching databases requires only changing `DATABASE_URL` — no schema rewrites
- Type-safe query builder with full TypeScript inference — no `any` in queries
- Drizzle Kit generates SQL migrations from schema changes; no manual SQL
- Lighter than Prisma — no Prisma Client binary, no separate runtime
- SQL-like syntax is explicit and predictable

## Decision: UUID v4 Primary Keys

All tables use UUID v4 as primary keys instead of auto-increment integers.

Reasons:
- Safe to generate on the client or server without DB roundtrip
- No sequential ID enumeration risk
- Consistent across SQLite and PostgreSQL

## Consequences

- Schema is defined once in `apps/api/src/db/schema/` and works for both DBs
- The `db` instance in `apps/api/src/db/index.ts` is initialized based on `DATABASE_URL`
- Migrations are tracked in `apps/api/src/db/migrations/` and committed to git
- Do not run raw SQL migrations — always use `bunx drizzle-kit migrate`
