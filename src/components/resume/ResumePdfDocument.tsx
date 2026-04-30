import {
  Document,
  Image as PdfImage,
  Page,
  Path,
  Svg,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { ResumeDraft } from "@/lib/resume/types";
import { getLabels } from "@/lib/resume/labels";

type Props = {
  draft: ResumeDraft;
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 32,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#111827",
    backgroundColor: "#ffffff",
    lineHeight: 1.4,
  },
  headerRow: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
  },
  photo: {
    width: 94,
    height: 94,
    objectFit: "cover",
    borderRadius: 999,
  },
  name: {
    fontSize: 20,
    fontWeight: 700,
    lineHeight: 1.1,
  },
  title: {
    marginTop: 2,
    fontSize: 12,
    color: "#374151",
    textTransform: "uppercase",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  contactIcon: {
    width: 14,
    height: 14,
  },
  contactText: {
    fontSize: 10,
    color: "#374151",
  },
  section: {
    marginTop: 14,
  },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: "none",
    color: "#111827",
  },
  headingRule: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  paragraph: {
    color: "#111827",
  },
  list: {
    gap: 3,
  },
  bulletRow: {
    flexDirection: "row",
    gap: 6,
  },
  bullet: {
    width: 10,
    color: "#111827",
  },
  bulletText: {
    flex: 1,
    color: "#111827",
  },
  jobBlock: {
    marginTop: 6,
  },
  jobTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "#111827",
  },
  jobMeta: {
    marginTop: 2,
    fontSize: 10,
    color: "#4B5563",
  },
  jobHighlights: {
    marginTop: 4,
  },
});

function hasValue(v: string | undefined): boolean {
  return Boolean(v && v.trim().length > 0);
}

type ContactKind = "phone" | "email" | "location" | "link" | "linkedin" | "github";
type ContactEntry = { kind: ContactKind; text: string };

function PdfContactIcon({ kind }: { kind: ContactKind }) {
  const stroke = "#111827";
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

function PdfContactLine({ entry }: { entry: ContactEntry }) {
  return (
    <View style={styles.contactRow}>
      <PdfContactIcon kind={entry.kind} />
      <Text style={styles.contactText}>{entry.text}</Text>
    </View>
  );
}

function BulletList({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <View style={styles.list}>
      {items.map((item, idx) => (
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
    <View style={styles.headingRow}>
      <Text style={styles.sectionHeading}>{title}</Text>
      <View style={styles.headingRule} />
    </View>
  );
}

export function ResumePdfDocument({ draft }: Props) {
  const labels = getLabels(draft.language);
  const h = draft.header;

  const showPhoto = draft.showPhoto && hasValue(h.photoUrl);
  const showLinkedIn = draft.showLinkedIn && hasValue(h.linkedIn);
  const showGithub = draft.showGithub && hasValue(h.github);
  const showPortfolio = draft.showPortfolio && hasValue(h.portfolio);

  const contactEntries: ContactEntry[] = [
    hasValue(h.phone) ? ({ kind: "phone", text: h.phone.trim() } satisfies ContactEntry) : null,
    hasValue(h.email) ? ({ kind: "email", text: h.email.trim() } satisfies ContactEntry) : null,
    hasValue(h.location)
      ? ({ kind: "location", text: h.location.trim() } satisfies ContactEntry)
      : null,
    showLinkedIn ? ({ kind: "linkedin", text: h.linkedIn!.trim() } satisfies ContactEntry) : null,
    showGithub ? ({ kind: "github", text: h.github!.trim() } satisfies ContactEntry) : null,
    showPortfolio ? ({ kind: "link", text: h.portfolio!.trim() } satisfies ContactEntry) : null,
  ].filter(Boolean) as ContactEntry[];

  const mid = Math.ceil(contactEntries.length / 2);
  const leftContacts = contactEntries.slice(0, mid);
  const rightContacts = contactEntries.slice(mid);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          {showPhoto ? <PdfImage style={styles.photo} src={h.photoUrl!} /> : null}
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{h.fullName || "Resume"}</Text>
            {hasValue(h.title) ? <Text style={styles.title}>{h.title}</Text> : null}
          </View>
        </View>

        {contactEntries.length ? (
          <View style={styles.section}>
            <SectionHeading title={labels.contacts} />
            <View style={{ flexDirection: "row", gap: 18 }}>
              <View style={{ flex: 1, gap: 4 }}>
                {leftContacts.map((entry, idx) => (
                  <PdfContactLine key={`l-${idx}-${entry.kind}-${entry.text}`} entry={entry} />
                ))}
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                {rightContacts.map((entry, idx) => (
                  <PdfContactLine key={`r-${idx}-${entry.kind}-${entry.text}`} entry={entry} />
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

        {draft.sections.skills.length ? (
          <View style={styles.section}>
            <SectionHeading title={labels.skills} />
            <BulletList items={draft.sections.skills} />
          </View>
        ) : null}

        {draft.sections.experience.length ? (
          <View style={styles.section}>
            <SectionHeading title={labels.experience} />
            <View style={{ gap: 6 }}>
              {draft.sections.experience.map((job, idx) => {
                const meta = [job.company, job.location, job.dates]
                  .map((x) => x.trim())
                  .filter(Boolean)
                  .join(" | ");
                return (
                  <View key={`job-${idx}-${job.title}-${meta}`} style={styles.jobBlock}>
                    {hasValue(job.title) ? <Text style={styles.jobTitle}>{job.title}</Text> : null}
                    {meta ? <Text style={styles.jobMeta}>{meta}</Text> : null}
                    {job.highlights.length ? (
                      <View style={styles.jobHighlights}>
                        <BulletList items={job.highlights} />
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          </View>
        ) : null}

        {draft.showProjects && draft.sections.projects.length ? (
          <View style={styles.section}>
            <SectionHeading title={labels.projects} />
            <BulletList items={draft.sections.projects} />
          </View>
        ) : null}

        {draft.sections.education.length ? (
          <View style={styles.section}>
            <SectionHeading title={labels.education} />
            <BulletList items={draft.sections.education} />
          </View>
        ) : null}

        {draft.showCertificates && draft.sections.certificates.length ? (
          <View style={styles.section}>
            <SectionHeading title={labels.certificates} />
            <BulletList items={draft.sections.certificates} />
          </View>
        ) : null}
      </Page>
    </Document>
  );
}

