"use client";

import { useEffect, useMemo, type ReactNode } from "react";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  type DraggableAttributes,
  type DraggableSyntheticListeners,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type { ResumeLabels } from "@/lib/resume/labels";
import { newExperienceJobClientKey } from "@/lib/resume/experience-id";
import { LANGUAGE_LEVEL_DEFAULT, languageProficiencyOptions } from "@/lib/resume/language-levels";
import {
  isPresetSpokenLanguageName,
  SPOKEN_LANGUAGE_CUSTOM,
  spokenLanguageSelectOptions,
  spokenLanguageSelectValue,
} from "@/lib/resume/spoken-language-presets";
import type {
  EducationEntry,
  ExperienceJob,
  ResumeBodySectionId,
  ResumeLanguage,
  ResumeSections,
  SpokenLanguageEntry,
} from "@/lib/resume/types";

import { ExperienceJobDatesField } from "./ExperienceJobDatesField";

/** Shared layout + styles for per-row “Add below” / “Remove” actions (jobs + languages). */
const ROW_ACTIONS_WRAP_CLASS = "mt-3 flex flex-wrap justify-end gap-2";
const ROW_ACTION_BTN_ADD_CLASS =
  "rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white";
const ROW_ACTION_BTN_REMOVE_CLASS =
  "rounded-md border border-rose-200 bg-white px-2.5 py-1 text-xs font-medium text-rose-700 shadow-sm hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

const PLACEHOLDER_CLIENT_KEY = "__experience_editor_placeholder__";
const PLACEHOLDER_EDU_KEY = "__education_editor_placeholder__";

function placeholderJob(): ExperienceJob {
  return {
    clientKey: PLACEHOLDER_CLIENT_KEY,
    title: "",
    company: "",
    location: "",
    dates: "",
    highlights: [],
  };
}

type Props = {
  labels: ResumeLabels;
  resumeLanguage: ResumeLanguage;
  sections: ResumeSections;
  sectionsOrder: ResumeBodySectionId[];
  showProjects: boolean;
  showCertificates: boolean;
  onSectionsChange: (patch: Partial<ResumeSections>) => void;
  onSectionsOrderChange: (next: ResumeBodySectionId[]) => void;
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
  return {
    clientKey: newExperienceJobClientKey(),
    title: "",
    company: "",
    location: "",
    dates: "",
    highlights: [],
  };
}

function placeholderEducation(): EducationEntry {
  return {
    clientKey: PLACEHOLDER_EDU_KEY,
    degree: "",
    institution: "",
    location: "",
    dates: "",
    coursework: "",
    honors: "",
  };
}

function newEducation(): EducationEntry {
  return {
    clientKey: newExperienceJobClientKey(),
    degree: "",
    institution: "",
    location: "",
    dates: "",
    coursework: "",
    honors: "",
  };
}

function DragGripHandle({
  listeners,
  attributes,
  className = "",
  title = "Drag to reorder",
  ariaLabel = "Drag to reorder",
}: {
  listeners: DraggableSyntheticListeners | undefined;
  attributes: DraggableAttributes;
  className?: string;
  title?: string;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      {...listeners}
      {...attributes}
      className={[
        "flex h-9 w-8 shrink-0 touch-none cursor-grab items-center justify-center self-start rounded-md border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        className,
      ].join(" ")}
      title={title}
      aria-label={ariaLabel}
    >
      <svg
        width="14"
        height="18"
        viewBox="0 0 14 18"
        aria-hidden
        className="text-slate-400"
      >
        <circle cx="4" cy="4" r="1.35" fill="currentColor" />
        <circle cx="10" cy="4" r="1.35" fill="currentColor" />
        <circle cx="4" cy="9" r="1.35" fill="currentColor" />
        <circle cx="10" cy="9" r="1.35" fill="currentColor" />
        <circle cx="4" cy="14" r="1.35" fill="currentColor" />
        <circle cx="10" cy="14" r="1.35" fill="currentColor" />
      </svg>
    </button>
  );
}

type JobRowFieldsProps = {
  job: ExperienceJob;
  idx: number;
  resumeLanguage: ResumeLanguage;
  patchJob: (idx: number, patch: Partial<ExperienceJob>) => void;
  addJobAfter: (idx: number) => void;
  removeJob: (idx: number) => void;
};

