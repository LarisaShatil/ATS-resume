"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

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
import {
  LANGUAGE_LEVEL_DEFAULT,
  languageProficiencyOptions,
} from "@/lib/resume/language-levels";
import {
  isPresetSpokenLanguageName,
  SPOKEN_LANGUAGE_CUSTOM,
  spokenLanguageSelectOptions,
  spokenLanguageSelectValue,
} from "@/lib/resume/spoken-language-presets";
import type {
  CourseCertificationEntry,
  EducationEntry,
  ExperienceJob,
  ProjectEntry,
  ResumeBodySectionId,
  ResumeLanguage,
  ResumeSections,
  SkillsHeadingVariant,
  SpokenLanguageEntry,
} from "@/lib/resume/types";

import { ExperienceJobDatesField } from "./ExperienceJobDatesField";

/** Shared layout + styles for per-row “Add below” / “Remove” actions (jobs + languages). */
const ROW_ACTIONS_WRAP_CLASS = "mt-3 flex flex-wrap justify-end gap-2";
const ROW_ACTION_BTN_ADD_CLASS =
  "rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white";
const ROW_ACTION_BTN_REMOVE_CLASS =
  "rounded-md border border-rose-200 bg-white px-2.5 py-1 text-xs font-medium text-rose-700 shadow-sm hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

type Props = {
  labels: ResumeLabels;
  resumeLanguage: ResumeLanguage;
  sections: ResumeSections;
  sectionsOrder: ResumeBodySectionId[];
  skillsHeadingVariant: SkillsHeadingVariant;
  showProjects: boolean;
  showCertificates: boolean;
  onSectionsChange: (patch: Partial<ResumeSections>) => void;
  onSectionsOrderChange: (next: ResumeBodySectionId[]) => void;
  onDraftSettingsChange: (patch: { skillsHeadingVariant?: SkillsHeadingVariant }) => void;
  onVisibilityChange: (patch: {
    showProjects?: boolean;
    showCertificates?: boolean;
  }) => void;
  onActiveSectionChange?: (id: "summary" | ResumeBodySectionId) => void;
};

function arrayToLines(items: string[]): string {
  return items.join("\n");
}

function linesToArray(text: string): string[] {
  const lines = text.split(/\r?\n/g);
  return lines.filter((line, idx) => {
    // Keep the last line as-is so Enter/Space works naturally while typing.
    // Earlier empty lines are dropped to avoid accumulating blank bullets in state.
    if (idx === lines.length - 1) return true;
    return line.trim().length > 0;
  });
}

function TextArea({
  label,
  hint,
  value,
  onChange,
  rows,
  placeholder,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  rows: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      {label ? (
        <div className="text-xs font-medium text-slate-600">{label}</div>
      ) : null}
      {hint ? (
        <p className="mt-0.5 text-[11px] text-slate-500">{hint}</p>
      ) : null}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="mt-1 w-full resize-y rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-1 focus-visible:ring-offset-white"
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
  hint,
  onBlur,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  onBlur?: () => void;
}) {
  return (
    <label className="block">
      <div className="text-xs font-medium text-slate-600">{label}</div>
      {hint ? (
        <p className="mt-0.5 text-[11px] text-slate-500">{hint}</p>
      ) : null}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className="mt-1 h-7 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-1 focus-visible:ring-offset-white"
      />
    </label>
  );
}

