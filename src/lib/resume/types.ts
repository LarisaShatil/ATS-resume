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
  title: string;
  company: string;
  location: string;
  dates: string;
  highlights: string[];
}

export interface ResumeSections {
  summary: string;
  skills: string[];
  experience: ExperienceJob[];
  projects: string[];
  education: string[];
  certificates: string[];
}

export interface ResumeDraft {
  language: ResumeLanguage;
  header: ResumeHeader;
  sourceText: string;
  jobDescription: string;
  sections: ResumeSections;

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
    certificates: [],
  },
  showPhoto: false,
  showProjects: true,
  showCertificates: true,
  showLinkedIn: true,
  showGithub: true,
  showPortfolio: true,
};

