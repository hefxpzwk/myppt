---
name: presentation-registration
description: Add or update HTML presentation entries in this repository while preserving static frontend constraints, metadata and path consistency, and document alignment. Use when Codex needs to register a new presentation, update an existing slide path, add presentation metadata, or verify that slide files and metadata still map 1:1.
---

# Presentation Registration

## Overview

Use this skill when a task touches presentation assets or presentation metadata.
Treat the repository as a static presentation hub: slide files are stored as static assets, and metadata only points to them.

## Workflow

1. Read `AGENT.md`, `.mc/RULES.md`, `.mc/CONVENTION.md`, and `.mc/ARCHITECTURE.md` before editing.
2. Identify whether the task changes:
   - a slide asset under `public/slides`
   - presentation metadata under `src/data`
   - supporting path-resolution logic under `src/utils`
3. If the repository has not been scaffolded yet, create only the minimum missing files required by the user's request and keep the target layout aligned with the architecture documents.
4. Keep presentation metadata and static asset paths in sync. A metadata `path` must resolve to one concrete deployed file.
5. Validate the changed presentation path, related metadata fields, and any dashboard or presentation-view entry points that consume them.

## Guardrails

- Do not introduce a backend, database, CMS, or runtime API for presentation management.
- Do not change existing `id` or `path` values casually. If compatibility would break, stop and ask for approval first.
- Do not move or delete existing slide directories in bulk without explicit approval.
- Do not expand metadata beyond the current task unless the user asked for it.
- Keep repeated labels and route fragments as constants once repetition is real, not hypothetical.

## Metadata Rules

- Required baseline fields: `id`, `title`, `path`, `updatedAt`
- Optional fields when relevant: `description`, `tags`, `thumbnail`, `author`, `featured`
- Prefer human-readable, hyphenated `id` values that remain stable over time.
- Treat `path` as deployment-facing data, not an arbitrary string. Avoid stringly-typed path assembly spread across the codebase.

## Validation

Use the smallest validation set that proves the change safely:

- Confirm the slide file exists at the referenced location.
- Search for every use of the target `id` or `path` before renaming anything.
- Run the app build or local checks if the frontend app already exists.
- If build tooling does not exist yet, report that validation was limited to file-path and document consistency checks.

## References

- Read `references/registration-checklist.md` for the condensed checklist and expected file targets.
