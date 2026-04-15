# State Management

> **Status: NOT IMPLEMENTED** — Admin panel interactive islands are not yet built.

## Frontend Strategy

- **Server-side State**: Handled by Astro at build time (SSG for `apps/web`) or at request time (SSR for `apps/admin`).
- **Client-side State**: Managed via **Preact Signals** in `apps/admin` interactive islands. Signals are defined as module-level stores in `apps/admin/src/stores/`.
- **Form State**: Managed directly in Preact island components using Signals.

## Preact Signals Stores (planned)

```
apps/admin/src/stores/
├── auth.store.ts      # isAuthenticated signal
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
