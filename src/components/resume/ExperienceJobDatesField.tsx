"use client";

import { useMemo } from "react";

import {
  formatStructuredJobDates,
  tryParseStructuredJobDates,
} from "@/lib/resume/job-dates";
import type { ResumeLanguage } from "@/lib/resume/types";

const inputClass =
  "mt-1 h-7 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-1 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

const UI: Record<
  ResumeLanguage,
  {
    start: string;
    end: string;
    present: string;
    customLead: string;
  }
> = {
  en: {
    start: "Start (month / year)",
    end: "End (month / year)",
    present: "Currently in this role",
    customLead:
      "This line is free-form. Use the date fields below to replace it with a standard range.",
  },
  uk: {
    start: "Початок (місяць / рік)",
    end: "Кінець (місяць / рік)",
    present: "Нині на цій посаді",
    customLead: "Вільний формат. Оберіть дати нижче для стандартного рядка.",
  },
  ru: {
    start: "Начало (месяц / год)",
    end: "Окончание (месяц / год)",
    present: "Работаю сейчас",
    customLead: "Свободный формат. Выберите даты ниже для стандартной строки.",
  },
};

type Props = {
  resumeLanguage: ResumeLanguage;
  value: string;
  onChange: (next: string) => void;
};

export function ExperienceJobDatesField({ resumeLanguage, value, onChange }: Props) {
  const t = UI[resumeLanguage];
  const structured = useMemo(() => tryParseStructuredJobDates(value), [value]);
  const isCustom = value.trim().length > 0 && structured === null;
  const hasStart = Boolean(structured && structured.startYm.trim());

  function applyStructured(
    patch: Partial<{ startYm: string; endYm: string; isPresent: boolean }>,
  ) {
    const base = structured ?? { startYm: "", endYm: "", isPresent: false };
    const next: typeof base = {
      startYm: patch.startYm !== undefined ? patch.startYm : base.startYm,
      endYm: patch.endYm !== undefined ? patch.endYm : base.endYm,
      isPresent: patch.isPresent !== undefined ? patch.isPresent : base.isPresent,
    };
    if (next.isPresent) {
      next.endYm = "";
    }
    const out = formatStructuredJobDates(next);
    if (!out && value.trim() && tryParseStructuredJobDates(value) === null) {
      return;
    }
    onChange(out);
  }

  return (
    <div className="block sm:col-span-2">
      {isCustom ? (
        <label className="block">
          <div className="text-[11px] text-slate-500">{t.customLead}</div>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Aug 2024 – Dec 2026"
            className={inputClass}
          />
        </label>
      ) : null}

      <div className={["grid gap-3 sm:grid-cols-2", isCustom ? "mt-2" : ""].filter(Boolean).join(" ")}>
        <label className="block min-w-0">
          <div className="text-[11px] font-medium text-slate-600">{t.start}</div>
          <input
            type="month"
            value={structured?.startYm ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              if (!v) {
                onChange("");
                return;
              }
              applyStructured({ startYm: v });
            }}
            className={inputClass}
          />
        </label>
        <label className="block min-w-0">
          <div className="text-[11px] font-medium text-slate-600">{t.end}</div>
          <input
            type="month"
            value={structured?.isPresent ? "" : structured?.endYm ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              applyStructured({ endYm: v, isPresent: false });
            }}
            disabled={Boolean(structured?.isPresent)}
            className={inputClass}
          />
        </label>
      </div>

      <label
        className={[
          "mt-2 flex items-center justify-end gap-2 text-sm text-slate-700",
          hasStart ? "cursor-pointer" : "cursor-not-allowed opacity-60",
        ].join(" ")}
      >
        <input
          type="checkbox"
          checked={Boolean(structured?.isPresent)}
          disabled={!hasStart}
          onChange={(e) => {
            const checked = e.target.checked;
            applyStructured({
              isPresent: checked,
              endYm: checked ? "" : structured?.endYm ?? "",
            });
          }}
          className="h-4 w-4 shrink-0 accent-indigo-600 disabled:cursor-not-allowed"
        />
        <span>{t.present}</span>
      </label>
    </div>
  );
}
