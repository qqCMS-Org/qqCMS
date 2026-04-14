---
id: backend-elysia
category: backend
tags: [elysia, bun, api, routing]
description: Elysia conventions — routing, controllers, validation, plugins
---

# Elysia

## Setup

```ts
// src/index.ts
import { Elysia } from "elysia"
import { authModule } from "@modules/auth"
import { userModule } from "@modules/user"

const app = new Elysia()
  .use(authModule)
  .use(userModule)
  .listen(3000)

export type App = typeof app
```

Always export `App` type from the entry point — required for Eden Treaty on the frontend.

---

## Controllers

Controllers register routes only. No business logic:

```ts
// modules/user/user.controller.ts
import { Elysia } from "elysia"
import { getUser, updateUser } from "./user.service"
import { UpdateUserSchema } from "./user.types"

export const userController = new Elysia({ prefix: "/users" })
  .get("/:id", ({ params }) => getUser(params.id))
  .patch("/:id", ({ params, body }) => updateUser(params.id, body), {
    body: UpdateUserSchema,
  })
```

---

## Services

Services contain business logic and import from repositories:

```ts
// modules/user/user.service.ts
import { getUser as getUserFromDb, updateUserInDb } from "@repository/user"
import type { UpdateUserInput } from "./user.types"

export const getUser = async (id: number) => {
  const user = await getUserFromDb(id).catch(() => null)

  if (!user) {
    throw new Error("User not found")
  }

  return user
}

export const updateUser = async (id: number, data: UpdateUserInput) => {
  const user = await getUserFromDb(id).catch(() => null)

  if (!user) {
    throw new Error("User not found")
  }

  return updateUserInDb(id, data)
}
```

---

## Validation

Always use Valibot for schema validation via `@elysiajs/valibot`. Do not use Elysia's built-in TypeBox (`t.Object`):

```ts
import { Elysia } from "elysia"
import { t } from "@elysiajs/valibot"
import * as v from "valibot"

const UserSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  name: v.pipe(v.string(), v.minLength(1)),
})

export const userController = new Elysia()
  .post("/users", ({ body }) => createUser(body), {
    body: t(UserSchema),
  })
```

---

## Error handling

Use Elysia's built-in error handler at the app level:

```ts
const app = new Elysia()
  .onError(({ code, error, set }) => {
    if (code === "NOT_FOUND") {
      set.status = 404
      return { error: "Not found" }
    }

    if (code === "VALIDATION") {
      set.status = 400
      return { error: "Invalid input", details: error.message }
    }

    set.status = 500
    return { error: "Internal server error" }
  })
  .use(userModule)
```

---

## Plugins / modules

Each feature module is an Elysia plugin:

```ts
// modules/user/index.ts
import { Elysia } from "elysia"
import { userController } from "./user.controller"

export const userModule = new Elysia().use(userController)
```

Group related routes under a shared prefix via the plugin:

```ts
export const userModule = new Elysia({ prefix: "/api" }).use(userController)
```
