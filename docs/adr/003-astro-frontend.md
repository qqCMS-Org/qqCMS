# ADR-003: Astro with Islands Architecture for Frontend

**Date:** 2026-03-12  
**Status:** Accepted

## Context

The project needs two frontends: a public site (SEO-critical, mostly static) and an admin panel (interactive, authenticated). Options considered: Next.js, Remix, SvelteKit, Astro.

## Decision

Use **Astro** for both `apps/web` (public client) and `apps/admin` (admin panel).

- `apps/web` — Astro SSG (static site generation)
- `apps/admin` — Astro SSR, MPA with Preact Islands

## Reasons

- **MPA navigation** — page transitions are standard Astro file-based routing, not client-side JS router; Astro's View Transitions API provides smooth navigation without SPA overhead
- **Zero JS by default** — each admin page ships only the JS needed for its interactive islands
- **Islands Architecture** — interactive components (editor, forms, tables) are Preact islands; the layout shell and navigation are plain Astro
- **Preact** is chosen over React for islands: smaller bundle size, compatible with React ecosystem via `@preact/compat`
- SSG for the public client is a requirement (SYS-F-06) — Astro's `astro build` handles this natively
- One framework for both apps reduces tooling complexity

## Consequences

- Navigation in `apps/admin` is Astro `<a>` links with `<ViewTransitions />` — no client-side router needed
- Interactive components in admin are Preact components used as Astro islands (`client:load`, `client:idle`)
- State management uses **Preact Signals** (not React Context or Zustand); Signals stores are page-scoped and re-initialize on navigation
- Cross-page state (auth session) is carried via **HTTP-only cookies**, not in-memory stores
- SSG public client must be rebuilt when content changes (see [rebuild-flow.md](../rebuild-flow.md))
- **DaisyUI** is used as the UI library — pure CSS Tailwind plugin, no JS, no React/Preact dependency, no shims needed
