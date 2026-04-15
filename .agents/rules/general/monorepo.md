---
id: general-monorepo
category: general
tags: [turborepo, monorepo, bun, workspaces]
description: Monorepo structure with Turborepo and Bun workspaces
---

# Monorepo

Use Turborepo with Bun workspaces for projects that have both frontend and backend.

## Initialization

```sh
bunx create-turbo@latest
```

Never create monorepo structure manually. After scaffolding, add apps with their own scaffold commands (see `general/scaffolding.md`).

---

## Structure

```
apps/
├── web/              # Next.js or Astro + React frontend
└── server/           # Elysia backend

packages/
├── types/            # shared TypeScript types across apps
└── config/           # shared tsconfig.base.json, biome.json
```

`packages/ui/` is only created when there are multiple frontends that need to share components. Do not create it upfront.

---

## packages/types

Shared types only — no logic, no dependencies on external packages:

```ts
// packages/types/src/user.ts
export interface UserProfile {
  id: number
  email: string
  name: string
}

// packages/types/src/index.ts
export * from "./user"
export * from "./post"
```

`package.json`:

```json
{
  "name": "@repo/types",
  "version": "0.0.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
```

---

## packages/config

Shared tooling config:

```
packages/config/
├── tsconfig.base.json
└── biome.json
```

`tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "moduleResolution": "bundler",
    "target": "ESNext",
    "module": "ESNext",
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

Each app extends it:

```json
// apps/web/tsconfig.json
{
  "extends": "@repo/config/tsconfig.base.json",
  "compilerOptions": {
    "paths": { "@shared/*": ["../../packages/types/src/*"] }
  }
}
```

---

## Eden Treaty in monorepo

Export `App` type from `apps/server` and import it directly in `apps/web` via workspace — no codegen needed:

```ts
// apps/server/src/index.ts
const app = new Elysia()
  .use(userModule)
  .use(authModule)
  .listen(3000)

export type App = typeof app
```

```ts
// apps/web/src/shared/api/client.ts
import { treaty } from "@elysiajs/eden"
import type { App } from "@repo/server" // workspace reference

export const api = treaty<App>(process.env.NEXT_PUBLIC_API_URL!)
```

`apps/server/package.json`:

```json
{
  "name": "@repo/server",
  "exports": {
    ".": "./src/index.ts"
  }
}
```

---

## Root package.json

```json
{
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "check": "turbo check"
  }
}
```

## turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "persistent": true,
      "cache": false
    },
    "check": {
      "outputs": []
    }
  }
}
```

---

## Installing dependencies

Always add dependencies to the specific app or package, not the root:

```sh
# ✅ add to specific app
bun add hono --cwd apps/server
bun add react --cwd apps/web

# ✅ add shared dev tooling to root
bun add -d turbo -w

# ❌ don't add app-specific deps to root
bun add hono
```
