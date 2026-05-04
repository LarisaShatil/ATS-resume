export type ResumeLanguage = "en" | "uk" | "ru";

export interface ResumeHeader {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  photoUrl?: string;
  linkedIn?: string;
  github?: string;
  portfolio?: string;
}

export interface ExperienceJob {
  /** Stable id for list rendering and reordering (optional for older saved drafts). */
  clientKey?: string;
  title: string;
  company: string;
  location: string;
  dates: string;
  highlights: string[];
}

/** One education block on the resume (ATS-safe plain lines on export). */
export interface EducationEntry {
  clientKey?: string;
  degree: string;
  institution: string;
  location: string;
  dates: string;
  coursework: string;
}

/** One spoken language line on the resume (name + CEFR-style level). */
export interface SpokenLanguageEntry {
  clientKey?: string;
  name: string;
  /** Canonical level key, e.g. native, c1, b2 (see language-levels). */
  level: string;
  /** True when the user chose “Other” and types a custom language name. */
  useCustomName?: boolean;
}

/** One project block on the resume (ATS-safe plain text on export). */
export interface ProjectEntry {
  clientKey?: string;
  name: string;
  description: string;
  tech: string[];
  link: string;
  bullets: string[];
}

/** One course or certification block (title line + optional bullet details). */
export interface CourseCertificationEntry {
  clientKey?: string;
  /** e.g. "IT Project Management, Projector Institute" */
  title: string;
  bullets: string[];
}

export interface ResumeSections {
  summary: string;
  skills: string[];
  experience: ExperienceJob[];
  projects: ProjectEntry[];
  education: EducationEntry[];
  languages: SpokenLanguageEntry[];
  certificates: CourseCertificationEntry[];
}

export type SkillsHeadingVariant = "skills" | "technicalSkills";

/** Identifiers for body sections below Professional Summary (order is user-controlled). */
export type ResumeBodySectionId =
  | "skills"
  | "experience"
  | "projects"
  | "education"
  | "languages"
  | "certificates";

export const ALL_RESUME_BODY_SECTION_IDS = [
  "skills",
  "experience",
  "projects",
  "education",
  "languages",
  "certificates",
] as const satisfies readonly ResumeBodySectionId[];

export function defaultResumeBodySectionsOrder(): ResumeBodySectionId[] {
  return [...ALL_RESUME_BODY_SECTION_IDS];
}

export interface ResumeDraft {
  language: ResumeLanguage;
  header: ResumeHeader;
  sourceText: string;
  jobDescription: string;
  sections: ResumeSections;
  /** Order of sections under Professional Summary in preview, PDF, and editor. */
  sectionsOrder: ResumeBodySectionId[];

  /** Controls the visible heading for the Skills section. */
  skillsHeadingVariant: SkillsHeadingVariant;

  showPhoto: boolean;
  showProjects: boolean;
  showCertificates: boolean;
  showLinkedIn: boolean;
  showGithub: boolean;
  showPortfolio: boolean;
}

export const STORAGE_KEY = "ats-resume-generator-draft-v1";

export const DEFAULT_DRAFT: ResumeDraft = {
  language: "en",
  header: {
    fullName: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    photoUrl: "",
    linkedIn: "",
    github: "",
    portfolio: "",
  },
  sourceText: "",
  jobDescription: "",
  sections: {
    summary: "",
    skills: [],
    experience: [],
    projects: [],
    education: [],
    languages: [],
    certificates: [],
  },
  skillsHeadingVariant: "skills",
  showPhoto: false,
  showProjects: true,
  showCertificates: true,
  showLinkedIn: true,
  showGithub: true,
  showPortfolio: true,
  sectionsOrder: defaultResumeBodySectionsOrder(),
};
