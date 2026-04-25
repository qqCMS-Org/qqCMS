---
id: general-tooling
category: general
tags: [bun, biome, tooling, dependencies]
description: Tooling rules — package manager, formatter, linter
---

# Tooling

## Package manager

Use Bun as the package manager and runtime. Never edit `package.json` manually to add dependencies — always use `bun add` to get the latest versions:

```sh
# ✅ install dependency
bun add hono

# ✅ install dev dependency
bun add -d @types/bun

# ✅ install multiple
bun add valibot @tanstack/react-query zustand

# ❌ do not manually edit package.json to add packages
```

Other Bun commands:

```sh
bun install       # install all dependencies
bun update        # update dependencies
bun remove <pkg>  # remove a dependency
bun run <script>  # run a script from package.json
bun audit         # check for vulnerabilities
```

---

## Formatter and linter

Use [Biome](https://biomejs.dev/) for both formatting and linting. Do not use Prettier or ESLint:

```sh
bun add -d @biomejs/biome
bunx biome init
```

Minimal `biome.json`:

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  }
}
```

Run:

```sh
bunx biome check .          # lint + format check
bunx biome check --write .  # lint + format fix
```

Add to CI and pre-commit — do not commit code that fails Biome checks.

---

## UUID generation

Prefer the built-in `crypto.randomUUID()` over the `uuid` package. It is available natively in Bun, Node.js ≥ 19, and all modern browsers — no extra dependency needed:

```ts
// ❌ external package — unnecessary
import { v4 as uuidv4 } from "uuid"
const id = uuidv4()

// ✅ built-in Web Crypto API
const id = crypto.randomUUID()
```
