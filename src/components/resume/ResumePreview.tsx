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

function ContactIcon({ kind }: { kind: "phone" | "email" | "link" }) {
  const common =
    "h-8 w-8 rounded-full bg-slate-800 text-white flex items-center justify-center";
  return (
    <span className={common} aria-hidden="true">
      {kind === "phone" ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M6.6 10.8c1.5 2.9 3.7 5.1 6.6 6.6l2.2-2.2c.3-.3.8-.4 1.2-.2 1.3.4 2.7.6 4.2.6.7 0 1.2.5 1.2 1.2V21c0 .7-.5 1.2-1.2 1.2C10.6 22.2 1.8 13.4 1.8 2.4 1.8 1.7 2.3 1.2 3 1.2h3.6c.7 0 1.2.5 1.2 1.2 0 1.4.2 2.8.6 4.2.1.4 0 .9-.2 1.2l-2.2 2.2z" />
        </svg>
      ) : null}
      {kind === "email" ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
        </svg>
      ) : null}
      {kind === "link" ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M3.9 12a5 5 0 0 1 5-5h4v2h-4a3 3 0 0 0 0 6h4v2h-4a5 5 0 0 1-5-5zm7-1h2v2h-2v-2zm4.1-4h-4V5h4a5 5 0 0 1 0 10h-4v-2h4a3 3 0 0 0 0-6z" />
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

  const contactLeft: Array<{ kind: "phone" | "email" | "link"; value: string; href?: string }> =
    [];
  const contactRight: Array<{ kind: "phone" | "email" | "link"; value: string; href?: string }> =
    [];

  if (hasValue(h.phone)) contactLeft.push({ kind: "phone", value: h.phone.trim() });
  if (hasValue(h.email)) contactLeft.push({ kind: "email", value: h.email.trim() });
  if (hasValue(h.location)) contactLeft.push({ kind: "link", value: h.location.trim() });

  if (showLinkedIn)
    contactRight.push({
      kind: "link",
      value: h.linkedIn!.trim(),
      href: h.linkedIn!.trim(),
    });
  if (showGithub)
    contactRight.push({
      kind: "link",
      value: h.github!.trim(),
      href: h.github!.trim(),
    });
  if (showPortfolio)
    contactRight.push({
      kind: "link",
      value: h.portfolio!.trim(),
      href: h.portfolio!.trim(),
    });

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
        <header className="flex items-start gap-6">
          {showPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={h.photoUrl}
              alt={h.fullName ? `${h.fullName} photo` : "Photo"}
              className="h-24 w-24 rounded-full border border-slate-200 object-cover"
            />
          ) : null}
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-medium tracking-tight text-slate-900">
              {h.fullName || "Your Name"}
            </h1>
            {hasValue(h.title) ? (
              <div className="mt-2 text-lg font-semibold uppercase tracking-wide text-slate-800">
                {h.title}
              </div>
            ) : null}
          </div>
        </header>

        {contactLeft.length || contactRight.length ? (
          <section className="mt-5">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-medium tracking-tight text-slate-700">
                {labels.contacts}
              </h2>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="mt-3 grid gap-4 sm:grid-cols-2">
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
                        className="text-sm text-slate-800 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-400"
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
            <p>{draft.sections.skills.join(", ")}</p>
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

