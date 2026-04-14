---
id: general-testing
category: general
tags: [testing, bun, unit, integration]
description: Testing rules and patterns
---

# Testing

## Test runner

Use the built-in Bun test runner. No need for Jest or Vitest:

```ts
import { describe, it, expect, mock } from "bun:test"
```

---

## What to test

- **Services** — primary focus. All business logic must be covered
- **Repositories** — integration tests against a test database
- **Controllers** — not tested directly, covered through service tests

---

## Test structure

```ts
import { describe, it, expect, mock } from "bun:test"
import { createUser } from "./user.service"

describe("createUser", () => {
  it("creates a new user with hashed password", async () => {
    mock.module("@repository/user", () => ({
      getUserByEmail: mock(() => Promise.resolve(null)),
      insertUser: mock(() => Promise.resolve({ id: 1, email: "test@test.com" })),
    }))

    const result = await createUser({ email: "test@test.com", password: "password123" })

    expect(result.id).toBe(1)
    expect(result.email).toBe("test@test.com")
  })

  it("throws if email already exists", async () => {
    mock.module("@repository/user", () => ({
      getUserByEmail: mock(() => Promise.resolve({ id: 1, email: "test@test.com" })),
    }))

    expect(createUser({ email: "test@test.com", password: "password123" }))
      .rejects.toThrow("Email already in use")
  })
})
```

---

## Rules

- One `it` — one scenario
- Test names describe behavior, not implementation: `"throws if email already exists"` not `"test error case"`
- Test files live next to the file under test: `user.service.ts` → `user.service.test.ts`
- Test only the public API of a module, not internal implementation details
