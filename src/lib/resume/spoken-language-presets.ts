import type { ResumeLanguage } from "./types";

/** Select value when the name is not from the preset list. */
export const SPOKEN_LANGUAGE_CUSTOM = "__custom__";

const PRESETS: readonly {
  readonly en: string;
  readonly uk: string;
  readonly ru: string;
}[] = [
  { en: "English", uk: "Англійська", ru: "Английский" },
  { en: "Ukrainian", uk: "Українська", ru: "Украинский" },
  { en: "Russian", uk: "Російська", ru: "Русский" },
  { en: "German", uk: "Німецька", ru: "Немецкий" },
  { en: "French", uk: "Французька", ru: "Французский" },
  { en: "Spanish", uk: "Іспанська", ru: "Испанский" },
  { en: "Italian", uk: "Італійська", ru: "Итальянский" },
  { en: "Polish", uk: "Польська", ru: "Польский" },
  { en: "Dutch", uk: "Нідерландська", ru: "Нидерландский" },
  { en: "Swedish", uk: "Шведська", ru: "Шведский" },
  { en: "Finnish", uk: "Фінська", ru: "Финский" },
  { en: "Portuguese", uk: "Португальська", ru: "Португальский" },
  { en: "Chinese", uk: "Китайська", ru: "Китайский" },
  { en: "Japanese", uk: "Японська", ru: "Японский" },
  { en: "Korean", uk: "Корейська", ru: "Корейский" },
  { en: "Arabic", uk: "Арабська", ru: "Арабский" },
  { en: "Hebrew", uk: "Іврит", ru: "Иврит" },
  { en: "Turkish", uk: "Турецька", ru: "Турецкий" },
  { en: "Hindi", uk: "Гінді", ru: "Хинди" },
  { en: "Czech", uk: "Чеська", ru: "Чешский" },
  { en: "Romanian", uk: "Румунська", ru: "Румынский" },
  { en: "Slovak", uk: "Словацька", ru: "Словацкий" },
  { en: "Hungarian", uk: "Угорська", ru: "Венгерский" },
  { en: "Greek", uk: "Грецька", ru: "Греческий" },
  { en: "Danish", uk: "Данська", ru: "Датский" },
  { en: "Norwegian", uk: "Норвезька", ru: "Норвежский" },
] as const;

function presetMatchesName(p: (typeof PRESETS)[number], name: string): boolean {
  const n = name.trim();
  if (!n) return false;
  return p.en === n || p.uk === n || p.ru === n;
}

/** Dropdown options for the current UI language. */
export function spokenLanguageSelectOptions(
  lang: ResumeLanguage,
): { value: string; label: string }[] {
  return PRESETS.map((p) => ({ value: p[lang], label: p[lang] }));
}

/** `<select>` value: preset label for locale, empty string, or SPOKEN_LANGUAGE_CUSTOM. */
export function spokenLanguageSelectValue(
  name: string,
  lang: ResumeLanguage,
  useCustomName?: boolean,
): "" | typeof SPOKEN_LANGUAGE_CUSTOM | string {
  if (useCustomName) return SPOKEN_LANGUAGE_CUSTOM;
  const n = name.trim();
  if (!n) return "";
  for (const p of PRESETS) {
    if (presetMatchesName(p, n)) return p[lang];
  }
  return SPOKEN_LANGUAGE_CUSTOM;
}

/** True if this name is one of the built-in presets (any locale spelling). */
export function isPresetSpokenLanguageName(name: string): boolean {
  return PRESETS.some((p) => presetMatchesName(p, name));
}

/** If `name` matches a preset (any locale spelling), return the preset label for `lang`. */
export function presetSpokenLanguageNameForLocale(
  name: string,
  lang: ResumeLanguage,
): string | null {
  const n = name.trim();
  if (!n) return null;
  for (const p of PRESETS) {
    if (presetMatchesName(p, n)) return p[lang];
  }
  return null;
}
