---
id: general-scaffolding
category: general
tags: [scaffolding, init, turborepo, next, vite, astro, elysia]
description: Project initialization — always use official scaffold commands, never create structure manually
---

# Scaffolding

Always use official scaffold commands to initialize projects. Never create folder structure, `package.json`, or config files manually.

---

## Monorepo

```sh
bunx create-turbo@latest
```

---

## Frontend

Next.js:

```sh
bunx create-next-app@latest
```

Vite + React:

```sh
bun create vite
# select React + TypeScript
```

Astro:

```sh
bunx create-astro@latest
```

---

## Backend

Elysia:

```sh
bunx @elysiajs/create@latest
```

---

## UI libraries

HeroUI (into existing project):

```sh
bun add @heroui/react framer-motion
```

DaisyUI (into existing Tailwind project):

```sh
bun add daisyui
```

Then add to `tailwind.config`:

```ts
plugins: [require("daisyui")]
```

---

## Drizzle

```sh
bun add drizzle-orm
bun add -d drizzle-kit
```

---

## Rules

- Always run scaffold commands first, then install additional dependencies with `bun add`
- Never manually write `package.json`, `tsconfig.json`, or framework config files from scratch — scaffold commands generate them correctly
- After scaffolding, extend `tsconfig.json` rather than replacing it
