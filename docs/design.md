# Design

> **Status: IN PROGRESS** — Design is implemented as HTML/JSX files in the `qqCMS-design/` sister directory.

## Source of Truth

The visual design lives in [`../qqCMS-design/`](../../qqCMS-design/) — plain HTML + React (no build step).

Key files:
- [`index.html`](../../qqCMS-design/index.html) — CSS variables / design tokens (dark + light theme)
- [`shared.jsx`](../../qqCMS-design/shared.jsx) — design tokens object `T`, primitive components (Badge, Toggle, Button, Input, Sidebar, Topbar, etc.)
- [`pages.jsx`](../../qqCMS-design/pages.jsx) — Pages and Collections screens
- [`App.jsx`](../../qqCMS-design/App.jsx) — Dashboard, Media Library, Settings, API Keys screens

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
- Design tokens (CSS variables) defined in `../qqCMS-design/index.html` are mapped to a custom CSS theme in each app's global stylesheet

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
