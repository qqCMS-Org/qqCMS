---
id: general-workflow
category: general
tags: [workflow, agent, planning, documentation, todo]
description: Workflow rules for AI agents — task planning, lazy loaded context, and maintaining docs
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
- **Rule:** If you are about to work on a specific area (e.g., Authentication), you MUST first read the relevant file in `docs/` (e.g. `docs/auth.md`) using your file viewing tools to refresh your memory on the project's exact implementation.

## 3. Maintaining Documentation

The AI agent must keep documentation alive and truthful.
- Whenever you make architectural changes, add new environment variables, or change core domain logic, you MUST independently update the relevant files in the `docs/` directory to reflect the new reality.
- For completely new architectural decisions, briefly summarize them in `docs/adr/` (Architecture Decision Records) so future agents understand the "why" and do not repeat mistakes.

## 4. Commits

- Commit frequently. Tie each commit to a completed step from `docs/TODO.md`.
