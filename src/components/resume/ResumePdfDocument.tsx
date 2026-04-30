import {
  Document,
  Image as PdfImage,
  Page,
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
    alignItems: "flex-start",
  },
  photo: {
    width: 78,
    height: 78,
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
  contact: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    color: "#374151",
    fontSize: 10,
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
});

function hasValue(v: string | undefined): boolean {
  return Boolean(v && v.trim().length > 0);
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

  const contactParts = [
    hasValue(h.phone) ? h.phone.trim() : null,
    hasValue(h.email) ? h.email.trim() : null,
    hasValue(h.location) ? h.location.trim() : null,
    showLinkedIn ? h.linkedIn!.trim() : null,
    showGithub ? h.github!.trim() : null,
    showPortfolio ? h.portfolio!.trim() : null,
  ].filter(Boolean) as string[];

  const mid = Math.ceil(contactParts.length / 2);
  const leftContacts = contactParts.slice(0, mid);
  const rightContacts = contactParts.slice(mid);

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

        {contactParts.length ? (
          <View style={styles.section}>
            <SectionHeading title={labels.contacts} />
            <View style={{ flexDirection: "row", gap: 18 }}>
              <View style={{ flex: 1, gap: 4 }}>
                {leftContacts.map((p, idx) => (
                  <Text key={`l-${idx}-${p}`}>{p}</Text>
                ))}
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                {rightContacts.map((p, idx) => (
                  <Text key={`r-${idx}-${p}`}>{p}</Text>
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
            <Text style={styles.paragraph}>{draft.sections.skills.join(", ")}</Text>
          </View>
        ) : null}

        {draft.sections.experience.length ? (
          <View style={styles.section}>
            <SectionHeading title={labels.experience} />
            <BulletList items={draft.sections.experience} />
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

