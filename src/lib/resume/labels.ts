import type { ResumeLanguage } from "./types";

export type ResumeLabels = {
  appTitle: string;
  header: string;
  source: string;
  sections: string;
  preview: string;
  previewPdfUpdating: string;
  previewPdfError: string;
  previewPdfHint: string;
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

  importJsonFile: string;
  importJsonPaste: string;
  importJsonPastePlaceholder: string;
  importJsonApply: string;
  importJsonInvalid: string;
  importJsonSuccess: string;

  summary: string;
  skills: string;
  technicalSkills: string;
  experience: string;
  projects: string;
  education: string;
  educationDegree: string;
  educationInstitution: string;
  educationLocation: string;
  educationCoursework: string;
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
  courseCertTitle: string;
  courseCertBullets: string;
  addCourse: string;
  addCourseBelow: string;
  removeCourse: string;
  /** Hint for drag-reordering body sections below Professional Summary. */
  sectionReorderHint: string;

  projectName: string;
  projectDescription: string;
  projectPhotoUrl: string;
  projectTech: string;
  projectLink: string;
  projectBullets: string;
  addProject: string;
  addProjectBelow: string;
  removeProject: string;
  projectTechAddHint: string;
  /** Plain prefix before comma-separated tech in preview/PDF (e.g. "Tech Stack:"). */
  projectTechInlineLabel: string;
};

