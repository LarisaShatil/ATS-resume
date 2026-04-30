"use client";

import dynamic from "next/dynamic";
import type { ResumeDraft } from "@/lib/resume/types";
import type { ResumeLabels } from "@/lib/resume/labels";

const ResumePdfDownloadButton = dynamic(
  () =>
    import("./ResumePdfDownloadButton").then((m) => m.ResumePdfDownloadButton),
  {
    ssr: false,
    loading: () => (
      <button
        type="button"
        disabled
        className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm opacity-60"
      >
        Preparing PDF…
      </button>
    ),
  },
);

type Props = {
  labels: ResumeLabels;
  draft: ResumeDraft;
};

function hasValue(v: string | undefined): boolean {
  return Boolean(v && v.trim().length > 0);
}

function slugifyFilePart(input: string): string {
  const s = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  return s || "draft";
}

function PreviewSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6">
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-medium tracking-tight text-slate-700">
          {title}
        </h3>
        <div className="h-px flex-1 bg-slate-200" />
      </div>
      <div className="mt-2 text-sm leading-6 text-slate-800">{children}</div>
    </section>
  );
}

function ContactIcon({
  kind,
}: {
  kind: "phone" | "email" | "location" | "link" | "linkedin" | "github";
}) {
  const common = "h-4 w-4 text-slate-900";
  return (
    <span className={common} aria-hidden="true">
      {kind === "phone" ? (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.18 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.72c.12.86.33 1.7.63 2.5a2 2 0 0 1-.45 2.11L8.1 9.1a16 16 0 0 0 6.8 6.8l.77-1.17a2 2 0 0 1 2.11-.45c.8.3 1.64.51 2.5.63A2 2 0 0 1 22 16.92z" />
        </svg>
      ) : null}
      {kind === "email" ? (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
          <path d="m22 6-10 7L2 6" />
        </svg>
      ) : null}
      {kind === "location" ? (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 10c0 7-9 12-9 12S3 17 3 10a9 9 0 1 1 18 0z" />
          <path d="M12 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
        </svg>
      ) : null}
      {kind === "link" ? (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 13a5 5 0 0 1 0-7l1-1a5 5 0 0 1 7 7l-1 1" />
          <path d="M14 11a5 5 0 0 1 0 7l-1 1a5 5 0 0 1-7-7l1-1" />
        </svg>
      ) : null}
      {kind === "linkedin" ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM0.5 8.5H4.5V23H0.5V8.5zM8.5 8.5H12.3V10.5H12.35C12.9 9.5 14.25 8.4 16.25 8.4 20.35 8.4 21.5 11.1 21.5 14.6V23H17.5V15.2C17.5 13.3 17.45 10.9 15 10.9 12.5 10.9 12.1 12.9 12.1 15.1V23H8.5V8.5z" />
        </svg>
      ) : null}
      {kind === "github" ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.58 2 12.24c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.48 0-.24-.01-.88-.01-1.72-2.78.62-3.37-1.38-3.37-1.38-.45-1.18-1.1-1.49-1.1-1.49-.9-.64.07-.63.07-.63 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.55-1.14-4.55-5.08 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05A9.2 9.2 0 0 1 12 6.84c.85 0 1.71.12 2.51.36 1.9-1.32 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.95-2.34 4.82-4.57 5.08.36.32.68.95.68 1.91 0 1.38-.01 2.49-.01 2.83 0 .26.18.59.69.48A10.25 10.25 0 0 0 22 12.24C22 6.58 17.52 2 12 2z" />
        </svg>
      ) : null}
    </span>
  );
}

