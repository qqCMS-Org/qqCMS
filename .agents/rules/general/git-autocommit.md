---
id: general-git-autocommit
category: general
tags: [git, commits, agent, workflow]
description: Agent auto-commit behavior — when and how the agent commits changes
---

# Agent Auto-Commit

When this rule is active, the agent **must** commit changes after each completed step instead of leaving all changes uncommitted.

## When to commit

Commit after every completed step from `docs/TODO.md`. One step — one commit. Do not batch multiple steps into a single commit.

Also commit after:
- Writing or updating a `docs/` file
- Adding a new feature or fixing a bug that was not part of an explicit TODO step

## Commit format

Follow the Conventional Commits format from `general/git.md`:

```
<type>(<scope>): <description>
```

Use the step description from `docs/TODO.md` as the basis for the commit message. Keep it short and lowercase.

Examples:
```
feat(auth): add JWT refresh token logic
docs: update architecture.md with new auth flow
fix(api): handle missing user id in profile endpoint
chore: update drizzle schema for users table
```

## What to stage

Stage only files relevant to the completed step. Never use `git add .` blindly — review what changed and stage intentionally:

```sh
git add <specific files or directories>
git commit -m "<type>(<scope>): <description>"
```

If unrelated files are modified (e.g., auto-generated lockfiles), stage them in a separate `chore` commit.

## Do not

- Do not push — only commit locally unless explicitly asked
- Do not amend published commits
- Do not commit broken or non-compiling code
- Do not create commits with no meaningful change (e.g., whitespace-only)
