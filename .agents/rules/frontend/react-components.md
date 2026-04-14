---
id: frontend-react-components
category: frontend
tags: [react, components, typescript, atomic-design, fsd]
description: React component structure and architecture patterns
---

# React Components

## Component structure

One component per file. File name matches the component name in PascalCase:

```
UserCard.tsx
AuthForm.tsx
DashboardLayout.tsx
```

Always use named exports:

```tsx
// ✅
export const UserCard = ({ user }: UserCardProps) => {
  return <div>{user.name}</div>
}

// ❌
export default function UserCard() { ... }
```

---

## Props

Always define props as an interface:

```tsx
interface UserCardProps {
  user: UserProfile
  onSelect?: (id: number) => void
}

export const UserCard = ({ user, onSelect }: UserCardProps) => {
  ...
}
```

---

## UI libraries

If the project includes a UI library (HeroUI, shadcn/ui, etc.) — always use its components first before writing custom ones:

```tsx
// ✅ use library component
import { Button } from "@heroui/react"

// ❌ don't reimplement what the library already provides
const Button = ({ children, onClick }) => (
  <button onClick={onClick}>{children}</button>
)
```

Custom components are only built when the library does not cover the use case.

---

## Architecture

Choose one of the two patterns per project. Do not mix.

---

### Option A — Atomic Design

```
src/
├── components/
│   ├── ui/        # components from UI libraries (HeroUI, shadcn/ui)
│   ├── atoms/     # basic building blocks: Button, Input, Badge
│   ├── molecules/ # combinations of atoms: SearchField, UserAvatar
│   ├── organisms/ # complex sections: Header, UserTable, AuthForm
│   └── templates/ # page layouts without real data
├── views/         # pages — assemble organisms into screens
└── app/           # routing
```

Components from UI libraries (HeroUI, shadcn/ui) go into `components/ui/`, not into `atoms/`:

```tsx
// ✅ src/components/ui/button.tsx  — re-export or wrap library component
// ✅ src/components/atoms/Badge.tsx — your own atom
// ❌ src/components/atoms/Button.tsx — don't recreate library components
```

Import rule — components only import from the same level or below:

```
templates → organisms → molecules → atoms
```

API layer — all backend communication lives in `src/services/`:

```
src/
└── services/
    ├── api.ts       # base ky instance with baseURL, auth headers, error handling
    ├── user.ts      # getUser, updateUser, deleteUser
    └── auth.ts      # login, logout, refreshToken
```

