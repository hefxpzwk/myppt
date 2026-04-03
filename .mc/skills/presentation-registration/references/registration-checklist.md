# Registration Checklist

## Use This Reference When

Use this file when adding a new presentation, updating presentation metadata, or checking whether a slide path and metadata entry still match.

## Target Locations

- Static slide assets: `public/slides/<presentation-id>/`
- Presentation metadata: `src/data/`
- Path helpers or validation helpers: `src/utils/`

If these directories do not exist yet, create only what the current request needs and keep names aligned with `.mc/ARCHITECTURE.md`.

## Metadata Checklist

- Keep `id`, `title`, `path`, and `updatedAt` present.
- Use a stable, readable, hyphenated `id`.
- Point `path` to one concrete deployed HTML file.
- Add optional fields only when the user asked for them or the repository already uses them.

## Safety Checks

- Search for the current `id` and `path` before changing them.
- Avoid bulk moves under `public/slides` without explicit approval.
- Stop and ask if a rename would break existing links.

## Validation Checklist

- Confirm the referenced slide file exists.
- Confirm metadata and asset paths match exactly.
- Run project build or local checks if tooling exists.
- If tooling does not exist, report the limited validation scope explicitly.
