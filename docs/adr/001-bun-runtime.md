# ADR-001: Bun as Runtime and Package Manager

**Date:** 2026-03-12  
**Status:** Accepted

## Context

The project needs a runtime and package manager for a Node.js-compatible TypeScript monorepo. Options considered: Node.js + npm/pnpm, Deno, Bun.

## Decision

Use **Bun** as the runtime and package manager across all apps and packages.

## Reasons

- Built-in TypeScript support — no `ts-node` or build step needed for scripts
- Significantly faster `bun install` compared to npm/pnpm
- Built-in test runner (`bun:test`) — no Jest or Vitest needed
- Native `Bun.password` API for bcrypt — no extra dependency for auth
- Full Node.js compatibility — all npm packages work
- Elysia is designed and optimized specifically for Bun

## Consequences

- All team members must have Bun 1.3.10+ installed
- CI pipelines must use `oven/bun` Docker image
- Deployment targets must support Bun (Render.com does)
