---
name: presentation-hub-frontend
description: Implement or refine dashboard and presentation-view frontend work in this repository without breaking the static deployment model. Use when Codex changes presentation hub pages, shared UI, routing around presentation playback, iframe loading, fullscreen controls, or related documentation for this static frontend.
---

# Presentation Hub Frontend

## Overview

Use this skill for dashboard and presentation-view tasks in the static presentation hub.
Preserve the separation between browsing presentations and running a presentation.

## Workflow

1. Read `AGENT.md`, `.mc/RULES.md`, `.mc/CONVENTION.md`, and `.mc/ARCHITECTURE.md` before editing.
2. Classify the task:
   - dashboard browsing UI
   - presentation-view runtime UI
   - shared components or style tokens
   - path resolution or validation helpers
3. Keep page responsibilities narrow:
   - dashboard pages list, filter, sort, and route users
   - presentation pages load and control one presentation
4. Use static data and static assets only. Do not design around runtime APIs.
5. When presentation UI needs hub-level controls, prefer an `iframe`-based viewer and keep recovery UI for invalid paths.

## Guardrails

- Keep the app statically deployable on Vercel.
- Do not add backend assumptions, authentication flows, or CMS-like editing flows.
- Do not perform large routing restructures without approval.
- Do not mix unrelated refactors into a UI task.
- Keep strings, route fragments, and repeated labels centralized only when repetition is established.

## Implementation Notes

- Prefer directories and responsibilities from the architecture document:
  - `src/pages/dashboard`
  - `src/pages/presentation`
  - `src/components`
  - `src/data`
  - `src/utils`
  - `src/styles`
- If the codebase has not been scaffolded yet, create only the subset needed for the current task.
- When choosing between direct navigation and embedding, use direct navigation for fully independent slide apps and `iframe` embedding when the hub must retain controls or recovery UI.
- Check query-string or parameter-driven slide loading for path manipulation risks.

## Validation

Validate the user-facing flow that changed:

- dashboard list or filter behavior
- navigation into a presentation
- invalid-path fallback behavior
- fullscreen or viewer control behavior when touched
- build output if the app scaffold and tooling exist

If the repository does not yet contain app code or build tooling, state that validation was limited to document and structural consistency.

## References

- Read `references/frontend-guardrails.md` for the condensed architecture, failure-path, and security checklist.
