# State Management

> **Status: NOT IMPLEMENTED** — Admin panel interactive islands are not yet built.

## Frontend Strategy

- **Server-side State**: Handled by Astro at build time (SSG for `apps/web`) or at request time (SSR for `apps/admin`).
- **Navigation**: Both `apps/admin` and `apps/web` use Astro's file-based routing — standard `<a>` links with `<ViewTransitions />` for smooth page transitions. No client-side router.
- **Client-side State**: Managed via **Preact Signals** in `apps/admin` interactive islands. Signals stores are **page-scoped** — they re-initialize on each navigation. Do not rely on in-memory signals for cross-page state.
- **Cross-page State** (e.g. auth session): Carried via **HTTP-only cookies** set by the API, read by Astro SSR middleware.
- **Form State**: Managed directly in Preact island components using Signals.

## Preact Signals Stores (planned)

```
apps/admin/src/stores/
├── pages.store.ts     # pages list, selected page
├── editor.store.ts    # TipTap editor content per language
└── languages.store.ts # active languages list
```

```ts
// Example store pattern (not implemented)
import { signal, computed } from "@preact/signals"
import type { Language } from "@repo/types"

export const languages = signal<Language[]>([])
export const activeLanguages = computed(() =>
  languages.value.filter((language) => language.is_active)
)
```

## API Integration

- Type-safe communication via **Elysia Treaty** (`@elysiajs/eden`).
- The `App` type is exported from `apps/api` and consumed in `apps/admin` — no codegen, full IDE inference.
- See [api.md](./api.md) for details.

## No Global State in `apps/web`

The public client (`apps/web`) is SSG — no client-side state management is needed. Language preference for the switcher is read from the URL.
