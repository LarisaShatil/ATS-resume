import { DEFAULT_DRAFT, STORAGE_KEY } from "./types";
import type { ResumeDraft } from "./types";
import type { ExperienceJob } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((x) => typeof x === "string");
}

function isExperienceJob(value: unknown): value is ExperienceJob {
  if (!isRecord(value)) return false;
  return (
    typeof value.title === "string" &&
    typeof value.company === "string" &&
    typeof value.location === "string" &&
    typeof value.dates === "string" &&
    Array.isArray(value.highlights) &&
    value.highlights.every((x) => typeof x === "string")
  );
}

function normalizeExperience(value: unknown): ExperienceJob[] {
  if (!Array.isArray(value)) return [];

  // Migration: previous versions stored experience as string[].
  if (isStringArray(value)) {
    const highlights = value.map((x) => x.trim()).filter(Boolean);
    return highlights.length
      ? [{ title: "", company: "", location: "", dates: "", highlights }]
      : [];
  }

  const jobs = value.filter(isExperienceJob);
  return jobs.map((j) => ({
    title: j.title,
    company: j.company,
    location: j.location,
    dates: j.dates,
    highlights: j.highlights.map((x) => x.trim()).filter(Boolean),
  }));
}

function mergeDraft(partial: unknown): ResumeDraft {
  if (!isRecord(partial)) return DEFAULT_DRAFT;
  const p = partial as Partial<ResumeDraft>;
  const sections = isRecord(p.sections) ? p.sections : null;

  return {
    ...DEFAULT_DRAFT,
    ...p,
    header: {
      ...DEFAULT_DRAFT.header,
      ...(isRecord(p.header) ? p.header : null),
    },
    sections: {
      ...DEFAULT_DRAFT.sections,
      ...(sections ? sections : null),
      experience: normalizeExperience(sections?.experience),
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
    const photoUrl = draft.header.photoUrl ?? "";
    const safeDraft: ResumeDraft =
      photoUrl.startsWith("data:")
        ? { ...draft, header: { ...draft.header, photoUrl: "" } }
        : draft;

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(safeDraft));
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

