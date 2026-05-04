"use client";

import { pdf } from "@react-pdf/renderer";
import { useCallback, useState } from "react";
import type { ResumeDraft } from "@/lib/resume/types";
import type { ResumeLabels } from "@/lib/resume/labels";
import { pdfAssetBaseUrlFromWindow } from "@/lib/resume/asset-base-url";
import { ResumePdfDocument } from "./ResumePdfDocument";

type Props = {
  labels: ResumeLabels;
  draft: ResumeDraft;
  fileName: string;
  variant: "ats" | "recruiter";
};

export function ResumePdfDownloadButton({ labels, draft, fileName, variant }: Props) {
  const [loading, setLoading] = useState(false);

  const onDownload = useCallback(async () => {
    if (loading) return;

    // GitHub Pages should be HTTPS. If the page is loaded over HTTP, browsers may block downloads.
    if (
      typeof window !== "undefined" &&
      window.location.protocol !== "https:" &&
      window.location.hostname !== "localhost"
    ) {
      window.alert(
        "Download blocked by browser security. Open the site using HTTPS (https://...) and try again.",
      );
      return;
    }

    setLoading(true);
    try {
      const assetBaseUrl = pdfAssetBaseUrlFromWindow();
      const blob = await pdf(
        <ResumePdfDocument
          draft={draft}
          variant={variant}
          assetBaseUrl={assetBaseUrl}
        />,
      ).toBlob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      window.alert(
        "Failed to generate the PDF. If you added a photo URL, try uploading the photo instead (some hosts block PDF export).",
      );
    } finally {
      setLoading(false);
    }
  }, [draft, fileName, loading, variant]);

  return (
    <button
      type="button"
      onClick={onDownload}
      disabled={loading}
      className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
    >
      {loading ? "Preparing PDF…" : labels.downloadPdf}
    </button>
  );
}

