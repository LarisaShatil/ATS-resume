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
  honors: string;
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

export interface ResumeSections {
  summary: string;
  skills: string[];
  experience: ExperienceJob[];
  projects: string[];
  education: EducationEntry[];
  languages: SpokenLanguageEntry[];
  certificates: string[];
}

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
  showPhoto: false,
  showProjects: true,
  showCertificates: true,
  showLinkedIn: true,
  showGithub: true,
  showPortfolio: true,
  sectionsOrder: defaultResumeBodySectionsOrder(),
};

