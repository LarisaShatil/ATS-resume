"use client";

import { useMemo, useState } from "react";
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

const ResumePdfEmbed = dynamic(
  () => import("./ResumePdfEmbed").then((m) => m.ResumePdfEmbed),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[200px] items-center justify-center text-sm text-slate-600">
        Loading…
      </div>
    ),
  },
);

type Props = {
  labels: ResumeLabels;
  draft: ResumeDraft;
};

function toDownloadFileSegment(input: string): string {
  const s = input
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/(^_+|_+$)+/g, "");
  return s || "Draft";
}

export function ResumePreview({ labels, draft }: Props) {
  const h = draft.header;
  const [pdfVariant, setPdfVariant] = useState<"ats" | "recruiter">("ats");

  const fileName = useMemo(() => {
    const fullNamePart = toDownloadFileSegment(h.fullName || "");
    const titlePart = toDownloadFileSegment(h.title || "");
    return titlePart && titlePart !== "Draft"
      ? `${fullNamePart}_${titlePart}_Resume.pdf`
      : `${fullNamePart}_Resume.pdf`;
  }, [h.fullName, h.title]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-slate-400"
              aria-hidden="true"
            >
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>{labels.preview}</span>
          </h2>
          <p className="mt-2 max-w-prose text-xs text-slate-500">
            {labels.previewPdfHint}
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <div className="flex flex-wrap items-center justify-end gap-3 text-xs text-slate-700">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="pdf-variant"
                value="ats"
                checked={pdfVariant === "ats"}
                onChange={() => setPdfVariant("ats")}
                className="h-4 w-4 accent-indigo-600"
              />
              <span>ATS version (no icons)</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="pdf-variant"
                value="recruiter"
                checked={pdfVariant === "recruiter"}
                onChange={() => setPdfVariant("recruiter")}
                className="h-4 w-4 accent-indigo-600"
              />
              <span>Recruiter version (icons)</span>
            </label>
          </div>
          <ResumePdfDownloadButton
            labels={labels}
            draft={draft}
            fileName={fileName}
            variant={pdfVariant}
          />
        </div>
      </div>

      <div className="mt-4">
        <ResumePdfEmbed
          draft={draft}
          variant={pdfVariant}
          labels={labels}
        />
      </div>
    </section>
  );
}
