# Design

> **Status: IN PROGRESS** — Design is maintained in `qqCMS.pen` (Pencil tool). Design context is documented in `_designContext/`.

## Source of Truth

The visual design is defined in [`qqCMS.pen`](../qqCMS.pen).

Design references and rules:
- [`_designContext/qqcms-design-rules.md`](../_designContext/qqcms-design-rules.md) — design system rules, colors, spacing, typography
- [`_designContext/qqcms-design-progress.md`](../_designContext/qqcms-design-progress.md) — current design progress per screen

## Component Methodology

The admin panel UI is built using **Atomic Design**:

```
apps/admin/src/components/
├── atoms/        # Button, Input, Label, Badge, Spinner
├── molecules/    # FormField, LanguageTabs, NavMenuItem
├── organisms/    # PageEditor, NavigationEditor, MediaUploader, LoginForm
└── templates/    # AdminLayout
```

> **Not implemented** — `apps/admin/src/` currently contains only a placeholder `Welcome.astro`. FSD/Atomic Design structure is planned in Phase 2 of TODO.md.

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
