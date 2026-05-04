import { Fragment } from "react";
import {
  Document,
  Font,
  Image as PdfImage,
  Link,
  Page,
  Path,
  Svg,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { normalizeBodySectionsOrder } from "@/lib/resume/body-section-order";
import { formatResumeLanguageLine } from "@/lib/resume/language-levels";
import type {
  CourseCertificationEntry,
  ProjectEntry,
  ResumeBodySectionId,
  ResumeDraft,
} from "@/lib/resume/types";
import { getLabels } from "@/lib/resume/labels";
import { resumePdfColors, resumePdfTheme } from "@/lib/resume/pdf-theme";

type Props = {
  draft: ResumeDraft;
  variant?: "ats" | "recruiter";
  assetBaseUrl?: string;
};

// Ensure Cyrillic (Ukrainian/Russian) renders correctly in PDF output.
// We embed a font subset that includes Cyrillic glyphs.
let fontRegisteredForBaseUrl: string | null = null;
function ensurePdfFontsRegistered(assetBaseUrl: string) {
  if (!assetBaseUrl) return;
  if (fontRegisteredForBaseUrl === assetBaseUrl) return;
  fontRegisteredForBaseUrl = assetBaseUrl;

  const base = assetBaseUrl.replace(/\/+$/, "");
  const regularSrc = `${base}/fonts/NotoSans-Regular.ttf`;
  const boldSrc = `${base}/fonts/NotoSans-Bold.ttf`;

  Font.register({
    family: "NotoSansCyrillic",
    fonts: [
      { src: regularSrc, fontWeight: 400 },
      { src: boldSrc, fontWeight: 700 },
    ],
  });
}

const T = resumePdfTheme;
const C = resumePdfColors;

const styles = StyleSheet.create({
  page: {
    paddingTop: T.page.paddingTop,
    paddingBottom: T.page.paddingBottom,
    paddingLeft: T.page.paddingHorizontal,
    paddingRight: T.page.paddingHorizontal,
    fontSize: T.page.fontSize,
    color: C.textPrimary,
    backgroundColor: C.white,
    lineHeight: T.page.lineHeight,
  },
  headerRow: {
    flexDirection: "row",
    gap: T.header.rowGap,
    alignItems: "center",
  },
  headerNameColumn: {
    flex: 1,
  },
  photo: {
    width: T.header.photoSize,
    height: T.header.photoSize,
    objectFit: "cover",
    borderRadius: 999,
  },
  name: {
    fontSize: T.header.nameFontSize,
    fontWeight: 700,
    lineHeight: T.header.nameLineHeight,
  },
  title: {
    marginTop: T.header.titleMarginTop,
    fontSize: T.header.titleFontSize,
    color: C.textSecondary,
    textTransform: "uppercase",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: T.contact.rowGap,
  },
  contactIcon: {
    width: T.contact.iconSize,
    height: T.contact.iconSize,
  },
  contactText: {
    fontSize: T.contact.textFontSize,
    color: C.textSecondary,
  },
  contactColumns: {
    flexDirection: "row",
    gap: T.contact.twoColumnGap,
  },
  contactColumn: {
    flex: 1,
    gap: T.contact.columnLineGap,
  },
  section: {
    marginTop: T.section.marginTop,
  },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: T.heading.titleToRuleGap,
    marginBottom: T.heading.rowMarginBottom,
  },
  sectionHeading: {
    fontSize: T.heading.sectionTitleFontSize,
    fontWeight: 700,
    textTransform: "none",
    color: C.textPrimary,
  },
  headingRule: {
    flex: 1,
    marginTop: T.heading.ruleOffsetTop,
    borderBottomWidth: T.heading.ruleBorderWidth,
    borderBottomColor: C.rule,
  },
  paragraph: {
    color: C.textPrimary,
  },
  list: {
    gap: T.list.itemGap,
    margin: 0,
    padding: 0,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: T.list.bulletRowGap,
    margin: 0,
    marginBottom: 0,
    padding: 0,
  },
  bullet: {
    width: T.list.bulletWidth,
    margin: 0,
    padding: 0,
    fontSize: T.list.bulletFontSize,
    lineHeight: T.list.bulletLineHeight,
    textAlign: "center",
    color: C.textPrimary,
  },
  bulletText: {
    flex: 1,
    margin: 0,
    padding: 0,
    fontSize: T.list.bulletFontSize,
    lineHeight: T.list.bulletLineHeight,
    color: C.textPrimary,
  },
  jobBlock: {
    marginTop: T.jobBlock.marginTop,
  },
  projectRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  projectPhoto: {
    width: 56,
    height: 56,
    objectFit: "cover",
    borderRadius: 6,
  },
  jobTitle: {
    fontSize: T.jobBlock.titleFontSize,
    fontWeight: 700,
    color: C.textPrimary,
  },
  jobMeta: {
    marginTop: T.jobBlock.metaMarginTop,
    fontSize: T.jobBlock.metaFontSize,
    color: C.textMeta,
  },
  projectTechLine: {
    marginTop: 4,
  },
  linkNoUnderline: {
    textDecoration: "none",
  },
  jobHighlights: {
    marginTop: T.jobBlock.highlightsMarginTop,
  },
  educationBlock: {
    marginTop: T.educationBlock.marginTop,
  },
  blockStack: {
    gap: T.stack.blockGap,
  },
  tightStack: {
    gap: T.stack.tightGap,
  },
  pageNumber: {
    position: "absolute",
    bottom: T.pageNumber.bottom,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: T.pageNumber.fontSize,
    color: C.pageNumber,
  },
});

