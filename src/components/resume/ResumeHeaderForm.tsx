"use client";

import type { ResumeHeader } from "@/lib/resume/types";
import type { ResumeLabels } from "@/lib/resume/labels";

type Props = {
  labels: ResumeLabels;
  header: ResumeHeader;
  showPhoto: boolean;
  showLinkedIn: boolean;
  showGithub: boolean;
  showPortfolio: boolean;
  onHeaderChange: (patch: Partial<ResumeHeader>) => void;
  onVisibilityChange: (patch: {
    showPhoto?: boolean;
    showLinkedIn?: boolean;
    showGithub?: boolean;
    showPortfolio?: boolean;
  }) => void;
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "tel" | "url";
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <label className="block">
      <div className="text-xs font-medium text-slate-600">{label}</div>
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
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

export function ResumeHeaderForm({
  labels,
  header,
  showPhoto,
  showLinkedIn,
  showGithub,
  showPortfolio,
  onHeaderChange,
  onVisibilityChange,
}: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        {labels.header}
      </h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field
          label={labels.fullName}
          value={header.fullName}
          onChange={(v) => onHeaderChange({ fullName: v })}
          placeholder="Jane Doe"
        />
        <Field
          label={labels.title}
          value={header.title}
          onChange={(v) => onHeaderChange({ title: v })}
          placeholder="Senior Frontend Engineer"
        />
        <Field
          label={labels.email}
          type="email"
          inputMode="email"
          value={header.email}
          onChange={(v) => onHeaderChange({ email: v })}
          placeholder="jane@example.com"
        />
        <Field
          label={labels.phone}
          type="tel"
          inputMode="tel"
          value={header.phone}
          onChange={(v) => onHeaderChange({ phone: v })}
          placeholder="+1 555 123 4567"
        />
        <Field
          label={labels.location}
          value={header.location}
          onChange={(v) => onHeaderChange({ location: v })}
          placeholder="Kyiv, Ukraine"
        />
        <Field
          label={labels.photoUrl}
          type="url"
          inputMode="url"
          value={header.photoUrl ?? ""}
          onChange={(v) => onHeaderChange({ photoUrl: v })}
          placeholder="https://..."
        />
        <Field
          label={labels.linkedInUrl}
          type="url"
          inputMode="url"
          value={header.linkedIn ?? ""}
          onChange={(v) => onHeaderChange({ linkedIn: v })}
          placeholder="https://linkedin.com/in/..."
        />
        <Field
          label={labels.githubUrl}
          type="url"
          inputMode="url"
          value={header.github ?? ""}
          onChange={(v) => onHeaderChange({ github: v })}
          placeholder="https://github.com/..."
        />
        <div className="sm:col-span-2">
          <Field
            label={labels.portfolioUrl}
            type="url"
            inputMode="url"
            value={header.portfolio ?? ""}
            onChange={(v) => onHeaderChange({ portfolio: v })}
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-4">
        <Toggle
          label={labels.showPhoto}
          checked={showPhoto}
          onChange={(v) => onVisibilityChange({ showPhoto: v })}
        />
        <Toggle
          label={labels.showLinkedIn}
          checked={showLinkedIn}
          onChange={(v) => onVisibilityChange({ showLinkedIn: v })}
        />
        <Toggle
          label={labels.showGithub}
          checked={showGithub}
          onChange={(v) => onVisibilityChange({ showGithub: v })}
        />
        <Toggle
          label={labels.showPortfolio}
          checked={showPortfolio}
          onChange={(v) => onVisibilityChange({ showPortfolio: v })}
        />
      </div>

      <p className="mt-3 text-xs text-slate-500">
        Tips: If a link is empty, it won’t be shown in the preview or PDF (even
        when enabled).
      </p>
    </section>
  );
}

