"use client";

import type { ResumeLabels } from "@/lib/resume/labels";

type Props = {
  labels: ResumeLabels;
  sourceText: string;
  jobDescription: string;
  onChange: (patch: { sourceText?: string; jobDescription?: string }) => void;
  onGenerate: () => void;
  message?: string | null;
};

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows: number;
}) {
  return (
    <label className="block">
      <div className="text-xs font-medium text-slate-600">{label}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="mt-1 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      />
    </label>
  );
}

export function ResumeSourceInput({
  labels,
  sourceText,
  jobDescription,
  onChange,
  onGenerate,
  message,
}: Props) {
  const generationEnabled = false;
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        {labels.source}
      </h2>

      <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
        Not available now: generating sections from pasted text is temporarily disabled.
      </div>

      <div className="mt-4 grid gap-4">
        <TextArea
          label={labels.sourceText}
          value={sourceText}
          onChange={(v) => onChange({ sourceText: v })}
          rows={8}
          placeholder="Paste your master profile here (roles, achievements, skills, projects, education, certificates)."
        />
        <TextArea
          label={labels.jobDescription}
          value={jobDescription}
          onChange={(v) => onChange({ jobDescription: v })}
          rows={6}
          placeholder="Paste the vacancy / job description here (optional for MVP)."
        />
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onGenerate}
          disabled={!generationEnabled}
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          {labels.generateFromText}
        </button>

        {message ? (
          <div className="text-sm text-rose-600">{message}</div>
        ) : (
          <div className="text-xs text-slate-500">
            Deterministic parsing (no AI) — everything remains editable.
          </div>
        )}
      </div>
    </section>
  );
}

