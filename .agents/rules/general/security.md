---
id: general-security
category: general
tags: [security, secrets, validation, dependencies]
description: Basic security rules
---

# Security

## Secrets and environment variables

Never hardcode secrets. Always use environment variables:

```ts
// ❌
const db = new Database("postgresql://user:password@localhost/mydb")

// ✅
const db = new Database(process.env.DATABASE_URL)
```

- Add `.env` to `.gitignore`
- Keep `.env.example` with all keys but no real values
- Validate required variables at startup:

```ts
// config.ts
const required = ["DATABASE_URL", "JWT_SECRET", "API_KEY"]

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env variable: ${key}`)
  }
}

export const config = {
  databaseUrl: process.env.DATABASE_URL!,
  jwtSecret: process.env.JWT_SECRET!,
}
```

---

## Input validation

Always validate data at the boundary — user input, external APIs, database results. Use [Valibot](https://valibot.dev/):

```ts
import * as v from "valibot"

const CreateUserSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  password: v.pipe(v.string(), v.minLength(8)),
  name: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
})

export const createUser = async (input: unknown) => {
  const data = v.parse(CreateUserSchema, input)
  // data is now typed and validated
}
```

---

## Dependencies

- Do not add dependencies without a clear reason
- Before installing a package check: weekly downloads, maintenance activity, last publish date
- Keep dependencies up to date: `bun update`
- Do not ignore `bun audit` warnings
