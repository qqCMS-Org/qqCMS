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
