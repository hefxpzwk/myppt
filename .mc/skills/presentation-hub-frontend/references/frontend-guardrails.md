# Frontend Guardrails

## Use This Reference When

Use this file when working on dashboard pages, presentation pages, shared UI, or path-handling logic in the static presentation hub.

## Architectural Split

- Dashboard responsibilities: list, filter, sort, and route users to a presentation
- Presentation responsibilities: load one presentation, manage viewer controls, and recover safely from invalid paths
- Shared responsibilities: reusable UI, tokens, metadata access, and helper logic

## Preferred Locations

- `src/pages/dashboard`
- `src/pages/presentation`
- `src/components`
- `src/data`
- `src/utils`
- `src/styles`

Create only the files needed for the active request when the scaffold is incomplete.

## Failure Paths

- Missing slide file
- Metadata exists but file is absent
- Invalid query parameter or route parameter
- Static deploy path differs from expectation

Every change that affects presentation loading should preserve a clear way back to the dashboard.

## Security Checks

- Keep slide loading limited to repository-owned static files.
- Check any query-string or route-parameter based path selection for traversal or arbitrary-path risks.
- Review `iframe` usage for appropriate sandboxing or capability restrictions when the viewer uses embedding.

## Validation Checklist

- Test the navigation path that changed.
- Check invalid-path behavior if loading rules changed.
- Test fullscreen or viewer controls if touched.
- Run build or local checks when the app scaffold exists.
