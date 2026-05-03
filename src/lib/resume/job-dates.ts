/**
 * ATS-oriented employment date ranges, e.g. "Aug 2024 – Dec 2026" or "Aug 2024 – Present".
 * Uses an en-dash (U+2013) between parts — common on resumes and easy for parsers.
 */

export const JOB_DATES_DASH = "\u2013";

/** Canonical word for an ongoing role (widely recognized by ATS). */
export const JOB_DATES_PRESENT = "Present";

const SHORT_MONTHS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
] as const;

const LONG_MONTH_ALIASES: Record<string, number> = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
};

function monthIndexFromToken(token: string): number | null {
  const t = token.toLowerCase().trim();
  if (t.length >= 3) {
    const short = t.slice(0, 3);
    const i = SHORT_MONTHS.indexOf(short as (typeof SHORT_MONTHS)[number]);
    if (i >= 0) return i;
  }
  const longHit = LONG_MONTH_ALIASES[t];
  if (longHit !== undefined) return longHit;
  return null;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** yyyy-MM from year + 1-based month */
export function toYearMonth(year: number, month1: number): string {
  if (!year || month1 < 1 || month1 > 12) return "";
  return `${year}-${pad2(month1)}`;
}

function firstDayOfMonthYm(ym: string): string | null {
  const m = ym.trim().match(/^(\d{4})-(\d{2})$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  if (!y || mo < 1 || mo > 12) return null;
  return `${y}-${pad2(mo)}-01`;
}

function lastDayOfMonthYm(ym: string): string | null {
  const m = ym.trim().match(/^(\d{4})-(\d{2})$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  if (!y || mo < 1 || mo > 12) return null;
  const d = new Date(y, mo, 0);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function parseYearMonthToken(part: string): string | null {
  const p = part.trim();
  if (!p) return null;

  const iso = p.match(/^(\d{4})-(\d{1,2})$/);
  if (iso) {
    const y = Number(iso[1]);
    const mo = Number(iso[2]);
    if (y && mo >= 1 && mo <= 12) return toYearMonth(y, mo);
  }

  const slash = p.match(/^(\d{1,2})[./](\d{4})$/);
  if (slash) {
    const mo = Number(slash[1]);
    const y = Number(slash[2]);
    if (y && mo >= 1 && mo <= 12) return toYearMonth(y, mo);
  }

  const my = p.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (my) {
    const idx = monthIndexFromToken(my[1]);
    if (idx === null) return null;
    const y = Number(my[2]);
    if (!y) return null;
    return toYearMonth(y, idx + 1);
  }

  return null;
}

function validYmd(y: number, mo: number, day: number): boolean {
  if (!y || mo < 1 || mo > 12 || day < 1 || day > 31) return false;
  const dt = new Date(y, mo - 1, day);
  return dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === day;
}

function toYmd(y: number, mo: number, day: number): string {
  return `${y}-${pad2(mo)}-${pad2(day)}`;
}

function ymdToYm(ymd: string): string | null {
  const m = ymd.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const day = Number(m[3]);
  if (!validYmd(y, mo, day)) return null;
  return `${y}-${pad2(mo)}`;
}

/**
 * Parse one side of a range into yyyy-MM-dd.
 * Month-only values use the first or last calendar day of that month (typical for jobs).
 */
function parseFlexibleDatePart(part: string, monthOnlyPosition: "start" | "end"): string | null {
  const p = part.trim();
  if (!p) return null;

  const iso = p.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const y = Number(iso[1]);
    const mo = Number(iso[2]);
    const day = Number(iso[3]);
    if (validYmd(y, mo, day)) return toYmd(y, mo, day);
  }

  // US-style M/D/YYYY or MM/DD/YYYY
  const slashFull = p.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
  if (slashFull) {
    const m1 = Number(slashFull[1]);
    const m2 = Number(slashFull[2]);
    const y = Number(slashFull[3]);
    if (validYmd(y, m1, m2)) return toYmd(y, m1, m2);
  }

  // Jul 15, 2026  |  Jul 15 2026
  const mdy = p.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/);
  if (mdy) {
    const idx = monthIndexFromToken(mdy[1]);
    if (idx === null) return null;
    const day = Number(mdy[2]);
    const y = Number(mdy[3]);
    const mo = idx + 1;
    if (validYmd(y, mo, day)) return toYmd(y, mo, day);
  }

  // 15 Jul 2026
  const dmy = p.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (dmy) {
    const day = Number(dmy[1]);
    const idx = monthIndexFromToken(dmy[2]);
    const y = Number(dmy[3]);
    if (idx === null) return null;
    const mo = idx + 1;
    if (validYmd(y, mo, day)) return toYmd(y, mo, day);
  }

  const ym = parseYearMonthToken(p);
  if (ym) {
    if (monthOnlyPosition === "start") {
      return firstDayOfMonthYm(ym);
    }
    return lastDayOfMonthYm(ym);
  }

  return null;
}

/**
 * Parse one side of a range into yyyy-MM.
 * Accepts full dates too (they'll be converted to month precision).
 */
function parseFlexibleMonthPart(part: string): string | null {
  const p = part.trim();
  if (!p) return null;

  const ym = parseYearMonthToken(p);
  if (ym) return ym;

  const startYmd = parseFlexibleDatePart(p, "start");
  if (startYmd) return ymdToYm(startYmd);

  return null;
}

/**
 * Format yyyy-MM-dd as short English month + day + year (e.g. Jul 15, 2026).
 * English labels are intentional for ATS consistency.
 */
export function formatResumeYmd(ymd: string): string {
  const m = ymd.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return "";
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const day = Number(m[3]);
  if (!validYmd(y, mo, day)) return "";
  const d = new Date(y, mo - 1, day);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

/**
 * Format yyyy-MM as short English month + year (e.g. Sep 2022).
 * Kept for any legacy call sites; job ranges prefer {@link formatResumeYmd}.
 */
export function formatYearMonth(ym: string): string {
  const fd = firstDayOfMonthYm(ym);
  if (!fd) return "";
  const y = Number(fd.slice(0, 4));
  const mo = Number(fd.slice(5, 7));
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(new Date(y, mo - 1, 1));
}

const PRESENT_RE =
  /^(present|currently\s+employed|current|now|нині|зараз|понині|дотепер|наст\.?\s*время|н\.?\s*в\.?|по\s+н\.?\s*в\.?)$/i;

export type StructuredJobDates = {
  startYm: string;
  endYm: string;
  isPresent: boolean;
};

export function formatStructuredJobDates(s: StructuredJobDates): string {
  const start = s.startYm.trim();
  if (!start) return "";
  const a = formatYearMonth(start);
  if (!a) return "";
  if (s.isPresent) return `${a} ${JOB_DATES_DASH} ${JOB_DATES_PRESENT}`;
  const end = s.endYm.trim();
  if (!end) return a;
  const b = formatYearMonth(end);
  if (!b) return a;
  return `${a} ${JOB_DATES_DASH} ${b}`;
}

/**
 * Returns structured fields if the string looks like our ATS range (or a single date).
 * Returns null if non-empty and not recognized (keep free-text editing).
 */
export function tryParseStructuredJobDates(raw: string): StructuredJobDates | null {
  const s = raw.trim();
  if (!s) return { startYm: "", endYm: "", isPresent: false };

  const splitRe = /\s*[–—−\-]\s*/;
  const parts = s.split(splitRe).map((p) => p.trim()).filter(Boolean);

  if (parts.length === 1) {
    const a = parseFlexibleMonthPart(parts[0]!);
    if (a) return { startYm: a, endYm: "", isPresent: false };
    return null;
  }

  if (parts.length >= 2) {
    const a = parseFlexibleMonthPart(parts[0]!);
    if (!a) return null;
    const bRaw = parts[1]!;
    if (PRESENT_RE.test(bRaw)) {
      return { startYm: a, endYm: "", isPresent: true };
    }
    const b = parseFlexibleMonthPart(bRaw);
    if (!b) return null;
    return { startYm: a, endYm: b, isPresent: false };
  }

  return null;
}
