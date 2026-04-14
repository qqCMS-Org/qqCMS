---
id: frontend-nextjs
category: frontend
tags: [nextjs, react, rsc, ssg, isr]
description: Next.js specific rules — Server Components, rendering strategies (SSG, ISR)
---

# Next.js

## React Server Components (RSC)

All Next.js (App Router) components are Server Components by default. 

- Keep components as Server Components whenever possible.
- Use the `"use client"` directive only when necessary (e.g., when you need `useState`, `useEffect`, event listeners, or browser APIs).
- Push `"use client"` as far down the component tree as possible. Only add it to the specific "leaf" component that needs interactivity (like a button, input, or complex form), leaving the parent layouts and pages as Server Components.

### Data Fetching and Interactivity

- Fetch initial data on the server in Server Components.
- For mutations, prefer using TanStack Query along with standard REST endpoints. Server Actions should generally be avoided for complex client state logic.
- Pass fetched data to Client Components as props or use TanStack Query `initialData` for hydration.

---

## Rendering Strategies

Choose the right rendering strategy for pages:

### Static Site Generation (SSG)

Use Static Generation for pages where data does not change frequently.
- If you have dynamic routes (e.g., pages with translations or blog posts), use `generateStaticParams` to build these pages at compile time.

### Incremental Static Regeneration (ISR)

If data is updated periodically from the server and doesn't need to be strictly real-time, use ISR (`revalidate`).
- Allows you to update static pages in the background without a full rebuild.

### Decision making

When building a new page or feature, always evaluate which rendering strategy (Static, ISR, or Dynamic) is best. If there isn't a single obvious choice, suggest multiple options to the team and ask for their preference.
