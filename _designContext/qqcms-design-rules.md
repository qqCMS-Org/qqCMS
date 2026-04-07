# qqCMS — Design Rules

This file is read by AI when generating prompts for Pencil.dev.
Use together with `qqcms-context.md` (tokens, components, design system).

---

## 1. File Organization in Pencil.dev

The file is divided into two root sections: `pages/` and `components/`.
Each section is a vertical auto layout (column) where groups flow top to bottom.
Each group inside is a horizontal auto layout (row) where frames/components flow left to right.

### `pages/` structure

```
pages/                          ← vertical auto layout
├── Pages/                      ← horizontal auto layout
│   ├── Pages — List
│   ├── Pages — Editor (Draft)
│   └── Pages — Editor (Published)
├── Collections/                ← horizontal auto layout
│   ├── Collections — Data (footer_links)
│   ├── Collections — Data (products)
│   └── Collections — Schema + Add Field Modal
├── Media Library/              ← horizontal auto layout
│   ├── Media Library — Grid
│   ├── Media Library — Grid + Detail
│   └── Media Library — Upload
├── Settings/                   ← horizontal auto layout
│   ├── Settings — General
│   ├── Settings — Localization
│   └── Settings — Danger Zone
├── Dashboard/                  ← horizontal auto layout
│   └── Dashboard — Overview
└── API Keys/                   ← horizontal auto layout
    └── API Keys — List
```

### `components/` structure

```
components/                     ← vertical auto layout
├── Shared/                     ← horizontal auto layout
│   └── Sidebar, Topbar, Button, Input, Badge, Toggle, Modal, DataTable, Lang Tabs, Schema Field Row
├── Pages/                      ← horizontal auto layout
│   └── Page Card
├── Media/                      ← horizontal auto layout
│   └── File Card, Upload Progress Row
└── Settings/                   ← horizontal auto layout
    └── Locale Row
```

> Components that appear only once (Drop Zone, Detail Panel, Danger Panel)
> are not extracted into `components/` — they are described inline inside their frame.

### Auto layout rules for the sections themselves

- `pages/` and `components/`: direction — vertical, gap — 80px
- Groups inside (`Pages/`, `Shared/`, etc.): direction — horizontal, gap — 40px, align — top

---

## 2. Components — when to create, when not to

Create a new component only if it appears in 2+ places.
If an element is unique to a single frame — describe it inline, do not extract into `components/`.

```
✅ Extract to components/:   File Card, Upload Progress Row, Locale Row, Stats Card, API Key Row
❌ Keep inline:              Drop Zone, Detail Panel, Danger Panel
```

A new component goes into the group matching its section (`Media/`, `Settings/`, etc.).
If it is used across multiple sections — it goes into `Shared/`.

Before describing any new element — first check whether a suitable component already exists
in `Shared/`. Sidebar, Topbar, all buttons, inputs, Badge, Toggle, Modal, DataTable,
Lang Tabs, Schema Field Row — always taken from `Shared/` without modification.

---

## 3. Auto Layout — principles

- Use auto layout wherever elements are arranged in a row or column.
- Absolute positioning only for overlays (modals, hover states on top of cards, tooltips).
- All spacing and gaps must come from the project spacing scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.
- Fixed widths: Sidebar 220px, Topbar height 52px, Modal 480px, Detail Panel 280px.
  Everything else — fill or hug content.

---

## 4. Visual Hierarchy

- One btn-primary per frame. All other actions — btn-default or btn-ghost.
- Destructive actions — btn-danger only, always with a Modal confirmation dialog.
- Statuses — only via Badge components, never raw colored text.

---

## 5. What Not To Do

- Do not introduce new colors — only tokens from the design system.
- Do not introduce new font sizes — only from the typography scale.
- Do not add shadows — depth is achieved only through bg-tokens (surface → elevated → overlay).
- Do not use gradients — all backgrounds are solid.
- Do not redraw Sidebar and Topbar on each frame — reference the component from Shared/.
- Do not create a component for a single use.
