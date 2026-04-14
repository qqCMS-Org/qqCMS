---
id: frontend-react-state
category: frontend
tags: [react, state, zustand, tanstack-query, forms]
description: State management patterns — local state, server state, global state
---

# State Management

## Local state

Use `useState` and `useReducer` for component-level state. Do not reach for global state if the data is only needed in one component or a small subtree:

```tsx
const [isOpen, setIsOpen] = useState(false)
const [count, setCount] = useState(0)
```

Use `useReducer` when state has multiple sub-values or complex transitions:

```tsx
type State = { status: "idle" | "loading" | "error"; data: User | null }
type Action = { type: "fetch" } | { type: "success"; data: User } | { type: "error" }

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "fetch": return { ...state, status: "loading" }
    case "success": return { status: "idle", data: action.data }
    case "error": return { ...state, status: "error" }
  }
}
```

---

## Server state

Use [TanStack Query](https://tanstack.com/query) for all data fetching, caching, and synchronization with the server.

If the backend is Elysia, use [Eden Treaty](https://elysiajs.com/eden/treaty/overview) as the API client — it provides end-to-end type safety without codegen. Otherwise use [ky](https://github.com/sindresorhus/ky). Either way, wrap calls in TanStack Query:

```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getUser, updateUser } from "@services/user" // or @entities/user/api in FSD

// Fetching
const { data: user, isLoading } = useQuery({
  queryKey: ["user", userId],
  queryFn: () => getUser(userId), // getUser lives in services/ or entity api/
})

// Mutations
const queryClient = useQueryClient()

const { mutate: updateUser } = useMutation({
  mutationFn: (data: UpdateUserInput) => apiUpdateUser(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["user", userId] })
  },
})
```

Do not use `useEffect` + `useState` for data fetching — always use TanStack Query.

---

## Global client state

Use [Zustand](https://zustand.dev/) for global UI state that is not server data (modals, sidebar, user preferences, etc.):

```tsx
import { create } from "zustand"

interface UIStore {
  sidebarOpen: boolean
  toggleSidebar: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}))
```

Keep stores small and focused. One store per domain, not one global store for everything.

Do not put server data into Zustand — that is TanStack Query's job.

---

## Forms

Use [TanStack Form](https://tanstack.com/form) for form state management. Validate with [Valibot](https://valibot.dev/):

```tsx
import { useForm } from "@tanstack/react-form"
import * as v from "valibot"

const LoginSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  password: v.pipe(v.string(), v.minLength(8)),
})

export const LoginForm = () => {
  const form = useForm({
    defaultValues: { email: "", password: "" },
    validators: {
      onChange: ({ value }) => {
        const result = v.safeParse(LoginSchema, value)
        if (!result.success) return result.issues[0].message
      },
    },
    onSubmit: async ({ value }) => {
      await login(value)
    },
  })

  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}>
      <form.Field name="email">
        {(field) => (
          <input
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
          />
        )}
      </form.Field>
    </form>
  )
}
```

---

## Decision guide

| Data type | Tool |
|---|---|
| Component-local UI state | `useState` / `useReducer` |
| Server data (fetch, cache, sync) | TanStack Query |
| Global UI state (modals, prefs) | Zustand |
| Form state | TanStack Form + Valibot |
