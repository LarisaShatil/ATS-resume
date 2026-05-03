import { newExperienceJobClientKey } from "./experience-id";
import { normalizeStoredLanguageLevel } from "./language-levels";
import { normalizeBodySectionsOrder } from "./body-section-order";
import { DEFAULT_DRAFT, STORAGE_KEY } from "./types";
import type { ResumeDraft } from "./types";
import { isPresetSpokenLanguageName } from "./spoken-language-presets";
import type { EducationEntry, ExperienceJob, SpokenLanguageEntry } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((x) => typeof x === "string");
}

function isExperienceJob(value: unknown): value is ExperienceJob {
  if (!isRecord(value)) return false;
  const keyOk =
    value.clientKey === undefined ||
    (typeof value.clientKey === "string" && value.clientKey.length > 0);
  return (
    keyOk &&
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
      ? [
          {
            clientKey: newExperienceJobClientKey(),
            title: "",
            company: "",
            location: "",
            dates: "",
            highlights,
          },
        ]
      : [];
  }

  const jobs = value.filter(isExperienceJob);
  return jobs.map((j) => ({
    title: j.title,
    company: j.company,
    location: j.location,
    dates: j.dates,
    highlights: j.highlights.map((x) => x.trim()).filter(Boolean),
    clientKey:
      typeof j.clientKey === "string" && j.clientKey.length > 0
        ? j.clientKey
        : newExperienceJobClientKey(),
  }));
}

function isEducationEntry(value: unknown): value is EducationEntry {
  if (!isRecord(value)) return false;
  const keyOk =
    value.clientKey === undefined ||
    (typeof value.clientKey === "string" && value.clientKey.length > 0);
  return (
    keyOk &&
    typeof value.degree === "string" &&
    typeof value.institution === "string" &&
    typeof value.location === "string" &&
    typeof value.dates === "string" &&
    typeof value.coursework === "string" &&
    typeof value.honors === "string"
  );
}

function normalizeEducation(value: unknown): EducationEntry[] {
  if (!Array.isArray(value)) return [];

  if (isStringArray(value)) {
    return value
      .map((line) => line.trim())
      .filter(Boolean)
      .map((degree) => ({
        degree,
        institution: "",
        location: "",
        dates: "",
        coursework: "",
        honors: "",
        clientKey: newExperienceJobClientKey(),
      }));
  }

  const entries = value.filter(isEducationEntry);
  return entries.map((e) => ({
    degree: e.degree,
    institution: e.institution,
    location: e.location,
    dates: e.dates,
    coursework: e.coursework,
    honors: e.honors,
    clientKey:
      typeof e.clientKey === "string" && e.clientKey.length > 0
        ? e.clientKey
        : newExperienceJobClientKey(),
  }));
}

function isSpokenLanguage(value: unknown): value is SpokenLanguageEntry {
  if (!isRecord(value)) return false;
  const customOk =
    value.useCustomName === undefined || typeof value.useCustomName === "boolean";
  return (
    customOk &&
    typeof value.name === "string" &&
    typeof value.level === "string"
  );
}

function normalizeLanguages(value: unknown): SpokenLanguageEntry[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isSpokenLanguage).map((row) => {
    const name = row.name.trim();
    const useCustomName =
      typeof row.useCustomName === "boolean"
        ? row.useCustomName
        : Boolean(name && !isPresetSpokenLanguageName(name));
    return {
      name,
      level: normalizeStoredLanguageLevel(row.level),
      useCustomName,
      clientKey:
        typeof row.clientKey === "string" && row.clientKey.length > 0
          ? row.clientKey
          : newExperienceJobClientKey(),
    };
  });
}

function mergeDraft(partial: unknown): ResumeDraft {
  if (!isRecord(partial)) return DEFAULT_DRAFT;
  const p = partial as Partial<ResumeDraft>;
  const sections = isRecord(p.sections) ? p.sections : null;

  return {
    ...DEFAULT_DRAFT,
    ...p,
    sectionsOrder: normalizeBodySectionsOrder(p.sectionsOrder),
    header: {
      ...DEFAULT_DRAFT.header,
      ...(isRecord(p.header) ? p.header : null),
    },
    sections: {
      ...DEFAULT_DRAFT.sections,
      ...(sections ? sections : null),
      experience: normalizeExperience(sections?.experience),
      education: normalizeEducation(sections?.education),
      languages: normalizeLanguages(sections?.languages),
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

