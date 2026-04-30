import type { ResumeLanguage } from "./types";

export type ResumeLabels = {
  appTitle: string;
  header: string;
  source: string;
  sections: string;
  preview: string;
  resetDraft: string;
  generateFromText: string;
  downloadPdf: string;
  contacts: string;

  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  photoUrl: string;
  linkedInUrl: string;
  githubUrl: string;
  portfolioUrl: string;

  showPhoto: string;
  showLinkedIn: string;
  showGithub: string;
  showPortfolio: string;
  showProjects: string;
  showCertificates: string;

  sourceText: string;
  jobDescription: string;

  summary: string;
  skills: string;
  experience: string;
  projects: string;
  education: string;
  certificates: string;
};

export const LABELS: Record<ResumeLanguage, ResumeLabels> = {
  en: {
    appTitle: "ATS Resume Generator",
    header: "Header",
    source: "Source text",
    sections: "Sections",
    preview: "Preview",
    resetDraft: "Reset draft",
    generateFromText: "Generate sections from text",
    downloadPdf: "Download PDF",
    contacts: "Contacts",

    fullName: "Full name",
    title: "Professional title",
    email: "Email",
    phone: "Phone",
    location: "Location",
    photoUrl: "Photo URL",
    linkedInUrl: "LinkedIn URL",
    githubUrl: "GitHub URL",
    portfolioUrl: "Portfolio URL",

    showPhoto: "Show photo",
    showLinkedIn: "Show LinkedIn",
    showGithub: "Show GitHub",
    showPortfolio: "Show Portfolio",
    showProjects: "Show Projects",
    showCertificates: "Show Certificates",

    sourceText: "Full career text / master profile",
    jobDescription: "Vacancy description",

    summary: "Summary",
    skills: "Skills",
    experience: "Work Experience",
    projects: "Projects",
    education: "Education",
    certificates: "Certificates",
  },
  uk: {
    appTitle: "ATS Генератор Резюме",
    header: "Заголовок",
    source: "Вихідний текст",
    sections: "Розділи",
    preview: "Попередній перегляд",
    resetDraft: "Скинути чернетку",
    generateFromText: "Згенерувати розділи з тексту",
    downloadPdf: "Завантажити PDF",
    contacts: "Контакти",

    fullName: "ПІБ",
    title: "Професійна назва посади",
    email: "Email",
    phone: "Телефон",
    location: "Локація",
    photoUrl: "URL фото",
    linkedInUrl: "URL LinkedIn",
    githubUrl: "URL GitHub",
    portfolioUrl: "URL портфоліо",

    showPhoto: "Показувати фото",
    showLinkedIn: "Показувати LinkedIn",
    showGithub: "Показувати GitHub",
    showPortfolio: "Показувати портфоліо",
    showProjects: "Показувати проєкти",
    showCertificates: "Показувати сертифікати",

    sourceText: "Повний текст кар’єри / майстер-профіль",
    jobDescription: "Опис вакансії",

    summary: "Резюме",
    skills: "Навички",
    experience: "Досвід роботи",
    projects: "Проєкти",
    education: "Освіта",
    certificates: "Сертифікати",
  },
  ru: {
    appTitle: "ATS Генератор Резюме",
    header: "Шапка",
    source: "Исходный текст",
    sections: "Разделы",
    preview: "Предпросмотр",
    resetDraft: "Сбросить черновик",
    generateFromText: "Сгенерировать разделы из текста",
    downloadPdf: "Скачать PDF",
    contacts: "Контакты",

    fullName: "ФИО",
    title: "Профессиональная роль",
    email: "Email",
    phone: "Телефон",
    location: "Локация",
    photoUrl: "URL фото",
    linkedInUrl: "URL LinkedIn",
    githubUrl: "URL GitHub",
    portfolioUrl: "URL портфолио",

    showPhoto: "Показывать фото",
    showLinkedIn: "Показывать LinkedIn",
    showGithub: "Показывать GitHub",
    showPortfolio: "Показывать портфолио",
    showProjects: "Показывать проекты",
    showCertificates: "Показывать сертификаты",

    sourceText: "Полный текст карьеры / мастер-профиль",
    jobDescription: "Описание вакансии",

    summary: "О себе",
    skills: "Навыки",
    experience: "Опыт работы",
    projects: "Проекты",
    education: "Образование",
    certificates: "Сертификаты",
  },
};

export function getLabels(language: ResumeLanguage): ResumeLabels {
  return LABELS[language] ?? LABELS.en;
}

