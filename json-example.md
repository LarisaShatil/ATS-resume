# JSON example (paste into the app textarea)

The JSON import textarea expects a **`ResumeDraft`** object shape. You can paste **partial JSON** too, but this file shows the **full structure** with all fields.

## Full `ResumeDraft` example

```json
{
  "language": "en",
  "header": {
    "fullName": "Larisa Shatillo",
    "title": "Frontend Developer",
    "email": "larysa@example.com",
    "phone": "+1 555 000 0000",
    "location": "Kyiv, Ukraine",
    "photoUrl": "",
    "linkedIn": "https://www.linkedin.com/in/your-handle",
    "github": "https://github.com/your-handle",
    "portfolio": "https://your-portfolio.example"
  },
  "sourceText": "Optional: your master profile / raw career text (not required for JSON-based draft).",
  "jobDescription": "Optional: vacancy / JD text.",
  "sections": {
    "summary": "3–4 lines, keyword-rich, ATS-friendly summary.",
    "skills": [
      "JavaScript (ES202x)",
      "TypeScript",
      "React",
      "Next.js",
      "HTML",
      "CSS",
      "Tailwind CSS"
    ],
    "experience": [
      {
        "clientKey": "exp_1",
        "title": "Frontend Developer",
        "company": "Company Name",
        "location": "City, Country",
        "dates": "Jan 2023 – Present",
        "highlights": [
          "Built reusable UI components, reducing delivery time by 20%.",
          "Improved Core Web Vitals (LCP) from 3.2s to 1.8s."
        ]
      }
    ],
    "projects": [
      {
        "clientKey": "proj_1",
        "name": "Project Name",
        "description": "One-line ATS-friendly description.",
        "photoUrl": "",
        "tech": ["React", "TypeScript", "Next.js"],
        "link": "https://github.com/your-handle/project",
        "bullets": [
          "Implemented feature X, improving Y by Z%.",
          "Added automated tests, reducing regressions."
        ]
      }
    ],
    "education": [
      {
        "clientKey": "edu_1",
        "degree": "BSc in Computer Science",
        "institution": "University Name",
        "location": "City, Country",
        "dates": "2018 – 2022",
        "coursework": "Algorithms, Data Structures, Web Development"
      }
    ],
    "languages": [
      {
        "clientKey": "lang_1",
        "name": "English",
        "level": "c1",
        "useCustomName": false
      },
      {
        "clientKey": "lang_2",
        "name": "Ukrainian",
        "level": "native",
        "useCustomName": false
      }
    ],
    "certificates": [
      {
        "clientKey": "cert_1",
        "title": "Course / Certification Title",
        "bullets": ["Issuer: Example Academy", "Year: 2025"]
      }
    ]
  },
  "sectionsOrder": [
    "skills",
    "experience",
    "projects",
    "education",
    "languages",
    "certificates"
  ],
  "skillsHeadingVariant": "skills",
  "showPhoto": false,
  "showProjects": true,
  "showCertificates": true,
  "showLinkedIn": true,
  "showGithub": true,
  "showPortfolio": true
}
```

## Notes

- **`clientKey`** values can be any unique strings (or omitted); the app will generate them if missing.
- **`language`** must be `"en"`, `"uk"`, or `"ru"`; otherwise the app falls back to the default.
- **`sections.skills`** must be a JSON array of strings (not a single comma-separated string).