/** Parse comma-separated tech line into trimmed, de-duplicated tokens (case-insensitive). */
function commaSeparatedToTechArray(raw: string): string[] {
  const parts = raw.split(",");
  const out: string[] = [];
  const seen = new Set<string>();
  for (const part of parts) {
    const t = part.replace(/\s+/g, " ").trim();
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

function ProjectTechCommaField({
  tech,
  labels,
  onSave,
}: {
  tech: string[];
  labels: Pick<ResumeLabels, "projectTech" | "projectTechAddHint">;
  onSave: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState(() => (tech ?? []).join(", "));

  return (
    <Field
      label={labels.projectTech}
      hint={labels.projectTechAddHint}
      value={draft}
      onChange={setDraft}
      onBlur={() => onSave(commaSeparatedToTechArray(draft))}
      placeholder="React, Vite, Node.js"
    />
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

function newEducation(): EducationEntry {
  return {
    clientKey: newExperienceJobClientKey(),
    degree: "",
    institution: "",
    location: "",
    dates: "",
    coursework: "",
  };
}

function newProject(): ProjectEntry {
  return {
    clientKey: newExperienceJobClientKey(),
    name: "",
    description: "",
    tech: [],
    link: "",
    bullets: [],
  };
}

function newCourse(): CourseCertificationEntry {
  return {
    clientKey: newExperienceJobClientKey(),
    title: "",
    bullets: [],
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
        "flex shrink-0 touch-none cursor-grab items-center justify-center self-start rounded-md border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
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
          placeholder="Start with a verb (Built, Developed, Improved, Automated)"
        />
      </div>

      <div className={ROW_ACTIONS_WRAP_CLASS}>
        <button
          type="button"
          onClick={() => addJobAfter(idx)}
          className={ROW_ACTION_BTN_ADD_CLASS}
        >
          Add below
        </button>
        <button
          type="button"
          onClick={() => removeJob(idx)}
          className={ROW_ACTION_BTN_REMOVE_CLASS}
        >
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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
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
      <div className="mt-3">
        <TextArea
          label={labels.educationCoursework}
          value={entry.coursework}
          onChange={(v) => patchEducation(idx, { coursework: v })}
          rows={2}
          placeholder="Course 1, Course 2, Course 3"
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

type SortableEducationRowProps = EducationRowFieldsProps & {
  sortableId: string;
};

function SortableEducationRow(props: SortableEducationRowProps) {
  const { sortableId, ...fieldProps } = props;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
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

type ProjectRowFieldsProps = {
  project: ProjectEntry;
  idx: number;
  labels: ResumeLabels;
  patchProject: (idx: number, patch: Partial<ProjectEntry>) => void;
  addProjectAfter: (idx: number) => void;
  removeProject: (idx: number) => void;
};

function ProjectFields({
  project,
  idx,
  labels,
  patchProject,
  addProjectAfter,
  removeProject,
}: ProjectRowFieldsProps) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label={labels.projectName}
          value={project.name}
          onChange={(v) => patchProject(idx, { name: v })}
          placeholder="ATS Resume Generator"
        />
        <Field
          label={labels.projectLink}
          value={project.link}
          onChange={(v) => patchProject(idx, { link: v })}
          placeholder="https://github.com/…"
        />
      </div>
      <div className="mt-3">
        <Field
          label={labels.projectDescription}
          value={project.description}
          onChange={(v) => patchProject(idx, { description: v })}
          placeholder="Internal tool that cut onboarding time by 30%."
        />
      </div>
      <div className="mt-3">
        <TextArea
          label={labels.projectBullets}
          value={arrayToLines(project.bullets ?? [])}
          onChange={(v) =>
            patchProject(idx, { bullets: linesToArray(v) })
          }
          rows={5}
          placeholder="Built…\nImproved…\nShipped…"
        />
      </div>
      <div className="mt-3">
        <ProjectTechCommaField
          key={`${idx}-${JSON.stringify(project.tech ?? [])}`}
          tech={project.tech ?? []}
          labels={labels}
          onSave={(next) => patchProject(idx, { tech: next })}
        />
      </div>
      <div className={ROW_ACTIONS_WRAP_CLASS}>
        <button
          type="button"
          onClick={() => addProjectAfter(idx)}
          className={ROW_ACTION_BTN_ADD_CLASS}
        >
          {labels.addProjectBelow}
        </button>
        <button
          type="button"
          onClick={() => removeProject(idx)}
          className={ROW_ACTION_BTN_REMOVE_CLASS}
        >
          {labels.removeProject}
        </button>
      </div>
    </>
  );
}

type SortableProjectRowProps = ProjectRowFieldsProps & {
  sortableId: string;
};

function SortableProjectRow(props: SortableProjectRowProps) {
  const { sortableId, ...fieldProps } = props;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
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
          <ProjectFields {...fieldProps} />
        </div>
        <DragGripHandle
          listeners={listeners}
          attributes={attributes}
          ariaLabel="Drag to reorder this project"
        />
      </div>
    </div>
  );
}

function StaticProjectRow(props: ProjectRowFieldsProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <ProjectFields {...props} />
    </div>
  );
}

type CourseRowFieldsProps = {
  course: CourseCertificationEntry;
  idx: number;
  labels: ResumeLabels;
  patchCourse: (idx: number, patch: Partial<CourseCertificationEntry>) => void;
  addCourseAfter: (idx: number) => void;
  removeCourse: (idx: number) => void;
};

function CourseFields({
  course,
  idx,
  labels,
  patchCourse,
  addCourseAfter,
  removeCourse,
}: CourseRowFieldsProps) {
  return (
    <>
      <Field
        label={labels.courseCertTitle}
        value={course.title}
        onChange={(v) => patchCourse(idx, { title: v })}
        placeholder="IT Project Management, Projector Institute"
      />
      <div className="mt-3">
        <TextArea
          label={labels.courseCertBullets}
          value={arrayToLines(course.bullets ?? [])}
          onChange={(v) => patchCourse(idx, { bullets: linesToArray(v) })}
          rows={4}
          placeholder={
            "Agile, Scrum, Waterfall methodologies\nRisk & stakeholder management"
          }
        />
      </div>
      <div className={ROW_ACTIONS_WRAP_CLASS}>
        <button
          type="button"
          onClick={() => addCourseAfter(idx)}
          className={ROW_ACTION_BTN_ADD_CLASS}
        >
          {labels.addCourseBelow}
        </button>
        <button
          type="button"
          onClick={() => removeCourse(idx)}
          className={ROW_ACTION_BTN_REMOVE_CLASS}
        >
          {labels.removeCourse}
        </button>
      </div>
    </>
  );
}

type SortableCourseRowProps = CourseRowFieldsProps & { sortableId: string };

function SortableCourseRow(props: SortableCourseRowProps) {
  const { sortableId, ...fieldProps } = props;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
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
          <CourseFields {...fieldProps} />
        </div>
        <DragGripHandle
          listeners={listeners}
          attributes={attributes}
          ariaLabel="Drag to reorder this course"
        />
      </div>
    </div>
  );
}

function StaticCourseRow(props: CourseRowFieldsProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <CourseFields {...props} />
    </div>
  );
}

function SortableBodySectionRow({
  id,
  children,
}: {
  id: ResumeBodySectionId;
  children: (dragHandle: ReactNode) => ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dragHandle = (
    <DragGripHandle
      listeners={listeners}
      attributes={attributes}
      title="Drag to reorder section"
      ariaLabel="Drag to reorder section"
      className="h-6 w-6"
    />
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        "rounded-lg transition-opacity",
        isDragging ? "z-10 opacity-80 ring-2 ring-indigo-400/50" : "",
      ].join(" ")}
    >
      {children(dragHandle)}
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
            className="h-7 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-1 focus-visible:ring-offset-white"
          >
            <option value="">{labels.languageSelectHint}</option>
            {spokenNameOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
            <option value={SPOKEN_LANGUAGE_CUSTOM}>
              {labels.languageOtherCustom}
            </option>
          </select>
          {showCustomName ? (
            <input
              type="text"
              value={row.name}
              onChange={(e) => patchLanguageRow(idx, { name: e.target.value })}
              placeholder={labels.languageCustomPlaceholder}
              className="mt-2 h-7 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-1 focus-visible:ring-offset-white"
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
            className="h-7 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-1 focus-visible:ring-offset-white"
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
        <button
          type="button"
          onClick={() => addLanguageAfter(idx)}
          className={ROW_ACTION_BTN_ADD_CLASS}
        >
          {labels.addLanguageBelow}
        </button>
        <button
          type="button"
          onClick={() => removeLanguageRow(idx)}
          className={ROW_ACTION_BTN_REMOVE_CLASS}
        >
          {labels.removeLanguage}
        </button>
      </div>
    </>
  );
}

type SortableLanguageRowProps = LanguageRowFieldsProps & { sortableId: string };

function SortableLanguageRow(props: SortableLanguageRowProps) {
  const { sortableId, ...fieldProps } = props;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
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
  skillsHeadingVariant,
  showProjects,
  showCertificates,
  onSectionsChange,
  onSectionsOrderChange,
  onDraftSettingsChange,
  onVisibilityChange,
  onActiveSectionChange,
}: Props) {
  const jobs = useMemo(() => sections.experience ?? [], [sections.experience]);
  const education = useMemo(
    () => sections.education ?? [],
    [sections.education],
  );
  const languages = useMemo(
    () => sections.languages ?? [],
    [sections.languages],
  );
  const projects = useMemo(
    () => sections.projects ?? [],
    [sections.projects],
  );
  const courses = useMemo(
    () => sections.certificates ?? [],
    [sections.certificates],
  );
  const proficiencyOptions = useMemo(
    () => languageProficiencyOptions(resumeLanguage),
    [resumeLanguage],
  );
  const spokenNameOptions = useMemo(
    () => spokenLanguageSelectOptions(resumeLanguage),
    [resumeLanguage],
  );
  const canReorderJobs = jobs.length > 1;
  const sortableReady =
    canReorderJobs &&
    jobs.every(
      (j) => typeof j.clientKey === "string" && j.clientKey.length > 0,
    );

  const canReorderEducation = education.length > 1;
  const sortableEducationReady =
    canReorderEducation &&
    education.every(
      (e) => typeof e.clientKey === "string" && e.clientKey.length > 0,
    );

  const canReorderLanguages = languages.length > 1;
  const sortableLanguagesReady =
    canReorderLanguages &&
    languages.every(
      (l) => typeof l.clientKey === "string" && l.clientKey.length > 0,
    );

  const canReorderProjects = projects.length > 1;
  const sortableProjectsReady =
    canReorderProjects &&
    projects.every(
      (p) => typeof p.clientKey === "string" && p.clientKey.length > 0,
    );

  const canReorderCourses = courses.length > 1;
  const sortableCoursesReady =
    canReorderCourses &&
    courses.every(
      (c) => typeof c.clientKey === "string" && c.clientKey.length > 0,
    );

  useEffect(() => {
    if (jobs.length === 0) return;
    if (jobs.every((j) => j.clientKey && j.clientKey.length > 0)) return;
    onSectionsChange({
      experience: jobs.map((j) => ({
        ...j,
        clientKey:
          j.clientKey && j.clientKey.length > 0
            ? j.clientKey
            : newExperienceJobClientKey(),
      })),
    });
  }, [jobs, onSectionsChange]);

  useEffect(() => {
    if (languages.length === 0) return;
    if (languages.every((l) => l.clientKey && l.clientKey.length > 0)) return;
    onSectionsChange({
      languages: languages.map((row) => ({
        ...row,
        clientKey:
          row.clientKey && row.clientKey.length > 0
            ? row.clientKey
            : newExperienceJobClientKey(),
      })),
    });
  }, [languages, onSectionsChange]);

  useEffect(() => {
    if (education.length === 0) return;
    if (education.every((e) => e.clientKey && e.clientKey.length > 0)) return;
    onSectionsChange({
      education: education.map((e) => ({
        ...e,
        clientKey:
          e.clientKey && e.clientKey.length > 0
            ? e.clientKey
            : newExperienceJobClientKey(),
      })),
    });
  }, [education, onSectionsChange]);

  useEffect(() => {
    if (projects.length === 0) return;
    if (projects.every((p) => p.clientKey && p.clientKey.length > 0)) return;
    onSectionsChange({
      projects: projects.map((p) => ({
        ...p,
        clientKey:
          p.clientKey && p.clientKey.length > 0
            ? p.clientKey
            : newExperienceJobClientKey(),
      })),
    });
  }, [projects, onSectionsChange]);

  useEffect(() => {
    if (courses.length === 0) return;
    if (courses.every((c) => c.clientKey && c.clientKey.length > 0)) return;
    onSectionsChange({
      certificates: courses.map((c) => ({
        ...c,
        clientKey:
          c.clientKey && c.clientKey.length > 0
            ? c.clientKey
            : newExperienceJobClientKey(),
      })),
    });
  }, [courses, onSectionsChange]);

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

  const projectSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 6 },
    }),
  );

  const courseSensors = useSensors(
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
    const next = jobs.map((j, i) => (i === idx ? { ...j, ...patch } : j));
    onSectionsChange({ experience: next });
  }

  function removeJob(idx: number) {
    const next = jobs.filter((_, i) => i !== idx);
    onSectionsChange({ experience: next });
  }

  function addJobAfter(idx: number) {
    const next = [...jobs.slice(0, idx + 1), newJob(), ...jobs.slice(idx + 1)];
    onSectionsChange({ experience: next });
  }

  function patchEducation(idx: number, patch: Partial<EducationEntry>) {
    const next = education.map((e, i) => (i === idx ? { ...e, ...patch } : e));
    onSectionsChange({ education: next });
  }

  function removeEducation(idx: number) {
    const next = education.filter((_, i) => i !== idx);
    onSectionsChange({ education: next });
  }

  function addEducationAfter(idx: number) {
    const next = [
      ...education.slice(0, idx + 1),
      newEducation(),
      ...education.slice(idx + 1),
    ];
    onSectionsChange({ education: next });
  }

  function patchLanguageRow(idx: number, patch: Partial<SpokenLanguageEntry>) {
    const next = languages.map((row, i) =>
      i === idx ? { ...row, ...patch } : row,
    );
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
      languages: [
        ...languages.slice(0, idx + 1),
        row,
        ...languages.slice(idx + 1),
      ],
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

  function patchProject(idx: number, patch: Partial<ProjectEntry>) {
    const next = projects.map((p, i) => (i === idx ? { ...p, ...patch } : p));
    onSectionsChange({ projects: next });
  }

  function removeProject(idx: number) {
    const next = projects.filter((_, i) => i !== idx);
    onSectionsChange({ projects: next });
  }

  function addProjectAfter(idx: number) {
    const next = [
      ...projects.slice(0, idx + 1),
      newProject(),
      ...projects.slice(idx + 1),
    ];
    onSectionsChange({ projects: next });
  }

  function onProjectDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = projects.findIndex((p) => p.clientKey === active.id);
    const newIndex = projects.findIndex((p) => p.clientKey === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onSectionsChange({ projects: arrayMove(projects, oldIndex, newIndex) });
  }

  function patchCourse(idx: number, patch: Partial<CourseCertificationEntry>) {
    const next = courses.map((c, i) => (i === idx ? { ...c, ...patch } : c));
    onSectionsChange({ certificates: next });
  }

  function removeCourse(idx: number) {
    const next = courses.filter((_, i) => i !== idx);
    onSectionsChange({ certificates: next });
  }

  function addCourseAfter(idx: number) {
    const next = [
      ...courses.slice(0, idx + 1),
      newCourse(),
      ...courses.slice(idx + 1),
    ];
    onSectionsChange({ certificates: next });
  }

  function onCourseDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = courses.findIndex((c) => c.clientKey === active.id);
    const newIndex = courses.findIndex((c) => c.clientKey === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onSectionsChange({ certificates: arrayMove(courses, oldIndex, newIndex) });
  }

  function onSectionDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sectionsOrder.findIndex((s) => s === active.id);
    const newIndex = sectionsOrder.findIndex((s) => s === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onSectionsOrderChange(arrayMove(sectionsOrder, oldIndex, newIndex));
  }

  const skillsEditor = (dragHandle: ReactNode) => (
    <div
      className="rounded-xl border border-slate-200 bg-slate-50/40 p-3"
      onFocusCapture={() => onActiveSectionChange?.("skills")}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5">
          {dragHandle}
          <div className="text-xs font-medium text-slate-600">
            {skillsHeadingVariant === "technicalSkills"
              ? labels.technicalSkills
              : labels.skills}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700">
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="skills-heading"
              value="skills"
              checked={skillsHeadingVariant === "skills"}
              onChange={() =>
                onDraftSettingsChange({ skillsHeadingVariant: "skills" })
              }
              className="h-4 w-4 accent-indigo-600"
            />
            <span>{labels.skills}</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="skills-heading"
              value="technicalSkills"
              checked={skillsHeadingVariant === "technicalSkills"}
              onChange={() =>
                onDraftSettingsChange({
                  skillsHeadingVariant: "technicalSkills",
                })
              }
              className="h-4 w-4 accent-indigo-600"
            />
            <span>{labels.technicalSkills}</span>
          </label>
        </div>
      </div>
      <div className="mt-2">
        <TextArea
          label=""
          value={arrayToLines(sections.skills)}
          onChange={(v) => onSectionsChange({ skills: linesToArray(v) })}
          rows={5}
          placeholder={
            "Backend: Node.js, Express, Deno\nTesting: Jest, Vitest,"
          }
        />
      </div>
    </div>
  );

  const experienceEditor = (dragHandle: ReactNode) => (
    <div
      className="rounded-xl border border-slate-200 bg-slate-50/40 p-3"
      onFocusCapture={() => onActiveSectionChange?.("experience")}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5">
          {dragHandle}
          <div className="text-xs font-medium text-slate-600">
            {labels.experience}
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            onSectionsChange({
              experience: [...jobs, newJob()],
            })
          }
          className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          Add job
        </button>
      </div>

      <div className="mt-2 grid gap-3">
        {jobs.length ? (
          sortableReady ? (
            <DndContext
              sensors={jobSensors}
              collisionDetection={closestCenter}
              onDragEnd={onJobDragEnd}
            >
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
            jobs.map((job, idx) => (
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
          )
        ) : null}
      </div>
    </div>
  );

  const projectsEditor = (dragHandle: ReactNode) => (
    <div
      className="rounded-xl border border-slate-200 bg-slate-50/40 p-3"
      onFocusCapture={() => onActiveSectionChange?.("projects")}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5">
          {dragHandle}
          <div className="text-xs font-medium text-slate-600">
            {labels.projects}
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            onSectionsChange({
              projects: [...projects, newProject()],
            })
          }
          className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          {labels.addProject}
        </button>
      </div>

      <div className="mt-2 grid gap-3">
        {projects.length ? (
          sortableProjectsReady ? (
            <DndContext
              sensors={projectSensors}
              collisionDetection={closestCenter}
              onDragEnd={onProjectDragEnd}
            >
              <SortableContext
                items={projects.map((p) => p.clientKey!)}
                strategy={verticalListSortingStrategy}
              >
                {projects.map((project, idx) => (
                  <SortableProjectRow
                    key={project.clientKey}
                    sortableId={project.clientKey!}
                    project={project}
                    idx={idx}
                    labels={labels}
                    patchProject={patchProject}
                    addProjectAfter={addProjectAfter}
                    removeProject={removeProject}
                  />
                ))}
              </SortableContext>
            </DndContext>
          ) : (
            projects.map((project, idx) => (
              <StaticProjectRow
                key={project.clientKey ?? `project-${idx}`}
                project={project}
                idx={idx}
                labels={labels}
                patchProject={patchProject}
                addProjectAfter={addProjectAfter}
                removeProject={removeProject}
              />
            ))
          )
        ) : null}
      </div>
    </div>
  );

  const educationEditor = (dragHandle: ReactNode) => (
    <div
      className="rounded-xl border border-slate-200 bg-slate-50/40 p-3"
      onFocusCapture={() => onActiveSectionChange?.("education")}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5">
          {dragHandle}
          <div className="text-xs font-medium text-slate-600">
            {labels.education}
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            onSectionsChange({
              education: [...education, newEducation()],
            })
          }
          className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          {labels.addEducation}
        </button>
      </div>
      {education.length ? (
        <p className="mt-2 text-xs text-slate-500">{labels.educationOrderHint}</p>
      ) : null}

      <div className="mt-2 grid gap-3">
        {education.length ? (
          sortableEducationReady ? (
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
            education.map((entry, idx) => (
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
          )
        ) : null}
      </div>
    </div>
  );

  const languagesEditor = (dragHandle: ReactNode) => (
    <div
      className="rounded-xl border border-slate-200 bg-slate-50/40 p-3"
      onFocusCapture={() => onActiveSectionChange?.("languages")}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5">
          {dragHandle}
          <div className="text-xs font-medium text-slate-600">
            {labels.languages}
          </div>
        </div>
        <button
          type="button"
          onClick={() => addLanguageRow()}
          className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          {labels.addLanguage}
        </button>
      </div>
      <div className="mt-2 space-y-2.5">
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

  const certificatesEditor = (dragHandle: ReactNode) => (
    <div
      className="rounded-xl border border-slate-200 bg-slate-50/40 p-3"
      onFocusCapture={() => onActiveSectionChange?.("certificates")}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5">
          {dragHandle}
          <div className="text-xs font-medium text-slate-600">
            {labels.certificates}
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            onSectionsChange({
              certificates: [...courses, newCourse()],
            })
          }
          className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          {labels.addCourse}
        </button>
      </div>

      <div className="mt-2 grid gap-3">
        {courses.length ? (
          sortableCoursesReady ? (
            <DndContext
              sensors={courseSensors}
              collisionDetection={closestCenter}
              onDragEnd={onCourseDragEnd}
            >
              <SortableContext
                items={courses.map((c) => c.clientKey!)}
                strategy={verticalListSortingStrategy}
              >
                {courses.map((course, idx) => (
                  <SortableCourseRow
                    key={course.clientKey}
                    sortableId={course.clientKey!}
                    course={course}
                    idx={idx}
                    labels={labels}
                    patchCourse={patchCourse}
                    addCourseAfter={addCourseAfter}
                    removeCourse={removeCourse}
                  />
                ))}
              </SortableContext>
            </DndContext>
          ) : (
            courses.map((course, idx) => (
              <StaticCourseRow
                key={course.clientKey ?? `course-${idx}`}
                course={course}
                idx={idx}
                labels={labels}
                patchCourse={patchCourse}
                addCourseAfter={addCourseAfter}
                removeCourse={removeCourse}
              />
            ))
          )
        ) : null}
      </div>
    </div>
  );

  const bodySectionEditors: Record<
    ResumeBodySectionId,
    (dragHandle: ReactNode) => ReactNode
  > = {
    skills: skillsEditor,
    experience: experienceEditor,
    projects: projectsEditor,
    education: educationEditor,
    languages: languagesEditor,
    certificates: certificatesEditor,
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white py-5 pr-5 pl-4 shadow-sm sm:py-6 sm:pr-6 sm:pl-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 text-slate-400"
            aria-hidden="true"
          >
            <path d="M8 6h13" />
            <path d="M8 12h13" />
            <path d="M8 18h13" />
            <path d="M3 6h.01" />
            <path d="M3 12h.01" />
            <path d="M3 18h.01" />
          </svg>
          <span>{labels.sections}</span>
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
        <div onFocusCapture={() => onActiveSectionChange?.("summary")}>
          <TextArea
            label={labels.summary}
            value={sections.summary}
            onChange={(v) => onSectionsChange({ summary: v })}
            rows={4}
            placeholder="2–4 sentences describing your strengths and impact."
          />
        </div>
        <DndContext
          sensors={sectionSensors}
          collisionDetection={closestCenter}
          onDragEnd={onSectionDragEnd}
        >
          <SortableContext
            items={sectionsOrder}
            strategy={verticalListSortingStrategy}
          >
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