function ExperienceJobFields({
  job,
  idx,
  resumeLanguage,
  patchJob,
  addJobAfter,
  removeJob,
}: JobRowFieldsProps) {
  return (
    <>
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
        <ExperienceJobDatesField
          resumeLanguage={resumeLanguage}
          value={job.dates}
          onChange={(v) => patchJob(idx, { dates: v })}
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

      <div className={ROW_ACTIONS_WRAP_CLASS}>
        <button type="button" onClick={() => addJobAfter(idx)} className={ROW_ACTION_BTN_ADD_CLASS}>
          Add below
        </button>
        <button type="button" onClick={() => removeJob(idx)} className={ROW_ACTION_BTN_REMOVE_CLASS}>
          Remove
        </button>
      </div>
    </>
  );
}

type SortableJobRowProps = JobRowFieldsProps & {
  sortableId: string;
};

function SortableExperienceJobRow({
  sortableId,
  job,
  idx,
  resumeLanguage,
  patchJob,
  addJobAfter,
  removeJob,
}: SortableJobRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: sortableId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        "rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-opacity",
        isDragging ? "z-10 opacity-80 ring-2 ring-indigo-400/50" : "",
      ].join(" ")}
    >
      <div className="flex gap-3">
        <div className="min-w-0 flex-1">
          <ExperienceJobFields
            job={job}
            idx={idx}
            resumeLanguage={resumeLanguage}
            patchJob={patchJob}
            addJobAfter={addJobAfter}
            removeJob={removeJob}
          />
        </div>
        <DragGripHandle
          listeners={listeners}
          attributes={attributes}
          ariaLabel="Drag to reorder this job"
        />
      </div>
    </div>
  );
}

function StaticExperienceJobRow({
  job,
  idx,
  resumeLanguage,
  patchJob,
  addJobAfter,
  removeJob,
}: JobRowFieldsProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <ExperienceJobFields
        job={job}
        idx={idx}
        resumeLanguage={resumeLanguage}
        patchJob={patchJob}
        addJobAfter={addJobAfter}
        removeJob={removeJob}
      />
    </div>
  );
}

type EducationRowFieldsProps = {
  entry: EducationEntry;
  idx: number;
  labels: ResumeLabels;
  resumeLanguage: ResumeLanguage;
  patchEducation: (idx: number, patch: Partial<EducationEntry>) => void;
  addEducationAfter: (idx: number) => void;
  removeEducation: (idx: number) => void;
};

function EducationEntryFields({
  entry,
  idx,
  labels,
  resumeLanguage,
  patchEducation,
  addEducationAfter,
  removeEducation,
}: EducationRowFieldsProps) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label={labels.educationDegree}
          value={entry.degree}
          onChange={(v) => patchEducation(idx, { degree: v })}
          placeholder="B.Sc. Computer Science"
        />
        <Field
          label={labels.educationInstitution}
          value={entry.institution}
          onChange={(v) => patchEducation(idx, { institution: v })}
          placeholder="University of Helsinki"
        />
        <Field
          label={labels.educationLocation}
          value={entry.location}
          onChange={(v) => patchEducation(idx, { location: v })}
          placeholder="Helsinki, Finland"
        />
        <ExperienceJobDatesField
          resumeLanguage={resumeLanguage}
          value={entry.dates}
          onChange={(v) => patchEducation(idx, { dates: v })}
        />
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-1">
        <TextArea
          label={labels.educationCoursework}
          value={entry.coursework}
          onChange={(v) => patchEducation(idx, { coursework: v })}
          rows={2}
          placeholder="Course 1, Course 2, Course 3"
        />
        <TextArea
          label={labels.educationHonors}
          value={entry.honors}
          onChange={(v) => patchEducation(idx, { honors: v })}
          rows={2}
          placeholder="Summa cum laude"
        />
      </div>

      <div className={ROW_ACTIONS_WRAP_CLASS}>
        <button
          type="button"
          onClick={() => addEducationAfter(idx)}
          className={ROW_ACTION_BTN_ADD_CLASS}
        >
          {labels.addEducationBelow}
        </button>
        <button
          type="button"
          onClick={() => removeEducation(idx)}
          className={ROW_ACTION_BTN_REMOVE_CLASS}
        >
          {labels.removeEducation}
        </button>
      </div>
    </>
  );
}

type SortableEducationRowProps = EducationRowFieldsProps & { sortableId: string };

