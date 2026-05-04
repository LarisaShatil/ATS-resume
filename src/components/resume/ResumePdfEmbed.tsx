"use client";

import { pdf } from "@react-pdf/renderer";
import { useEffect, useRef, useState } from "react";
import type { ResumeDraft } from "@/lib/resume/types";
import type { ResumeLabels } from "@/lib/resume/labels";
import { ResumePdfDocument } from "./ResumePdfDocument";

type Props = {
  draft: ResumeDraft;
  variant: "ats" | "recruiter";
  labels: Pick<ResumeLabels, "previewPdfUpdating" | "previewPdfError">;
};

const DEBOUNCE_MS = 550;

export function ResumePdfEmbed({ draft, variant, labels }: Props) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const blobUrlRef = useRef<string | null>(null);

  function replaceBlobUrl(next: string | null) {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    if (next) blobUrlRef.current = next;
    setBlobUrl(next);
  }

  useEffect(
    () => () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;

    const timer = window.setTimeout(() => {
      if (cancelled) return;
      setLoading(true);
      setFailed(false);
      void (async () => {
        try {
          const blob = await pdf(
            <ResumePdfDocument draft={draft} variant={variant} />,
          ).toBlob();
          const url = URL.createObjectURL(blob);
          if (cancelled) {
            URL.revokeObjectURL(url);
            return;
          }
          replaceBlobUrl(url);
          setFailed(false);
        } catch (err) {
          console.error(err);
          if (!cancelled) {
            setFailed(true);
            replaceBlobUrl(null);
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [draft, variant]);

  if (failed) {
    return (
      <p className="py-6 text-center text-sm text-red-800">
        {labels.previewPdfError}
      </p>
    );
  }

  if (loading && !blobUrl) {
    return (
      <p
        className="py-12 text-center text-sm text-slate-600"
        role="status"
        aria-live="polite"
      >
        {labels.previewPdfUpdating}
      </p>
    );
  }

  return (
    <>
      {blobUrl ? (
        <iframe
          title="PDF preview"
          src={blobUrl}
          className="h-[min(720px,calc(100vh-14rem))] w-full border-0 bg-white"
        />
      ) : null}
      {loading && blobUrl ? (
        <p className="mt-2 text-center text-xs text-slate-500" role="status">
          {labels.previewPdfUpdating}
        </p>
      ) : null}
    </>
  );
}
