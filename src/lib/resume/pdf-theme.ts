/**
 * Single source of truth for resume PDF spacing and typography (@react-pdf/renderer).
 * All values are in PDF points (pt). Do not duplicate numeric spacing literals in
 * `ResumePdfDocument.tsx` — import from this module instead.
 */
export const RESUME_PDF_THEME_VERSION = 2;

export const resumePdfColors = {
  textPrimary: "#111827",
  textSecondary: "#374151",
  textMeta: "#4B5563",
  rule: "#E5E7EB",
  pageNumber: "#6B7280",
  white: "#ffffff",
} as const;

/**
 * Section heading + horizontal rule rhythm (all in one row: title | rule):
 * - `titleToRuleGap` — horizontal space between the heading `Text` and the flex `headingRule`.
 * - `rowMarginBottom` — margin below the full `headingRow` (title + rule) before the first
 *   line of section body (summary paragraph, bullet list, job block, etc.).
 * - `section.marginTop` — space between the previous section’s last line and the next
 *   section’s heading (first section after header uses the same `section` style).
 */
export const resumePdfTheme = {
  /** Orphan control for section titles (pt); avoids large blank tails on page 1. */
  sectionHeadingMinPresenceAhead: 52,

  page: {
    paddingTop: 28,
    paddingBottom: 32,
    paddingHorizontal: 36,
    fontSize: 10.5,
    lineHeight: 1.25,
  },

  header: {
    rowGap: 12,
    photoSize: 76,
    nameFontSize: 21,
    nameLineHeight: 1.1,
    titleMarginTop: 2,
    titleFontSize: 11,
  },

  contact: {
    rowGap: 6,
    iconSize: 12,
    textFontSize: 9.5,
    twoColumnGap: 18,
    columnLineGap: 4,
  },

  section: {
    marginTop: 11,
  },

  heading: {
    titleToRuleGap: 10,
    rowMarginBottom: 6,
    sectionTitleFontSize: 12.5,
    ruleBorderWidth: 1,
    /** Visual baseline alignment tweak for the horizontal rule in heading rows. */
    ruleOffsetTop: 3,
  },

  list: {
    itemGap: 1.5,
    bulletRowGap: 4,
    bulletWidth: 6,
    bulletFontSize: 10.5,
    bulletLineHeight: 1.15,
  },

  jobBlock: {
    marginTop: 6,
    titleFontSize: 11,
    metaMarginTop: 2,
    metaFontSize: 9.5,
    highlightsMarginTop: 2,
  },

  educationBlock: {
    marginTop: 6,
  },

  /** Vertical gap between stacked blocks (jobs, projects, certificate cards). */
  stack: {
    blockGap: 6,
    tightGap: 0,
  },

  pageNumber: {
    bottom: 18,
    fontSize: 9,
  },
} as const;

export type ResumePdfTheme = typeof resumePdfTheme;
