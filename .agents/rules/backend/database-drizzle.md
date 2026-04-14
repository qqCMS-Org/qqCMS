---
id: backend-database-drizzle
category: backend
tags: [drizzle, postgresql, database, repository]
description: Drizzle ORM conventions — schema, repository, migrations
---

# Database — Drizzle ORM

## Schema

All table definitions live in `src/db/schema/`. One file per domain entity:

```ts
// db/schema/user.ts
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})
```

`db/schema/index.ts` re-exports everything — required for drizzle-kit:

```ts
// db/schema/index.ts
export * from "./user"
export * from "./post"
```

---

## Repository

All database queries live in `src/db/repository/`. One file per entity (or folder if complex):

```ts
// db/repository/user.ts
import { db } from "@core/Database"
import { users } from "@schema/user"
import { eq } from "drizzle-orm"
import type { NewUser } from "./user.types"

export const getUser = (id: number) =>
  db.query.users.findFirst({
    where: eq(users.id, id),
  })

export const getUserByEmail = (email: string) =>
  db.query.users.findFirst({
    where: eq(users.email, email),
  })

export const insertUser = (data: NewUser) =>
  db.insert(users).values(data).returning()

export const updateUser = (id: number, data: Partial<NewUser>) =>
  db.update(users).set(data).where(eq(users.id, id)).returning()

export const deleteUser = (id: number) =>
  db.delete(users).where(eq(users.id, id))
```

### Naming conventions

| Operation | Prefix | Example |
|---|---|---|
| Select one | `get` | `getUser`, `getUserByEmail` |
| Select many | `get` + plural | `getUsers`, `getUsersByRole` |
| Insert | `insert` | `insertUser` |
| Update | `update` | `updateUser` |
| Delete | `delete` | `deleteUser` |

### Rules

- Repository functions are plain exported functions — no classes
- Repository functions do not contain business logic — only queries
- Services call repository functions, never query the DB directly

---

## Transactions

To handle complex operations atomically, orchestrate the transaction in the `service` layer and pass the transaction object (`tx`) to pure repository functions.

First, define a reusable `Tx` type and add it as an optional parameter to repository functions:

```ts
// db/repository/user.ts
import { db } from "@core/Database"
import { users } from "@schema/user"
import type { ExtractTablesWithRelations } from "drizzle-orm"
import type { PgTransaction } from "drizzle-orm/pg-core"
import type { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js"
import * as schema from "@schema"

// Export this type from a shared file in a real project
type Tx = PgTransaction<PostgresJsQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>

export const insertUser = (data: NewUser, tx?: Tx) => {
  const conn = tx ?? db
  return conn.insert(users).values(data).returning()
}
```

Then, orchestrate the transaction in your service:

```ts
// modules/auth/auth.service.ts
import { db } from "@core/Database"
import { insertUser, insertBankBalance } from "@repository/user"

export const registerUser = async (data: SignUpInput) => {
  return await db.transaction(async (tx) => {
    const [user] = await insertUser(data, tx)
    await insertBankBalance(user.id, tx)
    
    return user
  })
}
```

This keeps repositories strictly focused on pure querying while allowing services to manage business logic and atomic boundaries safely.

---

## Database connection

```ts
// core/Database.ts
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "@schema"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export const db = drizzle(pool, { schema })
```

---

## Migrations

Use drizzle-kit for migrations:

```sh
bunx drizzle-kit generate   # generate migration from schema changes
bunx drizzle-kit migrate    # apply migrations
bunx drizzle-kit studio     # open Drizzle Studio
```

`drizzle.config.ts` in project root:

```ts
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
```

Never modify migration files manually after they have been applied.
