# ADR-003: Astro with Islands Architecture for Frontend

**Date:** 2026-03-12  
**Status:** Accepted

## Context

The project needs two frontends: a public site (SEO-critical, mostly static) and an admin panel (interactive SPA-like). Options considered: Next.js, Remix, SvelteKit, Astro.

## Decision

Use **Astro** for both `apps/web` (public client) and `apps/admin` (admin panel).

- `apps/web` — Astro SSG (static site generation)
- `apps/admin` — Astro with Preact Islands (interactive components only where needed)

## Reasons

- **Zero JS by default** — public pages ship no JS unless explicitly hydrated; ideal for Lighthouse scores
- **Islands Architecture** — admin panel can have interactive Preact components (editor, forms) without a full SPA framework overhead
- **Preact** is chosen over React for islands: smaller bundle size, compatible with React ecosystem via `@preact/compat`
- SSG for the public client is a requirement (SYS-F-06) — Astro's `astro build` handles this natively
- One framework for both apps reduces tooling complexity

## Consequences

- Interactive components in admin are Preact components used as Astro islands (`client:load`, `client:idle`)
- State management uses **Preact Signals** (not React Context or Zustand)
- SSG public client must be rebuilt when content changes (see [rebuild-flow.md](../rebuild-flow.md))
- Shadcn/ui requires `@preact/compat` shim to work with Preact
