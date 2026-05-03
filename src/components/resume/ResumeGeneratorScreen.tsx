"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_DRAFT } from "@/lib/resume/types";
import type { ResumeDraft, ResumeHeader, ResumeLanguage, ResumeSections } from "@/lib/resume/types";
import { getLabels } from "@/lib/resume/labels";
import { loadDraft, resetDraft, saveDraft } from "@/lib/resume/storage";
import { parseSourceText } from "@/lib/resume/parser";
import { ResumeHeaderForm } from "./ResumeHeaderForm";
import { ResumeLanguageSelect } from "./ResumeLanguageSelect";
import { ResumePreview } from "./ResumePreview";
import { ResumeSectionsEditor } from "./ResumeSectionsEditor";
import { ResumeSourceInput } from "./ResumeSourceInput";

export function ResumeGeneratorScreen() {
  const [draft, setDraft] = useState<ResumeDraft>(DEFAULT_DRAFT);
  const [sourceMessage, setSourceMessage] = useState<string | null>(null);
  const skipFirstSaveRef = useRef(true);

  const labels = useMemo(() => getLabels(draft.language), [draft.language]);

  useEffect(() => {
    const saved = loadDraft();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setDraft(saved);
  }, []);

  useEffect(() => {
    if (skipFirstSaveRef.current) {
      skipFirstSaveRef.current = false;
      return;
    }
    const t = window.setTimeout(() => saveDraft(draft), 400);
    return () => window.clearTimeout(t);
  }, [draft]);

  function patchDraft(patch: Partial<ResumeDraft>) {
    setDraft((d) => ({ ...d, ...patch }));
  }

  function patchHeader(patch: Partial<ResumeHeader>) {
    setDraft((d) => ({ ...d, header: { ...d.header, ...patch } }));
  }

  function patchSections(patch: Partial<ResumeSections>) {
    setDraft((d) => ({ ...d, sections: { ...d.sections, ...patch } }));
  }

  function onGenerateFromText() {
    if (!draft.sourceText.trim()) {
      setSourceMessage("Please paste your career text first, then generate sections.");
      return;
    }
    setSourceMessage(null);
    const sections = parseSourceText(draft.sourceText);
    patchDraft({ sections });
  }

  function onReset() {
    resetDraft();
    setSourceMessage(null);
    setDraft(DEFAULT_DRAFT);
  }

  return (
    <div className="w-full">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-2xl font-semibold tracking-tight text-slate-900">
            {labels.appTitle}
          </div>
          <div className="mt-1 text-sm text-slate-600">
            Paste text → generate sections → edit → preview → download PDF.
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <ResumeLanguageSelect
            value={draft.language}
            onChange={(language: ResumeLanguage) => patchDraft({ language })}
          />
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-600 shadow-sm hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            {labels.resetDraft}
          </button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] xl:grid-cols-[minmax(0,1fr)_minmax(0,1.55fr)]">
        <div className="grid gap-6">
          <ResumeHeaderForm
            labels={labels}
            header={draft.header}
            showPhoto={draft.showPhoto}
            showLinkedIn={draft.showLinkedIn}
            showGithub={draft.showGithub}
            showPortfolio={draft.showPortfolio}
            onHeaderChange={patchHeader}
            onVisibilityChange={(patch) => patchDraft(patch)}
          />

          <ResumeSectionsEditor
            labels={labels}
            resumeLanguage={draft.language}
            sections={draft.sections}
            showProjects={draft.showProjects}
            showCertificates={draft.showCertificates}
            onSectionsChange={patchSections}
            onVisibilityChange={(patch) => patchDraft(patch)}
          />

          <ResumeSourceInput
            labels={labels}
            sourceText={draft.sourceText}
            jobDescription={draft.jobDescription}
            onChange={(patch) => patchDraft(patch)}
            onGenerate={onGenerateFromText}
            message={sourceMessage}
          />
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <ResumePreview labels={labels} draft={draft} />
          <p className="mt-3 text-xs text-slate-500">
            Note: PDF export works even if you never click “Generate” — you can
            edit all sections manually.
          </p>
        </div>
      </div>
    </div>
  );
}