export function ResumePreview({ labels, draft }: Props) {
  const h = draft.header;

  const showPhoto = draft.showPhoto && hasValue(h.photoUrl);
  const showLinkedIn = draft.showLinkedIn && hasValue(h.linkedIn);
  const showGithub = draft.showGithub && hasValue(h.github);
  const showPortfolio = draft.showPortfolio && hasValue(h.portfolio);

  const contactEntries: Array<{
    kind: "phone" | "email" | "location" | "link" | "linkedin" | "github";
    value: string;
    href?: string;
  }> = [
    hasValue(h.phone) ? { kind: "phone", value: h.phone.trim() } : null,
    hasValue(h.email) ? { kind: "email", value: h.email.trim() } : null,
    hasValue(h.location) ? { kind: "location", value: h.location.trim() } : null,
    showLinkedIn
      ? { kind: "linkedin", value: h.linkedIn!.trim(), href: h.linkedIn!.trim() }
      : null,
    showGithub ? { kind: "github", value: h.github!.trim(), href: h.github!.trim() } : null,
    showPortfolio ? { kind: "link", value: h.portfolio!.trim(), href: h.portfolio!.trim() } : null,
  ].filter(Boolean) as Array<{
    kind: "phone" | "email" | "location" | "link" | "linkedin" | "github";
    value: string;
    href?: string;
  }>;

  const mid = Math.ceil(contactEntries.length / 2);
  const contactLeft = contactEntries.slice(0, mid);
  const contactRight = contactEntries.slice(mid);

  const fileName = `resume-${slugifyFilePart(h.fullName || "")}.pdf`;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            {labels.preview}
          </h2>
          <p className="mt-2 text-xs text-slate-500">
            ATS-friendly layout (single column, standard headings, bullet lists).
          </p>
        </div>
        <ResumePdfDownloadButton labels={labels} draft={draft} fileName={fileName} />
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-6">
        <header className="flex items-center gap-4">
          {showPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={h.photoUrl}
              alt={h.fullName ? `${h.fullName} photo` : "Photo"}
              className="h-[94px] w-[94px] rounded-full border border-slate-200 object-cover"
            />
          ) : null}
          <div className="min-w-0 flex-1">
            <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-slate-900">
              {h.fullName || "Your Name"}
            </h1>
            {hasValue(h.title) ? (
              <div className="mt-1 text-[16px] font-semibold uppercase tracking-wide text-slate-800">
                {h.title}
              </div>
            ) : null}
          </div>
        </header>

        {contactEntries.length ? (
          <section className="mt-5">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-medium tracking-tight text-slate-700">
                {labels.contacts}
              </h2>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-8">
              <div className="grid gap-2">
                {contactLeft.map((c, idx) => (
                  <div key={`${idx}-${c.value}`} className="flex items-center gap-3">
                    <ContactIcon kind={c.kind} />
                    <span className="text-sm text-slate-800">{c.value}</span>
                  </div>
                ))}
              </div>
              <div className="grid gap-2">
                {contactRight.map((c, idx) => (
                  <div key={`${idx}-${c.value}`} className="flex items-center gap-3">
                    <ContactIcon kind={c.kind} />
                    {c.href ? (
                      <a
                        href={c.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-slate-800"
                      >
                        {c.value}
                      </a>
                    ) : (
                      <span className="text-sm text-slate-800">{c.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {hasValue(draft.sections.summary) ? (
          <PreviewSection title={labels.summary}>
            <p className="whitespace-pre-line">{draft.sections.summary}</p>
          </PreviewSection>
        ) : null}

        {draft.sections.skills.length ? (
          <PreviewSection title={labels.skills}>
            <ul className="list-disc space-y-1 pl-5">
              {draft.sections.skills.map((x, idx) => (
                <li key={`${idx}-${x}`}>{x}</li>
              ))}
            </ul>
          </PreviewSection>
        ) : null}

        {draft.sections.experience.length ? (
          <PreviewSection title={labels.experience}>
            <ul className="list-disc space-y-1 pl-5">
              {draft.sections.experience.map((x, idx) => (
                <li key={`${idx}-${x}`}>{x}</li>
              ))}
            </ul>
          </PreviewSection>
        ) : null}

        {draft.showProjects && draft.sections.projects.length ? (
          <PreviewSection title={labels.projects}>
            <ul className="list-disc space-y-1 pl-5">
              {draft.sections.projects.map((x, idx) => (
                <li key={`${idx}-${x}`}>{x}</li>
              ))}
            </ul>
          </PreviewSection>
        ) : null}

        {draft.sections.education.length ? (
          <PreviewSection title={labels.education}>
            <ul className="list-disc space-y-1 pl-5">
              {draft.sections.education.map((x, idx) => (
                <li key={`${idx}-${x}`}>{x}</li>
              ))}
            </ul>
          </PreviewSection>
        ) : null}

        {draft.showCertificates && draft.sections.certificates.length ? (
          <PreviewSection title={labels.certificates}>
            <ul className="list-disc space-y-1 pl-5">
              {draft.sections.certificates.map((x, idx) => (
                <li key={`${idx}-${x}`}>{x}</li>
              ))}
            </ul>
          </PreviewSection>
        ) : null}
      </div>
    </section>
  );
}

