# ADR-002: Elysia as Backend Framework

**Date:** 2026-03-12  
**Status:** Accepted

## Context

The backend needs an HTTP framework for the API server. Options considered: Hono, Fastify, Express, Elysia.

## Decision

Use **Elysia** with Bun runtime.

## Reasons

- End-to-end type safety via **Treaty** — the frontend gets a typed API client directly from the Elysia app type, no codegen required
- Elysia plugins for JWT, CORS, rate limiting are first-party and well-maintained
- Best performance benchmarks on Bun among TypeScript frameworks
- Built-in request validation with Zod/TypeBox

## Consequences

- Frontend apps must use `@elysiajs/eden` (Treaty) as the API client
- The `App` type is exported from `apps/api` and imported in `apps/admin` — both apps must be in the same monorepo
- IDE-level type inference for all API calls without any runtime overhead

## Known Issue: Bun Dual-Instance Elysia

Bun uses a content-addressed cache for packages. When `@elysiajs/eden` resolves elysia in a context without `@types/bun` (e.g. inside `apps/admin`), it gets a different cache hash than the elysia instance in `apps/api` (which has `bun-types`). TypeScript sees these as two incompatible types.

**Fix:** `apps/admin/tsconfig.json` maps `elysia` → `../../apps/api/node_modules/elysia` — a stable per-package symlink always pointing to the bun-types-aware instance. The `treaty<App>` call lives exclusively in `apps/api/src/client.ts`; admin imports the `createApiClient` factory, never calls `treaty` directly.
