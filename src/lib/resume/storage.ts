import { newExperienceJobClientKey } from "./experience-id";
import { normalizeStoredLanguageLevel } from "./language-levels";
import { normalizeBodySectionsOrder } from "./body-section-order";
import { DEFAULT_DRAFT, STORAGE_KEY } from "./types";
import type { ResumeDraft } from "./types";
import { isPresetSpokenLanguageName } from "./spoken-language-presets";
import type {
  CourseCertificationEntry,
  EducationEntry,
  ExperienceJob,
  ProjectEntry,
  SpokenLanguageEntry,
} from "./types";

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

function uniqTechStrings(items: string[], max = 40): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of items) {
    const v = typeof raw === "string" ? raw.replace(/\s+/g, " ").trim() : "";
    if (!v) continue;
    const key = v.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(v);
    if (out.length >= max) break;
  }
  return out;
}

function isProjectEntry(value: unknown): value is ProjectEntry {
  if (!isRecord(value)) return false;
  const keyOk =
    value.clientKey === undefined ||
    (typeof value.clientKey === "string" && value.clientKey.length > 0);
  const techOk =
    value.tech === undefined ||
    (Array.isArray(value.tech) && value.tech.every((x) => typeof x === "string"));
  const bulletsOk =
    value.bullets === undefined ||
    (Array.isArray(value.bullets) &&
      value.bullets.every((x) => typeof x === "string"));
  return (
    keyOk &&
    techOk &&
    bulletsOk &&
    typeof value.name === "string" &&
    typeof value.description === "string" &&
    typeof value.link === "string"
  );
}

function isCourseCertificationRecord(value: unknown): value is Record<
  string,
  unknown
> {
  if (!isRecord(value)) return false;
  const keyOk =
    value.clientKey === undefined ||
    (typeof value.clientKey === "string" && value.clientKey.length > 0);
  const bulletsOk =
    value.bullets === undefined ||
    (Array.isArray(value.bullets) &&
      value.bullets.every((x) => typeof x === "string"));
  const titleOk =
    value.title === undefined || typeof value.title === "string";
  return keyOk && bulletsOk && titleOk;
}

function normalizeCertificates(value: unknown): CourseCertificationEntry[] {
  if (!Array.isArray(value)) return [];

  if (isStringArray(value)) {
    return value
      .map((line) => line.trim())
      .filter(Boolean)
      .map((title) => ({
        clientKey: newExperienceJobClientKey(),
        title,
        bullets: [],
      }));
  }

  const entries = value.filter(isCourseCertificationRecord);
  return entries.map((c) => ({
    title: typeof c.title === "string" ? c.title : "",
    bullets: (Array.isArray(c.bullets) ? c.bullets : [])
      .map((x) => (typeof x === "string" ? x.trim() : ""))
      .filter(Boolean),
    clientKey:
      typeof c.clientKey === "string" && c.clientKey.length > 0
        ? c.clientKey
        : newExperienceJobClientKey(),
  }));
}

function normalizeProjects(value: unknown): ProjectEntry[] {
  if (!Array.isArray(value)) return [];

  // Migration: previous versions stored projects as string[] (one bullet per line).
  if (isStringArray(value)) {
    const bullets = value.map((x) => x.trim()).filter(Boolean);
    return bullets.length
      ? [
          {
            clientKey: newExperienceJobClientKey(),
            name: "",
            description: "",
            tech: [],
            link: "",
            bullets,
          },
        ]
      : [];
  }

  const entries = value.filter(isProjectEntry);
  return entries.map((p) => ({
    name: p.name,
    description: p.description,
    link: p.link,
    tech: uniqTechStrings(
      Array.isArray(p.tech) ? p.tech : [],
    ),
    bullets: (Array.isArray(p.bullets) ? p.bullets : [])
      .map((x) => x.trim())
      .filter(Boolean),
    clientKey:
      typeof p.clientKey === "string" && p.clientKey.length > 0
        ? p.clientKey
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
    (value.honors === undefined || typeof value.honors === "string")
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
    clientKey:
      typeof e.clientKey === "string" && e.clientKey.length > 0
        ? e.clientKey
        : newExperienceJobClientKey(),
  }));
}

function isSpokenLanguage(value: unknown): value is SpokenLanguageEntry {
  if (!isRecord(value)) return false;
  const customOk =
    value.useCustomName === undefined ||
    typeof value.useCustomName === "boolean";
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
      projects: normalizeProjects(sections?.projects),
      certificates: normalizeCertificates(sections?.certificates),
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
    const safeDraft: ResumeDraft = photoUrl.startsWith("data:")
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