function hasValue(v: string | undefined): boolean {
  return Boolean(v && v.trim().length > 0);
}

function projectHasContent(p: ProjectEntry): boolean {
  const tech = (p.tech ?? []).some((t) => t.trim().length > 0);
  const bullets = (p.bullets ?? []).some((b) => b.trim().length > 0);
  const photo = hasValue(p.photoUrl);
  return (
    hasValue(p.name) ||
    hasValue(p.description) ||
    photo ||
    tech ||
    hasValue(p.link) ||
    bullets
  );
}

function courseHasContent(c: CourseCertificationEntry): boolean {
  const bullets = (c.bullets ?? []).some((b) => b.trim().length > 0);
  return hasValue(c.title) || bullets;
}

function CourseCard({
  course,
  idx,
}: {
  course: CourseCertificationEntry;
  idx: number;
}) {
  const bullets = (course.bullets ?? []).map((s) => s.trim()).filter(Boolean);
  return (
    <View
      key={`course-${idx}-${course.clientKey ?? course.title}`}
      style={styles.jobBlock}
    >
      {hasValue(course.title) ? (
        <View wrap={false}>
          <Text style={styles.jobTitle}>{course.title.trim()}</Text>
        </View>
      ) : null}
      {bullets.length ? (
        <View style={styles.jobHighlights}>
          <BulletList items={bullets} />
        </View>
      ) : null}
    </View>
  );
}

function pdfLinkSrc(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return t;
  if (t.startsWith("www.")) return `https://${t}`;
  return `https://${t}`;
}

function isSafePdfImageSrc(src: string | undefined): boolean {
  if (!src) return false;
  const s = src.trim();
  if (!s) return false;

  // Avoid mixed-content: embedding http:// images into an https page can break export/download.
  if (s.startsWith("http://")) return false;

  // Allow https, base64 data URLs (uploaded images), blob URLs, and same-origin relative paths.
  return (
    s.startsWith("https://") ||
    s.startsWith("data:image/") ||
    s.startsWith("blob:") ||
    s.startsWith("/")
  );
}

type ContactKind =
  | "phone"
  | "email"
  | "location"
  | "link"
  | "linkedin"
  | "github";
type ContactEntry = { kind: ContactKind; text: string };

