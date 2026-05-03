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
  educationDegree: string;
  educationInstitution: string;
  educationLocation: string;
  educationCoursework: string;
  educationHonors: string;
  addEducation: string;
  addEducationBelow: string;
  removeEducation: string;
  educationOrderHint: string;
  languages: string;
  languageName: string;
  languageProficiency: string;
  languageChooseFromList: string;
  languageSelectHint: string;
  languageOtherCustom: string;
  languageCustomPlaceholder: string;
  addLanguage: string;
  /** Insert a language row after the current card (same idea as job “Add below”). */
  addLanguageBelow: string;
  removeLanguage: string;
  certificates: string;
  /** Hint for drag-reordering body sections below Professional Summary. */
  sectionReorderHint: string;
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
    contacts: "Contact Information",

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

    summary: "Professional Summary",
    skills: "Skills",
    experience: "Work Experience",
    projects: "Projects",
    education: "Education",
    educationDegree: "Degree / Program",
    educationInstitution: "Institution",
    educationLocation: "Location",
    educationCoursework: "Relevant coursework",
    educationHonors: "Honors / Awards",
    addEducation: "Add education",
    addEducationBelow: "Add below",
    removeEducation: "Remove",
    educationOrderHint: "Order: most recent first (drag to reorder).",
    languages: "Languages",
    languageName: "Language",
    languageProficiency: "Proficiency",
    languageChooseFromList: "Language",
    languageSelectHint: "Select language…",
    languageOtherCustom: "Other (type below)",
    languageCustomPlaceholder: "e.g. Catalan, Persian…",
    addLanguage: "Add language",
    addLanguageBelow: "Add below",
    removeLanguage: "Remove",
    certificates: "Certificates",
    sectionReorderHint:
      "Drag the handle on the left to reorder sections on your resume.",
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
    contacts: "Контактна інформація",

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

    summary: "Професійний профіль",
    skills: "Навички",
    experience: "Досвід роботи",
    projects: "Проєкти",
    education: "Освіта",
    educationDegree: "Ступінь / Програма",
    educationInstitution: "Заклад освіти",
    educationLocation: "Локація",
    educationCoursework: "Релевантні курси",
    educationHonors: "Відзнаки / Нагороди",
    addEducation: "Додати освіту",
    addEducationBelow: "Додати нижче",
    removeEducation: "Прибрати",
    educationOrderHint: "Порядок: спочатку новіше (перетягніть, щоб змінити).",
    languages: "Мови",
    languageName: "Мова",
    languageProficiency: "Рівень",
    languageChooseFromList: "Мова",
    languageSelectHint: "Оберіть мову…",
    languageOtherCustom: "Інша (введіть нижче)",
    languageCustomPlaceholder: "наприклад, каталанська, перська…",
    addLanguage: "Додати мову",
    addLanguageBelow: "Додати нижче",
    removeLanguage: "Прибрати",
    certificates: "Сертифікати",
    sectionReorderHint:
      "Перетягніть ручку зліва, щоб змінити порядок розділів у резюме.",
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
    contacts: "Контактная информация",

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

    summary: "Профессиональный профиль",
    skills: "Навыки",
    experience: "Опыт работы",
    projects: "Проекты",
    education: "Образование",
    educationDegree: "Степень / Программа",
    educationInstitution: "Учебное заведение",
    educationLocation: "Локация",
    educationCoursework: "Релевантные курсы",
    educationHonors: "Награды / Отличия",
    addEducation: "Добавить образование",
    addEducationBelow: "Добавить ниже",
    removeEducation: "Удалить",
    educationOrderHint: "Порядок: сначала новее (перетащите, чтобы изменить).",
    languages: "Языки",
    languageName: "Язык",
    languageProficiency: "Уровень",
    languageChooseFromList: "Язык",
    languageSelectHint: "Выберите язык…",
    languageOtherCustom: "Другой (введите ниже)",
    languageCustomPlaceholder: "например, каталанский, персидский…",
    addLanguage: "Добавить язык",
    addLanguageBelow: "Добавить ниже",
    removeLanguage: "Удалить",
    certificates: "Сертификаты",
    sectionReorderHint:
      "Перетащите маркер слева, чтобы изменить порядок разделов в резюме.",
  },
};

export function getLabels(language: ResumeLanguage): ResumeLabels {
  return LABELS[language] ?? LABELS.en;
}

