# Design

> **Status: IN PROGRESS** — Design is maintained in `qqCMS.pen` (Pencil tool). Design context is documented in `_designContext/`.

## Source of Truth

The visual design is defined in [`qqCMS.pen`](../qqCMS.pen).

Design references and rules:
- [`_designContext/qqcms-design-rules.md`](../_designContext/qqcms-design-rules.md) — design system rules, colors, spacing, typography
- [`_designContext/qqcms-design-progress.md`](../_designContext/qqcms-design-progress.md) — current design progress per screen

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
- Design tokens (colors, spacing) defined in `_designContext/qqcms-design-rules.md` are mapped to a custom DaisyUI theme in `tailwind.config` of each app

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
