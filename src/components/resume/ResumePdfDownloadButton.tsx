"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import type { ResumeDraft } from "@/lib/resume/types";
import type { ResumeLabels } from "@/lib/resume/labels";
import { ResumePdfDocument } from "./ResumePdfDocument";

type Props = {
  labels: ResumeLabels;
  draft: ResumeDraft;
  fileName: string;
};

export function ResumePdfDownloadButton({ labels, draft, fileName }: Props) {
  return (
    <PDFDownloadLink
      document={<ResumePdfDocument draft={draft} />}
      fileName={fileName}
      className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
    >
      {({ loading }) => (loading ? "Preparing PDF…" : labels.downloadPdf)}
    </PDFDownloadLink>
  );
}

