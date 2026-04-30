import { DEFAULT_DRAFT, STORAGE_KEY } from "./types";
import type { ResumeDraft } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function mergeDraft(partial: unknown): ResumeDraft {
  if (!isRecord(partial)) return DEFAULT_DRAFT;
  const p = partial as Partial<ResumeDraft>;

  return {
    ...DEFAULT_DRAFT,
    ...p,
    header: {
      ...DEFAULT_DRAFT.header,
      ...(isRecord(p.header) ? p.header : null),
    },
    sections: {
      ...DEFAULT_DRAFT.sections,
      ...(isRecord(p.sections) ? p.sections : null),
    },
  };
}

export function loadDraft(): ResumeDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return mergeDraft(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveDraft(draft: ResumeDraft): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // ignore quota/security errors
  }
}

export function resetDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

