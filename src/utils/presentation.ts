import { presentations, type PresentationMeta } from '../data/slides';

const PRESENTATION_ID_PATTERN = /^[a-z0-9-]+$/;

export function sanitizePresentationId(rawId: string): string | null {
  if (!PRESENTATION_ID_PATTERN.test(rawId)) {
    return null;
  }

  return rawId;
}

export function getPresentationById(id: string): PresentationMeta | null {
  return presentations.find((presentation) => presentation.id === id) ?? null;
}