**If backend is Elysia** — use [Eden Treaty](https://elysiajs.com/eden/treaty/overview) for full end-to-end type safety without codegen:

```ts
// services/api.ts
import { treaty } from "@elysiajs/eden"
import type { App } from "@server/index" // imported from monorepo workspace

export const api = treaty<App>(process.env.NEXT_PUBLIC_API_URL!)
```

```ts
// services/user.ts
import { api } from "./api"

export const getUser = async (id: number) => {
  const { data, error } = await api.users({ id }).get()
  if (error) throw error
  return data
}

export const updateUser = async (id: number, body: UpdateUserInput) => {
  const { data, error } = await api.users({ id }).patch(body)
  if (error) throw error
  return data
}
```

**If backend is not Elysia** — use [ky](https://github.com/sindresorhus/ky):

```ts
// services/api.ts
import ky from "ky"

export const api = ky.create({
  prefixUrl: process.env.NEXT_PUBLIC_API_URL,
  hooks: {
    beforeRequest: [
      (request) => {
        const token = localStorage.getItem("token")
        if (token) request.headers.set("Authorization", `Bearer ${token}`)
      },
    ],
  },
})

// services/user.ts
import { api } from "./api"
import type { UserProfile } from "@shared/types"

export const getUser = (id: number) =>
  api.get(`users/${id}`).json<UserProfile>()
```

TanStack Query hooks consume services directly:

```ts
import { useQuery } from "@tanstack/react-query"
import { getUser } from "@services/user"

export const useUser = (id: number) =>
  useQuery({ queryKey: ["user", id], queryFn: () => getUser(id) })
```

Path aliases:

```json
{
  "@ui/*":        "src/components/ui/*",
  "@atoms/*":     "src/components/atoms/*",
  "@molecules/*": "src/components/molecules/*",
  "@organisms/*": "src/components/organisms/*",
  "@templates/*": "src/components/templates/*",
  "@views/*":     "src/views/*",
  "@services/*":  "src/services/*"
}
```

---

### Option B — Feature-Sliced Design (FSD)

```
src/
├── app/       # routing (Next.js app router or ReactRouter routes.ts)
├── views/     # screens/pages — assemble widgets and features
├── widgets/   # self-contained UI blocks: Sidebar, Feed, CommentThread
├── features/  # user actions: add-to-cart, submit-review, toggle-theme
├── entities/  # business entities: user, product, order
└── shared/    # reusable primitives with no business logic
    ├── ui/    # UI components: Button, Modal, Input
    ├── lib/   # utilities and helpers
    ├── api/   # base API client
    └── types/ # global types
```

`views/` is used instead of `pages/` to avoid conflicts with Next.js routing conventions.

`app/` holds routing only:
- Next.js — app router directory
- React Router — `routes.ts` config file

**Import rule — each layer can only import from layers below it:**

```
app → views → widgets → features → entities → shared
```

```tsx
// ✅ features can import from entities
import { UserCard } from "@entities/user"

// ❌ entities cannot import from features
import { addToCart } from "@features/add-to-cart"
```

API layer — backend communication is split across layers by ownership:

```
shared/api/           # base ky instance, config, error handling
entities/user/api/    # getUser, updateUser — entity-level requests
features/auth/api/    # login, logout — feature-level requests
```

**If backend is Elysia** — use [Eden Treaty](https://elysiajs.com/eden/treaty/overview) in `shared/api/`:

```ts
// shared/api/client.ts
import { treaty } from "@elysiajs/eden"
import type { App } from "@server/index" // imported from monorepo workspace

export const api = treaty<App>(process.env.NEXT_PUBLIC_API_URL!)

// entities/user/api/index.ts
import { api } from "@shared/api/client"

export const getUser = async (id: number) => {
  const { data, error } = await api.users({ id }).get()
  if (error) throw error
  return data
}
```

**If backend is not Elysia** — use [ky](https://github.com/sindresorhus/ky):

```ts
// shared/api/client.ts
import ky from "ky"

export const api = ky.create({
  prefixUrl: process.env.NEXT_PUBLIC_API_URL,
  hooks: {
    beforeRequest: [
      (request) => {
        const token = localStorage.getItem("token")
        if (token) request.headers.set("Authorization", `Bearer ${token}`)
      },
    ],
  },
})

// entities/user/api/index.ts
import { api } from "@shared/api/client"
import type { UserProfile } from "../model/types"

export const getUser = (id: number) =>
  api.get(`users/${id}`).json<UserProfile>()
```

TanStack Query hooks live in `model/` of the same slice:

```ts
// entities/user/model/queries.ts
import { useQuery } from "@tanstack/react-query"
import { getUser } from "../api"

export const useUser = (id: number) =>
  useQuery({ queryKey: ["user", id], queryFn: () => getUser(id) })
```

Path aliases:

```json
{
  "@app/*":      "src/app/*",
  "@views/*":    "src/views/*",
  "@widgets/*":  "src/widgets/*",
  "@features/*": "src/features/*",
  "@entities/*": "src/entities/*",
  "@shared/*":   "src/shared/*"
}
```

Each slice has an `index.ts` that defines its public API. Never import from internal files of another slice:

```ts
// ✅
import { UserCard } from "@entities/user"

// ❌
import { UserCard } from "@entities/user/ui/UserCard"
```
