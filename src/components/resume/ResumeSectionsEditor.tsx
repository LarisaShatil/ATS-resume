"use client";

import type { ResumeLabels } from "@/lib/resume/labels";
import type { ExperienceJob, ResumeSections } from "@/lib/resume/types";

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

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <div className="text-xs font-medium text-slate-600">{label}</div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      />
    </label>
  );
}

function newJob(): ExperienceJob {
  return { title: "", company: "", location: "", dates: "", highlights: [] };
}

export function ResumeSectionsEditor({
  labels,
  sections,
  showProjects,
  showCertificates,
  onSectionsChange,
  onVisibilityChange,
}: Props) {
  const jobs = sections.experience ?? [];
  const jobsForRender = jobs.length ? jobs : [newJob()];

  function patchJob(idx: number, patch: Partial<ExperienceJob>) {
    const next = jobs.map((j, i) => (i === idx ? { ...j, ...patch } : j));
    onSectionsChange({ experience: next });
  }

  function removeJob(idx: number) {
    const next = jobs.filter((_, i) => i !== idx);
    onSectionsChange({ experience: next.length ? next : [newJob()] });
  }

  function addJobAfter(idx: number) {
    const next = [...jobs.slice(0, idx + 1), newJob(), ...jobs.slice(idx + 1)];
    onSectionsChange({ experience: next });
  }

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
        <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs font-medium text-slate-600">{labels.experience}</div>
            <button
              type="button"
              onClick={() => onSectionsChange({ experience: [...jobsForRender, newJob()] })}
              className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Add job
            </button>
          </div>

          <div className="mt-3 grid gap-4">
            {jobsForRender.map((job, idx) => (
              <div key={idx} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    label="Job title"
                    value={job.title}
                    onChange={(v) => patchJob(idx, { title: v })}
                    placeholder="Backend Developer"
                  />
                  <Field
                    label="Company"
                    value={job.company}
                    onChange={(v) => patchJob(idx, { company: v })}
                    placeholder="House of Helsinki (Refufin)"
                  />
                  <Field
                    label="Location"
                    value={job.location}
                    onChange={(v) => patchJob(idx, { location: v })}
                    placeholder="Helsinki, Finland"
                  />
                  <Field
                    label="Dates"
                    value={job.dates}
                    onChange={(v) => patchJob(idx, { dates: v })}
                    placeholder="Oct 2024 – Jun 2025"
                  />
                </div>

                <div className="mt-3">
                  <TextArea
                    label="Highlights (one bullet per line)"
                    value={arrayToLines(job.highlights)}
                    onChange={(v) => patchJob(idx, { highlights: linesToArray(v) })}
                    rows={5}
                    placeholder="Built...\nImproved...\nAutomated..."
                  />
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => addJobAfter(idx)}
                    className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  >
                    Add below
                  </button>
                  <button
                    type="button"
                    onClick={() => removeJob(idx)}
                    className="rounded-md border border-rose-200 bg-white px-2.5 py-1 text-xs font-medium text-rose-700 shadow-sm hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
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

