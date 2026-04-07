Design the Media Library page for qqCMS — a dark-theme, developer-focused headless CMS admin panel. Use the design system and components defined previously.

---

## DESIGN SYSTEM REMINDER

Fonts: Geist Mono (all UI), Instrument Serif italic (display only)
Theme: dark only

Tokens:
  bg-base #0d0d0d · bg-surface #141414 · bg-elevated #1a1a1a · bg-overlay #212121
  border-subtle #2a2a2a · border-default #333333
  text-primary #e8e6de · text-secondary #888888 · text-tertiary #555555
  accent #7c6aff · accent-hover #a89cff · accent-subtle rgba(124,106,255,0.10)
  success #34d399 · warning #fbbf24 · danger #f87171
  danger-subtle rgba(248,113,113,0.08)

Reuse existing components: Sidebar (220px), Topbar (52px), btn-primary, btn-default,
btn-ghost, btn-danger, text-input, Badges/Tags, Modal (480px), Toggle.

---

## FRAMES — 3 total, each 1440×900

---

### FRAME 1 — Media Library: Grid view

Layout: Sidebar left + main content area.

Topbar:
- Left: page title "Media Library" in serif-heading (Instrument Serif 20px italic)
- Right: "Upload files" btn-primary (with ↑ icon)

Toolbar row (below topbar, inside content area, 40px height):
- Left: text-input search, placeholder "Search files…", width ~240px
- Right: filter tabs — "All" · "Images" · "Video" · "Documents" — pill tabs, same style as Lang Tabs (active: accent fill, inactive: bg-elevated, Geist Mono mono-sm)
- Far right: view toggle — grid icon button (active) + list icon button, btn-ghost style

Content area:
- File grid, 5 columns, 16px gap
- 12 file cards visible (mix of types: ~7 images, 2 PDFs, 1 SVG, 2 unknown)

NEW COMPONENT — File Card (define for reuse in Frame 2):
  Size: ~220px wide, auto height
  bg-surface, border border-subtle, radius-md
  Hover state: border-default, translateY -1px
  Top section: preview area, 220×140px, bg-elevated, radius-md top corners
    - For images: show a colored placeholder rectangle (muted tones) with a tiny ⊞ icon centered in text-tertiary — simulating a thumbnail
    - For PDF: bg-elevated + "PDF" label in mono-sm text-secondary centered
    - For SVG: bg-elevated + "SVG" label
  Bottom section: padding 10px 12px, gap 4px
    - Filename: mono-sm text-primary, truncate with ellipsis (e.g. "hero-banner.jpg", "icons.svg", "report-q1.pdf")
    - Meta row: file size mono-xs text-tertiary (e.g. "1.2 MB") · dot separator · type badge (tag-type style: accent-subtle, mono-xs, e.g. "JPG" "PDF" "SVG")
  Hover action overlay (appears on card hover):
    Thin bar at bottom of preview area: bg-overlay 80% opacity, two icon buttons centered — ✎ edit (btn-ghost sm) and ✕ delete (btn-ghost sm, danger color on hover)

Pagination row at bottom: showing "48 files · Page 1 of 3" in mono-xs text-tertiary, with < > navigation btn-ghost sm.

---

### FRAME 2 — Media Library: Grid + Detail panel (file selected)

Same layout as Frame 1 but with a detail panel open on the right side.

Grid area: shrinks to ~4 columns to accommodate panel. One card is visually selected — border-accent (2px accent color border), no hover transform.

NEW COMPONENT — Detail Panel (right side, 280px wide):
  bg-surface, border-left border-subtle, full height (below topbar)
  
  Header: 
    - Filename "hero-banner.jpg" in mono-md text-primary
    - Close ✕ btn-ghost sm, top-right corner
  
  Preview section:
    - Large preview area: full width, 180px height, bg-elevated radius-md
    - Image placeholder (colored rect, same style as card thumbnails)
  
  File info section (mono-xs, gap 8px between rows):
    Label–value pairs, label in text-tertiary, value in text-secondary:
      Type:      JPG
      Size:      1.2 MB
      Dimensions: 1920 × 1080
      Uploaded:  Mar 14, 2025
      Used in:   2 pages (accent color, looks like a link)
  
  Alt text section:
    - Label "Alt text" mono-xs text-tertiary uppercase tracking-wide
    - textarea component (2 rows), placeholder "Describe this image for accessibility…"
    - "Save" btn-default sm aligned right
  
  Divider border-subtle
  
  Actions section:
    - "Copy URL" btn-default full-width (copy icon + label)
    - "Delete file" btn-danger full-width (trash icon + label)

---

### FRAME 3 — Media Library: Upload / drag-and-drop state

Same Sidebar + Topbar as other frames.

Main content area shows the grid dimmed (opacity 40%) in the background.

Overlaid in the center of the content area (not a modal — an inline dropzone that takes up the visible space):

NEW COMPONENT — Drop Zone:
  Centered in content, ~680px × 360px
  bg-elevated, border 2px dashed border-default (active state: dashed accent color)
  radius-lg
  
  Content (centered vertically and horizontally):
    - Upload icon ↑ in a 48×48 circle, bg: accent-subtle, icon color: accent
    - "Drop files here" in serif-heading (Instrument Serif 20px italic, text-primary)
    - "or" in mono-sm text-tertiary
    - "Browse files" btn-default md
    - Accepted types hint: "JPG, PNG, SVG, PDF, GIF — max 20 MB" mono-xs text-tertiary

Below the drop zone, show 2 file upload progress rows (files mid-upload):

NEW COMPONENT — Upload Progress Row:
  Width matches drop zone (680px), mt-12 from drop zone
  bg-surface, radius-md, border border-subtle, padding 12px 16px
  Left: file type badge (tag-type) + filename mono-sm text-primary + file size mono-xs text-tertiary
  Right: percentage mono-xs text-secondary (e.g. "67%") + cancel ✕ btn-ghost sm
  Below filename: full-width progress bar (height 3px, bg-elevated track, accent fill, radius full)
  
  Row 1: "product-photo.jpg" · 2.4 MB · 67% progress
  Row 2: "brand-assets.svg" · 340 KB · 12% progress

---

## NOTES

- All 3 frames share the same Sidebar and Topbar — reuse the component without changes
- File Card is a new component — define it once (Frame 1), reference it in Frame 2
- Detail Panel, Drop Zone, Upload Progress Row are new components defined in this prompt
- No vague decorative elements — every element must serve a function
- Pixel precision: respect all spacing from the 4px grid (4, 8, 12, 16, 20, 24, 32)
- Font sizes strictly from the typography scale (mono-xs 10px · mono-sm 11px · mono-base 12px · mono-md 13px · mono-lg 14px)
