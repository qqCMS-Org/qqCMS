---
id: general-workflow
category: general
tags: [workflow, agent, planning, documentation, todo, reporting, deprecated]
description: Workflow rules for AI agents — task planning, lazy loaded context, maintaining docs, and post-task reporting
---

# Workflow and Planning

This document outlines how AI agents must organize their workflow to write safe, maintainable code without bloating the context window.

## 1. Task Planning (The `TODO.md` Rule)

Never jump straight into writing massive amounts of code.

- When starting a complex task, always create or update a `docs/TODO.md` file.
- Break down the task into small, verifiable steps using a markdown checklist (`[ ] step 1`).
- Execute one step at a time. After completing a step, check it off (`[x] step 1`) and verify the code compiles and works.
- If you encounter a roadblock, update the `TODO.md` to reflect the new direction or sub-steps.

## 2. Lazy Context (Avoiding Context Bloat)

Do not inject large architectural overviews or domain logic into persistent memory files like `.cursorrules` or `CLAUDE.md`. Instead, use "Lazy Loading" for context.

- Keep specific domain documentation in the `docs/` folder (e.g., `docs/auth.md`, `docs/database.md`, `docs/architecture/`).
- **Rule:** Before working on any specific area, you MUST read all relevant files in `docs/` that relate to that area. For example, before editing authentication code read `docs/auth.md`; before touching database logic read `docs/database.md`. Use your file viewing tools to load this context before writing a single line.
- If no relevant doc exists yet, check whether one should be created after completing the task (see section 3).

## 3. Maintaining Documentation

The AI agent must keep documentation alive and truthful.
- Whenever you make architectural changes, add new environment variables, change core domain logic, or modify a public API — you MUST update the relevant files in the `docs/` directory to reflect the new reality. Do this as part of the same task, not as a separate follow-up.
- If the relevant `docs/` file does not exist yet but the change is significant enough to warrant it, create it.
- For completely new architectural decisions, briefly summarize them in `docs/adr/` (Architecture Decision Records) so future agents understand the "why" and do not repeat mistakes.

## 4. Commits

- Commit frequently. Tie each commit to a completed step from `docs/TODO.md`.

## 5. Post-Task Report

After completing every task, provide a concise report in the following format:

```
## Task Report

### What was done
- <bullet list of concrete changes made>

### Key decisions
- <decision>: <why this approach was chosen over alternatives>

### Problems encountered
- <problem>: <how it was resolved, or why it was left unresolved>

### Docs updated
- <list of docs/ files created or modified, or "none">
```

Do not skip this report even for small tasks. If there were no notable decisions or problems, write "none" in those sections rather than omitting them.

## 6. Abstract Task Pre-Announcement

When the user gives a **high-level, abstract task** — one that does not specify exactly which files to touch or which code to write (e.g. "replace SQLite with PGLite", "add dark mode", "migrate to a monorepo") — the agent MUST post a short plan in chat **before** executing anything.

The plan must cover:
- What the task entails (what changes will be made at a high level)
- Which areas/files/systems will be affected
- The order of steps

Format:
```
## Plan: <task name>

1. <step 1 — what and where>
2. <step 2 — what and where>
...
```

Only after posting the plan should the agent begin execution. Do NOT ask the user for approval unless the plan involves something risky or irreversible — just announce it and proceed.

This rule does NOT apply when the user gives a concrete instruction ("in `db.ts` line 42, change X to Y") — proceed directly in that case.

## 7. Answering "Why" and "How" Questions

When the user asks an exploratory question — "why was this done this way?", "what is this for?", "how does X work?", "could we do this differently?" — do NOT immediately start editing or rewriting code.

Instead:
1. **Explain the current decision**: describe why the existing approach was chosen — constraints, tradeoffs, prior context.
2. **Propose alternatives**: if other approaches are viable, list 2–3 options with a brief tradeoff for each (e.g. simplicity vs. flexibility, performance vs. readability).
3. **Wait for the user to choose** before making any changes.

This applies even if the question implies the current solution is wrong. Treat it as a conversation, not a task.

```
// ❌ User asks "why are we using X?" → agent immediately rewrites with Y

// ✅ User asks "why are we using X?" → agent explains X, proposes Y and Z as alternatives
//    with tradeoffs, then waits for direction
```

Only proceed to edit code when the user explicitly confirms which direction to take.
