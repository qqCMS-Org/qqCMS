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
├── app/          # Astro layouts, global styles, middleware
├── pages/        # Astro .astro page files (file-based routing)
├── widgets/      # Self-contained UI blocks: Sidebar, Header, PageEditorWidget
├── features/     # User actions: auth, create-page, upload-media, change-language
├── entities/     # Domain objects: page, language, media, navigation-item
└── shared/
    ├── ui/       # Re-exports from @repo/ui
    ├── api/      # Eden Treaty client
    └── config/   # Constants, env
```

`packages/ui` contains **primitive Preact components** (Button, Input, Badge, etc.) shared across both apps. Complex, domain-aware components live in the respective app's FSD layers.

> **Not implemented** — `apps/admin/src/` currently contains only a placeholder `Welcome.astro`. FSD structure is planned in the admin panel implementation phase.

## UI Library

Both `apps/admin` and `apps/web` share UI components from **`packages/ui`** (`@repo/ui`). Components in `packages/ui` are **Preact** components (Astro uses Preact for all interactive islands in both apps).

- Primitive components (Button, Input, Badge, etc.) live in `packages/ui/src/`
- Both apps import them via the `@repo/ui` alias: `import { Button } from "@repo/ui/button"`
- Admin-specific complex components (PageEditor, NavigationEditor) live in `apps/admin/src/` and are not shared
- Components in `packages/ui` use **DaisyUI** CSS classes for styling — no JS dependency, works natively with Preact

## Styling

- **Tailwind CSS** + **DaisyUI** for all styling
- Design tokens (CSS variables) defined in `prototype/index.html` are used as-is in each app's global stylesheet

## Screens to Design / Implement

| Screen | Design Status | Implementation |
|---|---|---|
| Login | — | Not implemented |
| Pages list | — | Not implemented |
| Page editor | — | Not implemented |
| Navigation editor | — | Not implemented |
| Media library | — | Not implemented |
| Language settings | — | Not implemented |
| Public site (homepage) | — | Not implemented |
| Public site (inner page) | — | Not implemented |