function SortableEducationRow(props: SortableEducationRowProps) {
  const { sortableId, ...fieldProps } = props;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: sortableId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        "rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-opacity",
        isDragging ? "z-10 opacity-80 ring-2 ring-indigo-400/50" : "",
      ].join(" ")}
    >
      <div className="flex gap-3">
        <div className="min-w-0 flex-1">
          <EducationEntryFields {...fieldProps} />
        </div>
        <DragGripHandle
          listeners={listeners}
          attributes={attributes}
          ariaLabel="Drag to reorder this education entry"
        />
      </div>
    </div>
  );
}

function StaticEducationRow(props: EducationRowFieldsProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <EducationEntryFields {...props} />
    </div>
  );
}

function SortableBodySectionRow({
  id,
  children,
}: {
  id: ResumeBodySectionId;
  children: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        "flex gap-3 rounded-lg transition-opacity",
        isDragging ? "z-10 opacity-80 ring-2 ring-indigo-400/50" : "",
      ].join(" ")}
    >
      <DragGripHandle
        listeners={listeners}
        attributes={attributes}
        title="Drag to reorder section"
        ariaLabel="Drag to reorder section"
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

type LanguageRowFieldsProps = {
  row: SpokenLanguageEntry;
  idx: number;
  labels: ResumeLabels;
  resumeLanguage: ResumeLanguage;
  spokenNameOptions: { value: string; label: string }[];
  proficiencyOptions: { value: string; label: string; selectLabel: string }[];
  patchLanguageRow: (idx: number, patch: Partial<SpokenLanguageEntry>) => void;
  addLanguageAfter: (idx: number) => void;
  removeLanguageRow: (idx: number) => void;
};

function LanguageRowContent({
  row,
  idx,
  labels,
  resumeLanguage,
  spokenNameOptions,
  proficiencyOptions,
  patchLanguageRow,
  addLanguageAfter,
  removeLanguageRow,
}: LanguageRowFieldsProps) {
  const nameSelectVal = spokenLanguageSelectValue(
    row.name,
    resumeLanguage,
    row.useCustomName,
  );
  const showCustomName = nameSelectVal === SPOKEN_LANGUAGE_CUSTOM;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4">
        <div className="min-w-0">
          <div className="mb-1.5 text-xs font-medium text-slate-600">
            {labels.languageChooseFromList}
          </div>
          <select
            value={nameSelectVal}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "") {
                patchLanguageRow(idx, { name: "", useCustomName: false });
                return;
              }
              if (v === SPOKEN_LANGUAGE_CUSTOM) {
                patchLanguageRow(idx, {
                  useCustomName: true,
                  name: isPresetSpokenLanguageName(row.name) ? "" : row.name,
                });
                return;
              }
              patchLanguageRow(idx, { name: v, useCustomName: false });
            }}
            className="h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            <option value="">{labels.languageSelectHint}</option>
            {spokenNameOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
            <option value={SPOKEN_LANGUAGE_CUSTOM}>{labels.languageOtherCustom}</option>
          </select>
          {showCustomName ? (
            <input
              type="text"
              value={row.name}
              onChange={(e) => patchLanguageRow(idx, { name: e.target.value })}
              placeholder={labels.languageCustomPlaceholder}
              className="mt-2 h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            />
          ) : null}
        </div>
        <div className="min-w-0">
          <div className="mb-1.5 text-xs font-medium text-slate-600">
            {labels.languageProficiency}
          </div>
          <select
            value={row.level}
            onChange={(e) => patchLanguageRow(idx, { level: e.target.value })}
            title={proficiencyOptions.find((o) => o.value === row.level)?.label}
            className="h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            {proficiencyOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.selectLabel}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className={ROW_ACTIONS_WRAP_CLASS}>
        <button type="button" onClick={() => addLanguageAfter(idx)} className={ROW_ACTION_BTN_ADD_CLASS}>
          {labels.addLanguageBelow}
        </button>
        <button type="button" onClick={() => removeLanguageRow(idx)} className={ROW_ACTION_BTN_REMOVE_CLASS}>
          {labels.removeLanguage}
        </button>
      </div>
    </>
  );
}

type SortableLanguageRowProps = LanguageRowFieldsProps & { sortableId: string };

function SortableLanguageRow(props: SortableLanguageRowProps) {
  const { sortableId, ...fieldProps } = props;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: sortableId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        "rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-opacity",
        isDragging ? "z-10 opacity-80 ring-2 ring-indigo-400/50" : "",
      ].join(" ")}
    >
      <div className="flex gap-3">
        <div className="min-w-0 flex-1">
          <LanguageRowContent {...fieldProps} />
        </div>
        <DragGripHandle
          listeners={listeners}
          attributes={attributes}
          ariaLabel="Drag to reorder this language"
        />
      </div>
    </div>
  );
}

