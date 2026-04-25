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

### Schema constraints

Never combine `.notNull()` with `.default(null)` — it is a contradiction that compiles but fails at runtime:

```ts
// ❌
value: jsonb("value").notNull().default(null)

// ✅ required field with no default
value: jsonb("value").notNull()

// ✅ optional nullable field
value: jsonb("value").default(null)
```

### Self-referential foreign keys

When a column references the same table (tree/hierarchy), annotate the callback return type as `AnyPgColumn` — otherwise TypeScript cannot resolve the circular reference:

```ts
import { type AnyPgColumn, pgTable, text } from "drizzle-orm/pg-core"

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  parentId: text("parent_id").references((): AnyPgColumn => categories.id, { onDelete: "set null" }),
})
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

The project uses **PGLite by default for local development** and switches to a real PostgreSQL connection in production. This removes the need to run a local Postgres instance.

```ts
// core/Database.ts
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres"
import { drizzle as drizzlePglite } from "drizzle-orm/pglite"
import { Pool } from "pg"
import { PGlite } from "@electric-sql/pglite"
import * as schema from "@schema"

export const db = process.env.DATABASE_URL
  ? drizzlePg(new Pool({ connectionString: process.env.DATABASE_URL }), { schema })
  : drizzlePglite(new PGlite("./local.db"), { schema })
```

**Rule:** if `DATABASE_URL` is set → PostgreSQL (staging/production); if not set → PGLite (local dev, tests). Never hardcode the mode — always branch on the env var.

Required packages:
```sh
bun add drizzle-orm @electric-sql/pglite pg
bun add -d drizzle-kit @types/pg
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
  // pglite is wire-compatible — same migration files work for both drivers
  dbCredentials: process.env.DATABASE_URL
    ? { url: process.env.DATABASE_URL }
    : { url: "file:./local.db" },
})
```

Never modify migration files manually after they have been applied.

Add `local.db` to `.gitignore`.
