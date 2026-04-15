---
id: general-code-style
category: general
tags: [typescript, code-style, naming, functions, errors]
description: General TypeScript code style rules
---

# Code Style

## TypeScript

Enable `strict: true` in `tsconfig.json`. No exceptions.

### Forbidden patterns

```ts
// ❌ any
const data: any = fetchData()

// ❌ type assertion
const user = response as User

// ❌ non-null assertion
const name = user!.name
```

```ts
// ✅ explicit typing
const data: User = fetchData()

// ✅ explicit check
if (user) {
  const name = user.name
}

// ✅ optional chaining
const name = user?.name
```

### `interface` vs `type`

Use `interface` for object shapes:

```ts
interface UserProfile {
  id: number
  email: string
  createdAt: Date
}
```

Use `type` for transformations of existing types:

```ts
type PublicProfile = Omit<UserProfile, 'createdAt'>
type UserId = Pick<UserProfile, 'id'>
type NullableUser = UserProfile | null
```

### Type imports

Always use `import type` when importing purely for TypeScript types. This ensures bundlers drop the types cleanly. Use inline type imports when mixing types and values.

```ts
// ✅
import { getUser, type UserProfile } from "@repository/user"
import type { AppConfig } from "@shared/config"

// ❌
import { getUser, UserProfile } from "@repository/user"
import { AppConfig } from "@shared/config"
```

---

## Naming

All variables, parameters, and functions must have meaningful names. No single-letter abbreviations:

```ts
// ✅
users.forEach((user) => { ... })
array.map((item, index) => { ... })
fetch("url").catch((error) => { ... })

// ❌
users.forEach((u) => { ... })
array.map((x, i) => { ... })
fetch("url").catch((e) => { ... })
```

---

## Functions over classes

Write services, controllers, and repositories as files with exported functions:

```ts
// ✅ db/repository/user.ts
export const getUser = async (id: number) => {
  return db.query.users.findFirst({
    where: eq(users.id, id)
  })
}

// ❌ no need to wrap in a class
export class UserRepository {
  async getUser(id: number) { ... }
}
```

---

## Error handling

Use `.catch(() => null)` when you only need to handle absence — less nesting:

```ts
const user = await getUser(id).catch(() => null)

if (!user) {
  return { error: "User not found" }
}
```

Use `try/catch` when you need detailed handling or multiple operations:

```ts
try {
  await saveUser(profile)
  await sendWelcomeEmail(profile.email)
} catch (error) {
  logger.error(`Failed to register user: ${error}`)
  throw new Error("Registration failed")
}
```

---

## Constants and magic numbers

Never hardcode "magic numbers" or special string literals throughout the codebase. Extract them into a shared constants file, use `as const` objects, or declare them as variables at the top of the file.

```ts
// ❌
if (user.status === "pending") {
  setTimeout(retry, 5000)
}

// ✅
export const USER_STATUS = {
  PENDING: "pending",
  ACTIVE: "active",
} as const

const RETRY_DELAY_MS = 5000

if (user.status === USER_STATUS.PENDING) {
  setTimeout(retry, RETRY_DELAY_MS)
}
```

---

## Comments

Do not write comments — write readable code. If code needs explanation, rename variables and functions instead:

```ts
// ❌
const b = await getBan(id)
if (b) res.send(403)

// ✅ code explains itself
const activeBan = await getActiveBan(userId).catch(() => null)
if (activeBan) {
  return response.forbidden(activeBan.reason)
}
```

---

## Barrel exports

Every module and layer exports its public API through `index.ts`:

```ts
// modules/user/index.ts
export { createUser, updateUser } from "./user.service"
export type { UserProfile } from "./user.types"
```

Repositories (`db/repository/*`) are an exception — import them directly via path alias:

```ts
// ✅
import { getUser } from "@repository/user"

// ❌
import { getUser } from "../../db/repository/user"
```

---

## Path aliases

Always use path aliases instead of relative paths. Each alias points to a folder with an `index.ts`:

```ts
// ✅
import { Button } from "@shared/ui"
import { useAuth } from "@features/auth"

// ❌
import { Button } from "../../shared/ui"
import { useAuth } from "../features/auth"
```
