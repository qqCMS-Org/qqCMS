# Design

> **Status: IN PROGRESS** — Design is implemented as HTML/JSX files in `prototype/` inside this repo.

## Source of Truth

The visual design lives in [`prototype/`](../prototype/) — plain HTML + React (no build step, Babel transpiles JSX in the browser).

Key files to read when implementing UI:
- [`prototype/index.html`](../prototype/index.html) — CSS variables / design tokens (dark + light theme), fonts, scrollbar styles
- [`prototype/shared.jsx`](../prototype/shared.jsx) — tokens object `T`, primitive components (Badge, Toggle, Sidebar, Topbar, icons, etc.)
- [`prototype/pages.jsx`](../prototype/pages.jsx) — Pages and Collections screens
- [`prototype/App.jsx`](../prototype/App.jsx) — Dashboard, Media Library, Settings, API Keys screens

> Screenshots and crops in `prototype/screenshots/` and `prototype/crops/` are for human reference only — read the JSX/HTML files instead.

## Component Structure

Both `apps/admin` and `apps/web` follow **Feature-Sliced Design (FSD)**:

```
src/
├── layouts/      # Astro layout components + index.ts barrel
│   ├── Layout.astro
│   ├── AdminLayout.astro
│   └── index.ts  # barrel: export { Layout, AdminLayout }
├── pages/        # Astro .astro page files (file-based routing)
├── app/          # Global styles, middleware, app-level config
├── widgets/      # Self-contained UI blocks: Sidebar, Header, PageEditorWidget
├── features/     # User actions: auth, create-page, upload-media, change-language
├── entities/     # Domain objects: page, language, media, navigation-item
└── shared/
    ├── ui/       # Re-exports from @repo/ui
    ├── api/      # Eden Treaty client
    └── config/   # Constants, env
```

`packages/ui` contains **primitive Preact components** (Button, Input, Badge, etc.) shared across both apps. Complex, domain-aware components live in the respective app's FSD layers.

## Path Aliases (`apps/admin`)

All cross-layer imports **must** use path aliases — never use `../..` relative paths between layers.

| Alias | Resolves to |
|---|---|
| `@layouts` | `src/layouts/index.ts` (barrel) |
| `@app/*` | `src/app/*` |
| `@widgets/*` | `src/widgets/*` |
| `@features/*` | `src/features/*` |
| `@entities/*` | `src/entities/*` |
| `@shared/*` | `src/shared/*` |

Each layer that has more than one export should expose a barrel `index.ts`. Example:

```ts
// src/layouts/index.ts
export { default as Layout } from './Layout.astro';
export { default as AdminLayout } from './AdminLayout.astro';

// Usage in a page:
import { Layout } from '@layouts';
import { AdminLayout } from '@layouts';
```

## UI Library

Both `apps/admin` and `apps/web` share UI components from **`packages/ui`** (`@repo/ui`). Components in `packages/ui` are **Preact** components (Astro uses Preact for all interactive islands in both apps).

- Primitive components (Button, Input, Badge, etc.) live in `packages/ui/src/`
- Both apps import them via the `@repo/ui` alias: `import { Button } from "@repo/ui/button"`
- Admin-specific complex components (PageEditor, NavigationEditor) live in `apps/admin/src/` and are not shared
- Components in `packages/ui` use **DaisyUI** CSS classes for styling — no JS dependency, works natively with Preact
- **Typing convention:** Primitive components should define props using explicit Preact HTML attributes interfaces (e.g., `ButtonHTMLAttributes<HTMLButtonElement>`, `InputHTMLAttributes<HTMLInputElement>`) instead of intersection types with `JSX.IntrinsicElements`.

Example:
```tsx
import type { ButtonHTMLAttributes, ComponentChildren } from "preact";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	children: ComponentChildren;
	variant?: "primary" | "default" | "danger";
}
```

## Styling

- **Tailwind CSS** + **DaisyUI** for all styling
- Design tokens (CSS variables) defined in `prototype/index.html` are used as-is in each app's global stylesheet

## Screens to Design / Implement

| Screen | Design Status | Implementation |
|---|---|---|
| Login | ✅ | ✅ Implemented |
| Pages list | — | Not implemented |
| Page editor | — | Not implemented |
| Navigation editor | — | Not implemented |
| Media library | — | Not implemented |
| Language settings | — | Not implemented |
| Public site (homepage) | — | Not implemented |
| Public site (inner page) | — | Not implemented |