function PdfContactIcon({ kind }: { kind: ContactKind }) {
  const stroke = resumePdfColors.textPrimary;
  if (kind === "phone") {
    return (
      <Svg
        viewBox="0 0 24 24"
        width={styles.contactIcon.width}
        height={styles.contactIcon.height}
      >
        <Path
          d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.18 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.72c.12.86.33 1.7.63 2.5a2 2 0 0 1-.45 2.11L8.1 9.1a16 16 0 0 0 6.8 6.8l.77-1.17a2 2 0 0 1 2.11-.45c.8.3 1.64.51 2.5.63A2 2 0 0 1 22 16.92z"
          stroke={stroke}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    );
  }

  if (kind === "email") {
    return (
      <Svg
        viewBox="0 0 24 24"
        width={styles.contactIcon.width}
        height={styles.contactIcon.height}
      >
        <Path
          d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
          stroke={stroke}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Path
          d="m22 6-10 7L2 6"
          stroke={stroke}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    );
  }

  if (kind === "location") {
    return (
      <Svg
        viewBox="0 0 24 24"
        width={styles.contactIcon.width}
        height={styles.contactIcon.height}
      >
        <Path
          d="M21 10c0 7-9 12-9 12S3 17 3 10a9 9 0 1 1 18 0z"
          stroke={stroke}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Path
          d="M12 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"
          stroke={stroke}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    );
  }

  if (kind === "linkedin") {
    return (
      <Svg
        viewBox="0 0 24 24"
        width={styles.contactIcon.width}
        height={styles.contactIcon.height}
      >
        <Path
          d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM0.5 8.5H4.5V23H0.5V8.5zM8.5 8.5H12.3V10.5H12.35C12.9 9.5 14.25 8.4 16.25 8.4 20.35 8.4 21.5 11.1 21.5 14.6V23H17.5V15.2C17.5 13.3 17.45 10.9 15 10.9 12.5 10.9 12.1 12.9 12.1 15.1V23H8.5V8.5z"
          fill={stroke}
        />
      </Svg>
    );
  }

  if (kind === "github") {
    return (
      <Svg
        viewBox="0 0 24 24"
        width={styles.contactIcon.width}
        height={styles.contactIcon.height}
      >
        <Path
          d="M12 2C6.48 2 2 6.58 2 12.24c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.48 0-.24-.01-.88-.01-1.72-2.78.62-3.37-1.38-3.37-1.38-.45-1.18-1.1-1.49-1.1-1.49-.9-.64.07-.63.07-.63 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.55-1.14-4.55-5.08 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05A9.2 9.2 0 0 1 12 6.84c.85 0 1.71.12 2.51.36 1.9-1.32 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.95-2.34 4.82-4.57 5.08.36.32.68.95.68 1.91 0 1.38-.01 2.49-.01 2.83 0 .26.18.59.69.48A10.25 10.25 0 0 0 22 12.24C22 6.58 17.52 2 12 2z"
          fill={stroke}
        />
      </Svg>
    );
  }

  return (
    <Svg
      viewBox="0 0 24 24"
      width={styles.contactIcon.width}
      height={styles.contactIcon.height}
    >
      <Path
        d="M10 13a5 5 0 0 1 0-7l1-1a5 5 0 0 1 7 7l-1 1"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M14 11a5 5 0 0 1 0 7l-1 1a5 5 0 0 1-7-7l1-1"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

function PdfContactLine({
  entry,
  variant,
}: {
  entry: ContactEntry;
  variant: "ats" | "recruiter";
}) {
  return (
    <View style={styles.contactRow}>
      {variant === "recruiter" ? <PdfContactIcon kind={entry.kind} /> : null}
      <Text style={styles.contactText}>{entry.text}</Text>
    </View>
  );
}

function BulletList({ items }: { items: string[] }) {
  const cleaned = items.map((s) => s.trim()).filter(Boolean);
  if (!cleaned.length) return null;
  return (
    <View style={styles.list}>
      {cleaned.map((item, idx) => (
        <View key={`${idx}-${item}`} style={styles.bulletRow}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <View
      style={styles.headingRow}
      minPresenceAhead={resumePdfTheme.sectionHeadingMinPresenceAhead}
    >
      <Text style={styles.sectionHeading}>{title}</Text>
      <View style={styles.headingRule} />
    </View>
  );
}

export function ResumePdfDocument({
  draft,
  variant = "ats",
  assetBaseUrl,
}: Props) {
  const fontFamily = assetBaseUrl ? "NotoSansCyrillic" : "Helvetica";
  if (assetBaseUrl) ensurePdfFontsRegistered(assetBaseUrl);
  const labels = getLabels(draft.language);
  const h = draft.header;

  const showPhoto = draft.showPhoto && isSafePdfImageSrc(h.photoUrl);
  const showLinkedIn = draft.showLinkedIn && hasValue(h.linkedIn);
  const showGithub = draft.showGithub && hasValue(h.github);
  const showPortfolio = draft.showPortfolio && hasValue(h.portfolio);

  const contactEntries: ContactEntry[] = [
    hasValue(h.phone)
      ? ({ kind: "phone", text: h.phone.trim() } satisfies ContactEntry)
      : null,
    hasValue(h.email)
      ? ({ kind: "email", text: h.email.trim() } satisfies ContactEntry)
      : null,
    hasValue(h.location)
      ? ({ kind: "location", text: h.location.trim() } satisfies ContactEntry)
      : null,
    showLinkedIn
      ? ({ kind: "linkedin", text: h.linkedIn!.trim() } satisfies ContactEntry)
      : null,
    showGithub
      ? ({ kind: "github", text: h.github!.trim() } satisfies ContactEntry)
      : null,
    showPortfolio
      ? ({ kind: "link", text: h.portfolio!.trim() } satisfies ContactEntry)
      : null,
  ].filter(Boolean) as ContactEntry[];

  const mid = Math.ceil(contactEntries.length / 2);
  const leftContacts = contactEntries.slice(0, mid);
  const rightContacts = contactEntries.slice(mid);

  const sectionsOrder = normalizeBodySectionsOrder(draft.sectionsOrder);
  const skillsHeading =
    draft.skillsHeadingVariant === "technicalSkills"
      ? labels.technicalSkills
      : labels.skills;

  function pdfBodySection(id: ResumeBodySectionId) {
    switch (id) {
      case "skills":
        return draft.sections.skills.length ? (
          <View style={styles.section}>
            <SectionHeading title={skillsHeading} />
            <BulletList items={draft.sections.skills} />
          </View>
        ) : null;
      case "experience":
        return draft.sections.experience.length ? (
          <View style={styles.section}>
            <SectionHeading title={labels.experience} />
            <View style={styles.blockStack}>
              {draft.sections.experience.map((job, idx) => {
                const meta = [job.company, job.location, job.dates]
                  .map((x) => x.trim())
                  .filter(Boolean)
                  .join(" | ");
                const highlights = (job.highlights ?? [])
                  .map((s) => s.trim())
                  .filter(Boolean);
                return (
                  <View
                    key={`job-${idx}-${job.title}-${meta}`}
                    style={styles.jobBlock}
                  >
                    {hasValue(job.title) || meta ? (
                      <View wrap={false}>
                        {hasValue(job.title) ? (
                          <Text style={styles.jobTitle}>{job.title}</Text>
                        ) : null}
                        {meta ? (
                          <Text style={styles.jobMeta}>{meta}</Text>
                        ) : null}
                      </View>
                    ) : null}
                    {highlights.length ? (
                      <View style={styles.jobHighlights}>
                        <BulletList items={highlights} />
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          </View>
        ) : null;
      case "projects": {
        const projectItems = (draft.sections.projects ?? []).filter(
          projectHasContent,
        );
        if (!draft.showProjects || !projectItems.length) return null;
        return (
          <View style={styles.section}>
            <SectionHeading title={labels.projects} />
            <View style={styles.blockStack}>
              {projectItems.map((p, idx) => {
                const techLine = (p.tech ?? [])
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .join(", ");
                const bullets = (p.bullets ?? [])
                  .map((s) => s.trim())
                  .filter(Boolean);
                const href = hasValue(p.link) ? pdfLinkSrc(p.link) : null;
                const showProjectPhoto =
                  variant === "recruiter" && isSafePdfImageSrc(p.photoUrl);
                const photoNode = showProjectPhoto ? (
                  <PdfImage style={styles.projectPhoto} src={p.photoUrl!} />
                ) : null;
                return (
                  <View
                    key={`proj-${idx}-${p.clientKey ?? p.name}`}
                    style={styles.jobBlock}
                  >
                    <View style={styles.projectRow}>
                      {href ? (
                        <Link src={href} style={styles.linkNoUnderline}>
                          {photoNode}
                        </Link>
                      ) : (
                        photoNode
                      )}
                      <View style={{ flex: 1 }}>
                        {hasValue(p.name) || hasValue(p.link) ? (
                          <View wrap={false}>
                            {hasValue(p.name) ? (
                              <Text style={styles.jobTitle}>{p.name}</Text>
                            ) : null}
                          </View>
                        ) : null}
                        {hasValue(p.description) ? (
                          <Text style={styles.paragraph}>
                            {p.description.trim()}
                          </Text>
                        ) : null}
                        {hasValue(p.link) && href ? (
                          <Link src={href} style={[styles.jobMeta, styles.linkNoUnderline]}>
                            {p.link.trim()}
                          </Link>
                        ) : hasValue(p.link) ? (
                          <Text style={styles.jobMeta}>{p.link.trim()}</Text>
                        ) : null}
                        {bullets.length ? (
                          <View style={styles.jobHighlights}>
                            <BulletList items={bullets} />
                          </View>
                        ) : null}
                        {techLine ? (
                          <Text style={[styles.paragraph, styles.projectTechLine]}>
                            {labels.projectTechInlineLabel} {techLine}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        );
      }
      case "education": {
        const educationItems = (draft.sections.education ?? []).filter((e) =>
          [e.degree, e.institution, e.location, e.dates, e.coursework].some(
            (s) => s && s.trim().length > 0,
          ),
        );
        if (!educationItems.length) return null;
        return (
          <View style={styles.section}>
            <SectionHeading title={labels.education} />
            <View style={styles.tightStack}>
              {educationItems.map((e, idx) => {
                const meta = [e.institution, e.location, e.dates]
                  .map((x) => x.trim())
                  .filter(Boolean)
                  .join(" | ");
                return (
                  <View
                    key={`edu-${idx}-${e.clientKey ?? e.degree}`}
                    style={styles.educationBlock}
                  >
                    {hasValue(e.degree) || meta ? (
                      <View wrap={false}>
                        {hasValue(e.degree) ? (
                          <Text style={styles.jobTitle}>{e.degree}</Text>
                        ) : null}
                        {meta ? (
                          <Text style={styles.jobMeta}>{meta}</Text>
                        ) : null}
                      </View>
                    ) : null}
                    {hasValue(e.coursework) ? (
                      <View style={styles.jobHighlights}>
                        <Text style={styles.paragraph}>
                          {labels.educationCoursework}: {e.coursework.trim()}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          </View>
        );
      }
      case "languages":
        return (draft.sections.languages ?? []).some((l) => l.name.trim()) ? (
          <View style={styles.section}>
            <SectionHeading title={labels.languages} />
            <BulletList
              items={(draft.sections.languages ?? [])
                .filter((l) => l.name.trim())
                .map((l) =>
                  formatResumeLanguageLine(draft.language, l.name, l.level),
                )}
            />
          </View>
        ) : null;
      case "certificates": {
        const courseItems = (draft.sections.certificates ?? []).filter(
          courseHasContent,
        );
        if (!draft.showCertificates || !courseItems.length) return null;
        const [firstCourse, ...restCourses] = courseItems;
        return (
          <View style={styles.section}>
            <View wrap={false}>
              <SectionHeading title={labels.certificates} />
              <CourseCard course={firstCourse} idx={0} />
            </View>
            {restCourses.length ? (
              <View style={styles.blockStack}>
                {restCourses.map((course, idx) => (
                  <CourseCard
                    key={`course-${idx + 1}-${course.clientKey ?? course.title}`}
                    course={course}
                    idx={idx + 1}
                  />
                ))}
              </View>
            ) : null}
          </View>
        );
      }
      default:
        return null;
    }
  }

  return (
    <Document>
      <Page size="A4" style={[styles.page, { fontFamily }]}>
        <View style={styles.headerRow}>
          {showPhoto ? (
            <PdfImage style={styles.photo} src={h.photoUrl!} />
          ) : null}
          <View style={styles.headerNameColumn}>
            <Text style={styles.name}>{h.fullName || "Resume"}</Text>
            {hasValue(h.title) ? (
              <Text style={styles.title}>{h.title}</Text>
            ) : null}
          </View>
        </View>

        {contactEntries.length ? (
          <View style={styles.section}>
            <SectionHeading title={labels.contacts} />
            <View style={styles.contactColumns}>
              <View style={styles.contactColumn}>
                {leftContacts.map((entry, idx) => (
                  <PdfContactLine
                    key={`l-${idx}-${entry.kind}-${entry.text}`}
                    entry={entry}
                    variant={variant}
                  />
                ))}
              </View>
              <View style={styles.contactColumn}>
                {rightContacts.map((entry, idx) => (
                  <PdfContactLine
                    key={`r-${idx}-${entry.kind}-${entry.text}`}
                    entry={entry}
                    variant={variant}
                  />
                ))}
              </View>
            </View>
          </View>
        ) : null}

        {hasValue(draft.sections.summary) ? (
          <View style={styles.section}>
            <SectionHeading title={labels.summary} />
            <Text style={styles.paragraph}>{draft.sections.summary}</Text>
          </View>
        ) : null}

        {sectionsOrder.map((sectionId) => (
          <Fragment key={sectionId}>{pdfBodySection(sectionId)}</Fragment>
        ))}

        <Text
          style={styles.pageNumber}
          fixed
          render={({ pageNumber, totalPages }) =>
            totalPages > 1 ? `Page ${pageNumber} of ${totalPages}` : ""
          }
        />
      </Page>
    </Document>
  );
}
