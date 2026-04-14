---
id: backend-structure
category: backend
tags: [structure, modules, typescript, elysia]
description: Backend project structure — modular architecture
---

# Backend Structure

## Overview

The backend is organized into self-contained modules. Each feature is a folder with a controller, service, and public export.

```
src/
├── core/                   # Core infrastructure — do not modify unless necessary
│   ├── ModuleLoader.ts
│   ├── EventBus.ts
│   └── Logger.ts
│
├── db/
│   ├── schema/             # All Drizzle table definitions
│   │   ├── user.ts
│   │   ├── post.ts
│   │   └── index.ts        # Re-exports everything for drizzle-kit
│   │
│   └── repository/         # All database queries
│       ├── user.ts         # Flat file if repository is small
│       ├── post.ts
│       └── notifications/  # Folder if there are multiple related files
│           ├── index.ts
│           ├── email.ts
│           └── push.ts
│
├── modules/                # One folder per feature
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── index.ts
│   │
│   ├── user/
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   └── index.ts
│   │
│   └── notifications/      # Feature group — folder with subfolders
│       ├── _shared/        # Shared types/utils within the group
│       │   ├── notification.types.ts
│       │   └── index.ts
│       ├── email/
│       │   ├── email.controller.ts
│       │   ├── email.service.ts
│       │   └── index.ts
│       └── push/
│           ├── push.controller.ts
│           ├── push.service.ts
│           └── index.ts
│
├── shared/                 # Domain-agnostic utilities
│   ├── types/
│   │   └── global.d.ts
│   ├── utils/
│   │   └── pagination.ts
│   └── constants.ts
│
└── index.ts                # Entry point — module registration only
```

---

## File roles

| File | Responsibility |
|---|---|
| `*.controller.ts` | Route/event registration only. No business logic |
| `*.service.ts` | Business logic. Imports from repository |
| `db/repository/*.ts` | Database queries via Drizzle only |
| `db/schema/*.ts` | Drizzle table definitions only |
| `index.ts` in module | Public barrel export for the module |

---

## Folder depth rule

- Single entity → flat file (`user.ts`)
- Group of related features → folder with subfolders (`notifications/`)
- Shared code within a group → `_shared/` folder (underscore prefix)

---

## Entry point

`src/index.ts` registers modules only. No logic:

```ts
import { ModuleLoader } from "@core/ModuleLoader"
import { AuthModule } from "@modules/auth"
import { UserModule } from "@modules/user"
import { NotificationsModule } from "@modules/notifications"

new ModuleLoader()
  .add(new AuthModule())
  .add(new UserModule())
  .add(new NotificationsModule())
  .loadAll()
```

---

## Path aliases

```json
{
  "compilerOptions": {
    "paths": {
      "@core/*":       ["./src/core/*"],
      "@modules/*":    ["./src/modules/*"],
      "@repository/*": ["./src/db/repository/*"],
      "@schema/*":     ["./src/db/schema/*"],
      "@shared/*":     ["./src/shared/*"],
      "@db/*":         ["./src/db/*"]
    }
  }
}
```

```ts
// ✅
import { getUser } from "@repository/user"
import { UserModule } from "@modules/user"

// ❌
import { getUser } from "../../db/repository/user"
```
