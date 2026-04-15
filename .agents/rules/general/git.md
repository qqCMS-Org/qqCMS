---
id: general-git
category: general
tags: [git, commits, branches]
description: Git workflow — commits, branches, PRs
---

# Git

## Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>
```

| Type | When to use |
|---|---|
| `feat` | New functionality |
| `fix` | Bug fix |
| `refactor` | Refactoring without behavior change |
| `chore` | Dependency updates, config changes |
| `docs` | Documentation only |
| `test` | Adding or fixing tests |
| `perf` | Performance improvement |

Examples:

```
feat(auth): add JWT refresh token support
fix(user): handle null profile on first login
refactor(api): extract error handling to middleware
chore: update drizzle-orm to 0.31
```

Rules:
- Lowercase description
- No trailing period
- English only
- Describe *what* was done, not *how*

---

## Branches

```
main        — production, merge via PR only
dev         — main development branch
feat/<n>    — new feature
fix/<n>     — bug fix
chore/<n>   — technical tasks
```

Examples:

```
feat/user-auth
fix/login-redirect
chore/update-deps
```

---

## Pull Requests

- PR target is always `dev`, never `main`
- PR title follows the same format as commits: `feat(auth): add JWT refresh`
- One PR — one task
- Squash commits if there are more than three before merging