export const LABELS: Record<ResumeLanguage, ResumeLabels> = {
  en: {
    appTitle: "ATS Resume",
    header: "Header",
    source: "Source text",
    sections: "Sections",
    preview: "Preview",
    previewPdfUpdating: "Updating PDF preview…",
    previewPdfError: "Could not generate PDF preview.",
    previewPdfHint:
      "Same layout as the downloaded PDF, including page breaks and page numbers.",
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
    showCertificates: "Show Courses & Certifications",

    sourceText: "Full career text / master profile",
    jobDescription: "Vacancy description",

    importJsonFile: "Import from JSON file",
    importJsonPaste: "Or paste draft JSON",
    importJsonPastePlaceholder:
      'Paste JSON here (example: {"language":"en","header":{...},"sections":{...}})',
    importJsonApply: "Apply import",
    importJsonInvalid: "Invalid JSON file/content.",
    importJsonSuccess: "Imported draft from JSON.",

    summary: "Professional Summary",
    skills: "Skills",
    technicalSkills: "Technical Skills",
    experience: "Work Experience",
    projects: "Projects",
    education: "Education",
    educationDegree: "Degree / Program",
    educationInstitution: "Institution",
    educationLocation: "Location",
    educationCoursework: "Courses",
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
    certificates: "Courses & Certifications",
    courseCertTitle: "Course or certification",
    courseCertBullets: "Details (optional, one per line)",
    addCourse: "Add course",
    addCourseBelow: "Add below",
    removeCourse: "Remove",
    sectionReorderHint:
      "Drag the handle on the left to reorder sections on your resume.",

    projectName: "Project name",
    projectDescription: "Short description (one line)",
    projectPhotoUrl: "Project photo (optional, recruiter PDF only)",
    projectTech: "Tech stack",
    projectLink: "Link (optional)",
    projectBullets: "Bullets (one per line)",
    addProject: "Add project",
    addProjectBelow: "Add below",
    removeProject: "Remove",
    projectTechAddHint: "Comma-separated list (matches PDF export).",
    projectTechInlineLabel: "Tech Stack:",
  },
  uk: {
    appTitle: "ATS Резюме",
    header: "Заголовок",
    source: "Вихідний текст",
    sections: "Розділи",
    preview: "Попередній перегляд",
    previewPdfUpdating: "Оновлення перегляду PDF…",
    previewPdfError: "Не вдалося згенерувати перегляд PDF.",
    previewPdfHint:
      "Той самий вигляд, що й у завантаженому PDF: розриви сторінок і номери сторінок.",
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
    showCertificates: "Показувати курси та сертифікати",

    sourceText: "Повний текст кар’єри / майстер-профіль",
    jobDescription: "Опис вакансії",

    importJsonFile: "Імпортувати з JSON-файлу",
    importJsonPaste: "Або вставте JSON чернетки",
    importJsonPastePlaceholder:
      'Вставте JSON тут (приклад: {"language":"uk","header":{...},"sections":{...}})',
    importJsonApply: "Застосувати імпорт",
    importJsonInvalid: "Некоректний JSON-файл/вміст.",
    importJsonSuccess: "Чернетку імпортовано з JSON.",

    summary: "Професійний профіль",
    skills: "Навички",
    technicalSkills: "Технічні навички",
    experience: "Досвід роботи",
    projects: "Проєкти",
    education: "Освіта",
    educationDegree: "Ступінь / Програма",
    educationInstitution: "Заклад освіти",
    educationLocation: "Локація",
    educationCoursework: "Релевантні курси",
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
    certificates: "Курси та сертифікати",
    courseCertTitle: "Курс або сертифікація",
    courseCertBullets: "Деталі (необов’язково, по одному на рядок)",
    addCourse: "Додати курс",
    addCourseBelow: "Додати нижче",
    removeCourse: "Прибрати",
    sectionReorderHint:
      "Перетягніть ручку зліва, щоб змінити порядок розділів у резюме.",

    projectName: "Назва проєкту",
    projectDescription: "Короткий опис (один рядок)",
    projectPhotoUrl: "Фото проєкту (необов’язково, лише для recruiter PDF)",
    projectTech: "Технології",
    projectLink: "Посилання (необов’язково)",
    projectBullets: "Пункти (по одному на рядок)",
    addProject: "Додати проєкт",
    addProjectBelow: "Додати нижче",
    removeProject: "Прибрати",
    projectTechAddHint: "Список через кому (як у PDF).",
    projectTechInlineLabel: "Стек технологій:",
  },
  ru: {
    appTitle: "ATS Резюме",
    header: "Шапка",
    source: "Исходный текст",
    sections: "Разделы",
    preview: "Предпросмотр",
    previewPdfUpdating: "Обновление предпросмотра PDF…",
    previewPdfError: "Не удалось сформировать предпросмотр PDF.",
    previewPdfHint:
      "Такой же вид, как в скачанном PDF: разрывы страниц и номера страниц.",
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
    showCertificates: "Показывать курсы и сертификаты",

    sourceText: "Полный текст карьеры / мастер-профиль",
    jobDescription: "Описание вакансии",

    importJsonFile: "Импортировать из JSON-файла",
    importJsonPaste: "Или вставьте JSON черновика",
    importJsonPastePlaceholder:
      'Вставьте JSON сюда (пример: {"language":"ru","header":{...},"sections":{...}})',
    importJsonApply: "Применить импорт",
    importJsonInvalid: "Некорректный JSON-файл/содержимое.",
    importJsonSuccess: "Черновик импортирован из JSON.",

    summary: "Профессиональный профиль",
    skills: "Навыки",
    technicalSkills: "Технические навыки",
    experience: "Опыт работы",
    projects: "Проекты",
    education: "Образование",
    educationDegree: "Степень / Программа",
    educationInstitution: "Учебное заведение",
    educationLocation: "Локация",
    educationCoursework: "Релевантные курсы",
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
    certificates: "Курсы и сертификаты",
    courseCertTitle: "Курс или сертификат",
    courseCertBullets: "Детали (необязательно, по одному на строку)",
    addCourse: "Добавить курс",
    addCourseBelow: "Добавить ниже",
    removeCourse: "Удалить",
    sectionReorderHint:
      "Перетащите маркер слева, чтобы изменить порядок разделов в резюме.",

    projectName: "Название проекта",
    projectDescription: "Краткое описание (одна строка)",
    projectPhotoUrl: "Фото проекта (необязательно, только для recruiter PDF)",
    projectTech: "Стек технологий",
    projectLink: "Ссылка (необязательно)",
    projectBullets: "Пункты (по одному на строку)",
    addProject: "Добавить проект",
    addProjectBelow: "Добавить ниже",
    removeProject: "Удалить",
    projectTechAddHint: "Список через запятую (как в PDF).",
    projectTechInlineLabel: "Стек технологий:",
  },
};

export function getLabels(language: ResumeLanguage): ResumeLabels {
  return LABELS[language] ?? LABELS.en;
}
