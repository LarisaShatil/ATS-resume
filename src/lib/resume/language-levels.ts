import type { ResumeLanguage } from "./types";

/** Canonical values stored on each language row (CEFR + native; widely recognized in hiring). */
export const LANGUAGE_LEVEL_DEFAULT = "b2";

const CANONICAL_LEVELS = new Set([
  "native",
  "c2",
  "c1",
  "b2",
  "b1",
  "a2",
  "a1",
]);

export function normalizeStoredLanguageLevel(value: string): string {
  const t = value.trim();
  return CANONICAL_LEVELS.has(t) ? t : LANGUAGE_LEVEL_DEFAULT;
}

type LevelRow = { value: string; label: string; selectLabel: string };

const OPTIONS: Record<ResumeLanguage, readonly LevelRow[]> = {
  en: [
    { value: "native", label: "Native", selectLabel: "Native" },
    { value: "c2", label: "C2 — Proficient (CEFR)", selectLabel: "C2 — Proficient" },
    { value: "c1", label: "C1 — Advanced (CEFR)", selectLabel: "C1 — Advanced" },
    {
      value: "b2",
      label: "B2 — Upper intermediate / professional working (CEFR)",
      selectLabel: "B2 — Upper intermediate",
    },
    { value: "b1", label: "B1 — Intermediate (CEFR)", selectLabel: "B1 — Intermediate" },
    { value: "a2", label: "A2 — Elementary (CEFR)", selectLabel: "A2 — Elementary" },
    { value: "a1", label: "A1 — Beginner (CEFR)", selectLabel: "A1 — Beginner" },
  ],
  uk: [
    { value: "native", label: "Рідна", selectLabel: "Рідна" },
    { value: "c2", label: "C2 — Вільне володіння (CEFR)", selectLabel: "C2 — Вільне володіння" },
    { value: "c1", label: "C1 — Просунутий (CEFR)", selectLabel: "C1 — Просунутий" },
    {
      value: "b2",
      label: "B2 — Вище середнього / професійне спілкування (CEFR)",
      selectLabel: "B2 — Вище середнього",
    },
    { value: "b1", label: "B1 — Середній (CEFR)", selectLabel: "B1 — Середній" },
    { value: "a2", label: "A2 — Початковий (CEFR)", selectLabel: "A2 — Початковий" },
    { value: "a1", label: "A1 — Базовий (CEFR)", selectLabel: "A1 — Базовий" },
  ],
  ru: [
    { value: "native", label: "Родной", selectLabel: "Родной" },
    { value: "c2", label: "C2 — Свободное владение (CEFR)", selectLabel: "C2 — Свободное владение" },
    { value: "c1", label: "C1 — Продвинутый (CEFR)", selectLabel: "C1 — Продвинутый" },
    {
      value: "b2",
      label: "B2 — Выше среднего / деловое общение (CEFR)",
      selectLabel: "B2 — Выше среднего",
    },
    { value: "b1", label: "B1 — Средний (CEFR)", selectLabel: "B1 — Средний" },
    { value: "a2", label: "A2 — Элементарный (CEFR)", selectLabel: "A2 — Элементарный" },
    { value: "a1", label: "A1 — Начальный (CEFR)", selectLabel: "A1 — Начальный" },
  ],
};

export function languageProficiencyOptions(
  lang: ResumeLanguage,
): { value: string; label: string; selectLabel: string }[] {
  return [...(OPTIONS[lang] ?? OPTIONS.en)];
}

export function proficiencyLabel(lang: ResumeLanguage, value: string): string {
  const opt = languageProficiencyOptions(lang).find((o) => o.value === value);
  return opt?.label ?? value;
}

/** Right-hand side after "—" on the resume, e.g. `C1 (Advanced)` or `Native`. */
const RESUME_LEVEL_DISPLAY: Record<ResumeLanguage, Record<string, string>> = {
  en: {
    native: "Native",
    c2: "C2 (Proficient)",
    c1: "C1 (Advanced)",
    b2: "B2 (Upper intermediate)",
    b1: "B1 (Intermediate)",
    a2: "A2 (Elementary)",
    a1: "A1 (Beginner)",
  },
  uk: {
    native: "Рідна",
    c2: "C2 (Вільне володіння)",
    c1: "C1 (Просунутий)",
    b2: "B2 (Вище середнього)",
    b1: "B1 (Середній)",
    a2: "A2 (Початковий)",
    a1: "A1 (Базовий)",
  },
  ru: {
    native: "Родной",
    c2: "C2 (Свободное владение)",
    c1: "C1 (Продвинутый)",
    b2: "B2 (Выше среднего)",
    b1: "B1 (Средний)",
    a2: "A2 (Элементарный)",
    a1: "A1 (Начальный)",
  },
};

export function resumeLanguageLevelDisplay(lang: ResumeLanguage, levelKey: string): string {
  const k = normalizeStoredLanguageLevel(levelKey);
  const map = RESUME_LEVEL_DISPLAY[lang] ?? RESUME_LEVEL_DISPLAY.en;
  return map[k] ?? map[LANGUAGE_LEVEL_DEFAULT] ?? k;
}

/** One resume line: `English — C1 (Advanced)`. */
export function formatResumeLanguageLine(
  lang: ResumeLanguage,
  languageName: string,
  levelKey: string,
): string {
  const name = languageName.trim();
  const levelPart = resumeLanguageLevelDisplay(lang, levelKey);
  return `${name} — ${levelPart}`;
}