function StaticLanguageRow(props: LanguageRowFieldsProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <LanguageRowContent {...props} />
    </div>
  );
}

export function ResumeSectionsEditor({
  labels,
  resumeLanguage,
  sections,
  sectionsOrder,
  showProjects,
  showCertificates,
  onSectionsChange,
  onSectionsOrderChange,
  onVisibilityChange,
}: Props) {
  const jobs = useMemo(() => sections.experience ?? [], [sections.experience]);
  const education = useMemo(() => sections.education ?? [], [sections.education]);
  const languages = useMemo(() => sections.languages ?? [], [sections.languages]);
  const proficiencyOptions = useMemo(
    () => languageProficiencyOptions(resumeLanguage),
    [resumeLanguage],
  );
  const spokenNameOptions = useMemo(
    () => spokenLanguageSelectOptions(resumeLanguage),
    [resumeLanguage],
  );
  const jobsForRender = jobs.length ? jobs : [placeholderJob()];
  const canReorderJobs = jobs.length > 1;
  const sortableReady =
    canReorderJobs &&
    jobs.every((j) => typeof j.clientKey === "string" && j.clientKey.length > 0);

  const educationForRender = education.length ? education : [placeholderEducation()];
  const canReorderEducation = education.length > 1;
  const sortableEducationReady =
    canReorderEducation &&
    education.every((e) => typeof e.clientKey === "string" && e.clientKey.length > 0);

  const canReorderLanguages = languages.length > 1;
  const sortableLanguagesReady =
    canReorderLanguages &&
    languages.every((l) => typeof l.clientKey === "string" && l.clientKey.length > 0);

  useEffect(() => {
    if (jobs.length === 0) return;
    if (jobs.every((j) => j.clientKey && j.clientKey.length > 0)) return;
    onSectionsChange({
      experience: jobs.map((j) => ({
        ...j,
        clientKey: j.clientKey && j.clientKey.length > 0 ? j.clientKey : newExperienceJobClientKey(),
      })),
    });
  }, [jobs, onSectionsChange]);

  useEffect(() => {
    if (languages.length === 0) return;
    if (languages.every((l) => l.clientKey && l.clientKey.length > 0)) return;
    onSectionsChange({
      languages: languages.map((row) => ({
        ...row,
        clientKey: row.clientKey && row.clientKey.length > 0 ? row.clientKey : newExperienceJobClientKey(),
      })),
    });
  }, [languages, onSectionsChange]);

  useEffect(() => {
    if (education.length === 0) return;
    if (education.every((e) => e.clientKey && e.clientKey.length > 0)) return;
    onSectionsChange({
      education: education.map((e) => ({
        ...e,
        clientKey: e.clientKey && e.clientKey.length > 0 ? e.clientKey : newExperienceJobClientKey(),
      })),
    });
  }, [education, onSectionsChange]);

  const jobSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 6 },
    }),
  );

  const languageSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 6 },
    }),
  );

  const educationSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 6 },
    }),
  );

  const sectionSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 6 },
    }),
  );

  function patchJob(idx: number, patch: Partial<ExperienceJob>) {
    if (jobs.length === 0 && idx === 0) {
      onSectionsChange({ experience: [{ ...newJob(), ...patch }] });
      return;
    }
    const next = jobs.map((j, i) => (i === idx ? { ...j, ...patch } : j));
    onSectionsChange({ experience: next });
  }

  function removeJob(idx: number) {
    const next = jobs.filter((_, i) => i !== idx);
    onSectionsChange({ experience: next.length ? next : [newJob()] });
  }

  function addJobAfter(idx: number) {
    if (jobs.length === 0) {
      onSectionsChange({ experience: [newJob(), newJob()] });
      return;
    }
    const next = [...jobs.slice(0, idx + 1), newJob(), ...jobs.slice(idx + 1)];
    onSectionsChange({ experience: next });
  }

  function patchEducation(idx: number, patch: Partial<EducationEntry>) {
    if (education.length === 0 && idx === 0) {
      onSectionsChange({ education: [{ ...newEducation(), ...patch }] });
      return;
    }
    const next = education.map((e, i) => (i === idx ? { ...e, ...patch } : e));
    onSectionsChange({ education: next });
  }

  function removeEducation(idx: number) {
    const next = education.filter((_, i) => i !== idx);
    onSectionsChange({ education: next.length ? next : [newEducation()] });
  }

  function addEducationAfter(idx: number) {
    if (education.length === 0) {
      onSectionsChange({ education: [newEducation(), newEducation()] });
      return;
    }
    const next = [...education.slice(0, idx + 1), newEducation(), ...education.slice(idx + 1)];
    onSectionsChange({ education: next });
  }

  function patchLanguageRow(idx: number, patch: Partial<SpokenLanguageEntry>) {
    const next = languages.map((row, i) => (i === idx ? { ...row, ...patch } : row));
    onSectionsChange({ languages: next });
  }

  function addLanguageRow() {
    onSectionsChange({
      languages: [
        ...languages,
        {
          name: "",
          level: LANGUAGE_LEVEL_DEFAULT,
          clientKey: newExperienceJobClientKey(),
          useCustomName: false,
        },
      ],
    });
  }

  function addLanguageAfter(idx: number) {
    const row: SpokenLanguageEntry = {
      name: "",
      level: LANGUAGE_LEVEL_DEFAULT,
      clientKey: newExperienceJobClientKey(),
      useCustomName: false,
    };
    onSectionsChange({
      languages: [...languages.slice(0, idx + 1), row, ...languages.slice(idx + 1)],
    });
  }

  function removeLanguageRow(idx: number) {
    onSectionsChange({ languages: languages.filter((_, i) => i !== idx) });
  }

  function onJobDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = jobs.findIndex((j) => j.clientKey === active.id);
    const newIndex = jobs.findIndex((j) => j.clientKey === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onSectionsChange({ experience: arrayMove(jobs, oldIndex, newIndex) });
  }

  function onLanguageDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = languages.findIndex((l) => l.clientKey === active.id);
    const newIndex = languages.findIndex((l) => l.clientKey === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onSectionsChange({ languages: arrayMove(languages, oldIndex, newIndex) });
  }

  function onEducationDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = education.findIndex((e) => e.clientKey === active.id);
    const newIndex = education.findIndex((e) => e.clientKey === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onSectionsChange({ education: arrayMove(education, oldIndex, newIndex) });
  }

  function onSectionDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sectionsOrder.findIndex((s) => s === active.id);
    const newIndex = sectionsOrder.findIndex((s) => s === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onSectionsOrderChange(arrayMove(sectionsOrder, oldIndex, newIndex));
  }

  const skillsEditor = (
    <TextArea
      label={labels.skills}
      value={arrayToLines(sections.skills)}
      onChange={(v) => onSectionsChange({ skills: linesToArray(v) })}
      rows={5}
      placeholder={"Backend: Node.js, Express, Deno\nTesting: Jest, Vitest,"}
    />
  );

  const experienceEditor = (
    <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs font-medium text-slate-600">{labels.experience}</div>
        <button
          type="button"
          onClick={() =>
            onSectionsChange({
              experience: jobs.length ? [...jobs, newJob()] : [newJob()],
            })
          }
          className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          Add job
        </button>
      </div>

      <div className="mt-3 grid gap-4">
        {sortableReady ? (
          <DndContext sensors={jobSensors} collisionDetection={closestCenter} onDragEnd={onJobDragEnd}>
            <SortableContext
              items={jobs.map((j) => j.clientKey!)}
              strategy={verticalListSortingStrategy}
            >
              {jobs.map((job, idx) => (
                <SortableExperienceJobRow
                  key={job.clientKey}
                  sortableId={job.clientKey!}
                  job={job}
                  idx={idx}
                  resumeLanguage={resumeLanguage}
                  patchJob={patchJob}
                  addJobAfter={addJobAfter}
                  removeJob={removeJob}
                />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          jobsForRender.map((job, idx) => (
            <StaticExperienceJobRow
              key={job.clientKey ?? `job-${idx}`}
              job={job}
              idx={idx}
              resumeLanguage={resumeLanguage}
              patchJob={patchJob}
              addJobAfter={addJobAfter}
              removeJob={removeJob}
            />
          ))
        )}
      </div>
    </div>
  );

  const projectsEditor = (
    <TextArea
      label={labels.projects}
      value={arrayToLines(sections.projects)}
      onChange={(v) => onSectionsChange({ projects: linesToArray(v) })}
      rows={6}
      placeholder="One bullet per line (e.g., Built an internal tool that reduced onboarding time by 30%)."
    />
  );

  const educationEditor = (
    <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs font-medium text-slate-600">{labels.education}</div>
        <button
          type="button"
          onClick={() =>
            onSectionsChange({
              education: education.length ? [...education, newEducation()] : [newEducation()],
            })
          }
          className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          {labels.addEducation}
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-500">{labels.educationOrderHint}</p>

      <div className="mt-3 grid gap-4">
        {sortableEducationReady ? (
          <DndContext
            sensors={educationSensors}
            collisionDetection={closestCenter}
            onDragEnd={onEducationDragEnd}
          >
            <SortableContext
              items={education.map((e) => e.clientKey!)}
              strategy={verticalListSortingStrategy}
            >
              {education.map((entry, idx) => (
                <SortableEducationRow
                  key={entry.clientKey}
                  sortableId={entry.clientKey!}
                  entry={entry}
                  idx={idx}
                  labels={labels}
                  resumeLanguage={resumeLanguage}
                  patchEducation={patchEducation}
                  addEducationAfter={addEducationAfter}
                  removeEducation={removeEducation}
                />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          educationForRender.map((entry, idx) => (
            <StaticEducationRow
              key={entry.clientKey ?? `edu-${idx}`}
              entry={entry}
              idx={idx}
              labels={labels}
              resumeLanguage={resumeLanguage}
              patchEducation={patchEducation}
              addEducationAfter={addEducationAfter}
              removeEducation={removeEducation}
            />
          ))
        )}
      </div>
    </div>
  );

  const languagesEditor = (
    <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs font-medium text-slate-600">{labels.languages}</div>
        <button
          type="button"
          onClick={() => addLanguageRow()}
          className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          {labels.addLanguage}
        </button>
      </div>
      <div className="mt-3 space-y-3">
        {sortableLanguagesReady ? (
          <DndContext
            sensors={languageSensors}
            collisionDetection={closestCenter}
            onDragEnd={onLanguageDragEnd}
          >
            <SortableContext
              items={languages.map((l) => l.clientKey!)}
              strategy={verticalListSortingStrategy}
            >
              {languages.map((row, idx) => (
                <SortableLanguageRow
                  key={row.clientKey}
                  sortableId={row.clientKey!}
                  row={row}
                  idx={idx}
                  labels={labels}
                  resumeLanguage={resumeLanguage}
                  spokenNameOptions={spokenNameOptions}
                  proficiencyOptions={proficiencyOptions}
                  patchLanguageRow={patchLanguageRow}
                  addLanguageAfter={addLanguageAfter}
                  removeLanguageRow={removeLanguageRow}
                />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          languages.map((row, idx) => (
            <StaticLanguageRow
              key={row.clientKey ?? `lang-${idx}`}
              row={row}
              idx={idx}
              labels={labels}
              resumeLanguage={resumeLanguage}
              spokenNameOptions={spokenNameOptions}
              proficiencyOptions={proficiencyOptions}
              patchLanguageRow={patchLanguageRow}
              addLanguageAfter={addLanguageAfter}
              removeLanguageRow={removeLanguageRow}
            />
          ))
        )}
      </div>
    </div>
  );

  const certificatesEditor = (
    <TextArea
      label={labels.certificates}
      value={arrayToLines(sections.certificates)}
      onChange={(v) => onSectionsChange({ certificates: linesToArray(v) })}
      rows={4}
      placeholder="One item per line."
    />
  );

  const bodySectionEditors: Record<ResumeBodySectionId, ReactNode> = {
    skills: skillsEditor,
    experience: experienceEditor,
    projects: projectsEditor,
    education: educationEditor,
    languages: languagesEditor,
    certificates: certificatesEditor,
  };

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
        <p className="mt-2 text-xs text-slate-500">{labels.sectionReorderHint}</p>
        <DndContext
          sensors={sectionSensors}
          collisionDetection={closestCenter}
          onDragEnd={onSectionDragEnd}
        >
          <SortableContext items={sectionsOrder} strategy={verticalListSortingStrategy}>
            <div className="mt-3 grid gap-4">
              {sectionsOrder.map((sectionId) => (
                <SortableBodySectionRow key={sectionId} id={sectionId}>
                  {bodySectionEditors[sectionId]}
                </SortableBodySectionRow>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </section>
  );
}
