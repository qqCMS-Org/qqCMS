---
applyTo: "apps/web/**, apps/admin/**, packages/ui/**"
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

Use [Preact Signals](https://preactjs.com/guide/v10/signals/) for global UI state that is not server data (modals, sidebar, user preferences, etc.). Define signals as module-level stores in `src/stores/`:

```ts
// src/stores/ui.store.ts
import { signal, computed } from "@preact/signals"

export const sidebarOpen = signal(false)
export const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}
```

```tsx
// Usage in component
import { sidebarOpen, toggleSidebar } from "@stores/ui.store"

export const Sidebar = () => (
  <aside style={{ display: sidebarOpen.value ? "block" : "none" }}>
    <button onClick={toggleSidebar}>Close</button>
  </aside>
)
```

Keep stores small and focused. One store per domain, not one global store for everything.

Signals stores are **page-scoped** in an Astro MPA — they re-initialize on each navigation. For cross-page state (e.g. current user identity), rely on SSR data passed from Astro frontmatter, not in-memory signals.

Do not put server data into signals — that is TanStack Query's job.

---

## Forms

Use [TanStack Form](https://tanstack.com/form) for form state management. Validate with TypeBox:

```tsx
import { useForm } from "@tanstack/react-form"
import { Type, type Static } from "@sinclair/typebox"
import { Value } from "@sinclair/typebox/value"

const LoginSchema = Type.Object({
  email: Type.String({ format: "email" }),
  password: Type.String({ minLength: 8 }),
})

type LoginInput = Static<typeof LoginSchema>

export const LoginForm = () => {
  const form = useForm({
    defaultValues: { email: "", password: "" } satisfies LoginInput,
    validators: {
      onChange: ({ value }) => {
        if (!Value.Check(LoginSchema, value)) {
          const errors = [...Value.Errors(LoginSchema, value)]
          return errors[0]?.message ?? "Invalid input"
        }
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
| Global UI state (modals, prefs) | Preact Signals |
| Form state | TanStack Form + TypeBox |
