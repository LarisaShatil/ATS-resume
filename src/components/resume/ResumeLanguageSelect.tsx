"use client";

import type { ResumeLanguage } from "@/lib/resume/types";

type Props = {
  value: ResumeLanguage;
  onChange: (language: ResumeLanguage) => void;
};

export function ResumeLanguageSelect({ value, onChange }: Props) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-700">
      <span className="text-slate-600">Language</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ResumeLanguage)}
        className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        <option value="en">English</option>
        <option value="uk">Українська</option>
        <option value="ru">Русский</option>
      </select>
    </label>
  );
}

