# qqCMS — Design Progress

## ✅ Components & Tokens

- [x] Color tokens (bg, border, text, accent, semantic)
- [x] Typography scale (mono-xs → mono-lg, serif-display, serif-heading)
- [x] Spacing scale (4px base, 4–64)
- [x] Border radius tokens (sm/md/lg/xl)
- [x] Buttons: btn-primary, btn-default, btn-ghost, btn-danger (all sizes and states)
- [x] Inputs: text-input, textarea, select (all states)
- [x] Badges / Tags: status-published, status-draft, status-archived, tag-type, boolean badge, category tag
- [x] Sidebar (220px, nav items, active state, footer)
- [x] Topbar (52px, title + actions)
- [x] Page Card (slug, title, status badge, relative time, hover state)
- [x] Data Table (thead, tbody, hover, boolean cells, category cells, action buttons)
- [x] Modal (480px, header + body + footer)
- [x] Toggle (32×18px pill)
- [x] Schema Field Row (drag handle, type badge, required badge, edit/delete)
- [x] Lang Tabs (EN / ET / RU, active: accent fill)

---

## ✅ Pages — Done

### Pages

- [x] **Pages List**
  - [x] Summary stats row (total · published · draft)
  - [x] Search input + Filter button + view toggle
  - [x] Card grid (3 cols, 12px gap)
  - [x] Page Cards with hover state and action row
  - [x] Empty state
  - [x] "New page" modal

- [x] **Page Editor — Frame A: Has unpublished changes**
  - [x] Topbar: breadcrumb + "● Live" badge + "Unpublish" btn-ghost
  - [x] TipTap editor with toolbar (serif h1, mono body, blockquote, inline code)
  - [x] Right panel "Version status": version timestamps + amber warning + Save draft / Publish
  - [x] Right panel "Page meta": Slug, SEO title, Description
  - [x] Right panel "Language": Lang Tabs EN/ET/RU

- [x] **Page Editor — Frame B: Never published**
  - [x] Topbar: "○ Offline" badge
  - [x] Version status panel: "Not published yet" + Save draft / Publish

### Collections

- [x] **Collections — Data view (footer_links)**
  - [x] Left panel: collection list + "New collection" btn
  - [x] Table: label · href · target · visible
  - [x] Row hover: edit ✎ + delete ✕
  - [x] Boolean badge: ✓ true (green) / – false (amber)
  - [x] "+ Add entry" row at the bottom

- [x] **Collections — Schema view + Add field modal**
  - [x] Schema field rows with drag handle, type badge, required badge
  - [x] Modal: field name + 3×2 type grid + Required/Unique/Localised checkboxes

- [x] **Collections — Data view (products)**
  - [x] Table: name · price · category · in_stock
  - [x] Category: purple accent tag
  - [x] in_stock: boolean badge

### Media Library

- [x] **Frame 1 — Grid view**
  - [x] Toolbar: search + type filter (All/Images/Video/Documents) + view toggle
  - [x] File grid (5 cols, 16px gap)
  - [x] File Card component (preview, filename, meta, hover actions)
  - [x] Pagination row

- [x] **Frame 2 — Grid + Detail panel**
  - [x] Grid shrinks to 4 columns, selected card highlighted
  - [x] Detail Panel (280px): preview, file info, alt text textarea, Copy URL / Delete

- [x] **Frame 3 — Upload / drag-and-drop state**
  - [x] Drop Zone (dashed border, upload icon, browse button, accepted types hint)
  - [x] Upload Progress Row ×2 (progress bar, %, cancel)

---

## 🔲 Pages — To Do

### Settings

- [x] **Settings — General**
  - [x] Left settings nav (General, Localization, Danger zone)
  - [x] Panel "Project": Project name field, Admin URL field
  - [x] Panel "Appearance": toggles
  - [x] Panel "API": API URL field, Swagger UI toggle

- [x] **Settings — Localization**
  - [x] Locale list with Default badge and remove button
  - [x] "+ Add locale" button
  - [x] Localization behavior toggles

- [x] **Settings — Danger Zone**
  - [x] Danger-colored panel
  - [x] Actions: Reset / Revoke / Delete with confirmation

### Dashboard

- [x] **Dashboard**
  - [x] Stats cards: Pages count, Collections count, Media count
  - [x] Recent activity feed
  - [x] Quick links to frequently edited content

### API Keys

- [ ] **API Keys** *(not yet designed)*
  - [ ] Key list: name, permissions, created date
  - [ ] Create new key modal
  - [ ] Revoke key action

---

## 🔲 New Components — Needed for Remaining Pages

- [x] Settings Nav (left settings panel, separate from the main Sidebar)
- [x] Settings Section (section heading + content block)
- [x] Locale Row (flag/code · Default badge · remove button)
- [x] Danger Action Row (action description + danger button)
- [x] Stats Card (icon + number + label)
- [x] Activity Feed Item (icon + description + timestamp)
- [ ] API Key Row (name · permissions · date · revoke button)
