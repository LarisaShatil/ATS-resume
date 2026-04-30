"use client";

import type { ResumeLabels } from "@/lib/resume/labels";
import type { ResumeSections } from "@/lib/resume/types";

type Props = {
  labels: ResumeLabels;
  sections: ResumeSections;
  showProjects: boolean;
  showCertificates: boolean;
  onSectionsChange: (patch: Partial<ResumeSections>) => void;
  onVisibilityChange: (patch: {
    showProjects?: boolean;
    showCertificates?: boolean;
  }) => void;
};

function arrayToLines(items: string[]): string {
  return items.join("\n");
}

function linesToArray(text: string): string[] {
  return text
    .split(/\r?\n/g)
    .map((l) => l.trim())
    .filter(Boolean);
}

function TextArea({
  label,
  value,
  onChange,
  rows,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <div className="text-xs font-medium text-slate-600">{label}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="mt-1 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      />
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-indigo-600"
      />
      <span>{label}</span>
    </label>
  );
}

export function ResumeSectionsEditor({
  labels,
  sections,
  showProjects,
  showCertificates,
  onSectionsChange,
  onVisibilityChange,
}: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {labels.sections}
        </h2>
        <div className="flex flex-wrap gap-4">
          <Toggle
            label={labels.showProjects}
            checked={showProjects}
            onChange={(v) => onVisibilityChange({ showProjects: v })}
          />
          <Toggle
            label={labels.showCertificates}
            checked={showCertificates}
            onChange={(v) => onVisibilityChange({ showCertificates: v })}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-4">
        <TextArea
          label={labels.summary}
          value={sections.summary}
          onChange={(v) => onSectionsChange({ summary: v })}
          rows={4}
          placeholder="2–4 sentences describing your strengths and impact."
        />
        <TextArea
          label={labels.skills}
          value={arrayToLines(sections.skills)}
          onChange={(v) => onSectionsChange({ skills: linesToArray(v) })}
          rows={5}
          placeholder="One skill per line (e.g., TypeScript)"
        />
        <TextArea
          label={labels.experience}
          value={arrayToLines(sections.experience)}
          onChange={(v) => onSectionsChange({ experience: linesToArray(v) })}
          rows={7}
          placeholder="One bullet per line (e.g., 2022–2024 — Company — Role — Result)"
        />
        <TextArea
          label={labels.projects}
          value={arrayToLines(sections.projects)}
          onChange={(v) => onSectionsChange({ projects: linesToArray(v) })}
          rows={6}
          placeholder="One bullet per line (e.g., Built an internal tool that reduced onboarding time by 30%)."
        />
        <TextArea
          label={labels.education}
          value={arrayToLines(sections.education)}
          onChange={(v) => onSectionsChange({ education: linesToArray(v) })}
          rows={4}
          placeholder="One item per line."
        />
        <TextArea
          label={labels.certificates}
          value={arrayToLines(sections.certificates)}
          onChange={(v) => onSectionsChange({ certificates: linesToArray(v) })}
          rows={4}
          placeholder="One item per line."
        />
      </div>
    </section>
  );
}

