import type { ResumeBodySectionId } from "./types";
import { ALL_RESUME_BODY_SECTION_IDS } from "./types";

const allowedIds = new Set<string>(ALL_RESUME_BODY_SECTION_IDS);

/** Ensures every known section id appears exactly once, in a stable order. */
export function normalizeBodySectionsOrder(value: unknown): ResumeBodySectionId[] {
  if (!Array.isArray(value)) {
    return [...ALL_RESUME_BODY_SECTION_IDS];
  }
  const seen = new Set<string>();
  const out: ResumeBodySectionId[] = [];
  for (const item of value) {
    if (typeof item !== "string" || !allowedIds.has(item) || seen.has(item)) continue;
    seen.add(item);
    out.push(item as ResumeBodySectionId);
  }
  for (const id of ALL_RESUME_BODY_SECTION_IDS) {
    if (!seen.has(id)) out.push(id);
  }
  return out;
}
