import type { ResumeSections } from "./types";

const SKILL_KEYWORDS = [
  "javascript",
  "typescript",
  "react",
  "next",
  "node",
  "express",
  "nestjs",
  "graphql",
  "rest",
  "sql",
  "postgres",
  "mysql",
  "mongodb",
  "redis",
  "docker",
  "kubernetes",
  "aws",
  "azure",
  "gcp",
  "ci/cd",
  "git",
  "jest",
  "cypress",
  "playwright",
  "python",
  "java",
  "c#",
  "go",
  "php",
  "html",
  "css",
  "tailwind",
];

const ROLE_KEYWORDS =
  /(engineer|developer|software|frontend|back(?:\s|-)?end|full(?:\s|-)?stack|lead|manager|architect|analyst|qa|sre|devops)/i;

const YEAR_PATTERN =
  /\b(19|20)\d{2}\b(?:\s*[-–—]\s*(?:\b(19|20)\d{2}\b|present|now|current))?/i;

const PROJECT_PATTERN =
  /\b(project|built|developed|created|implemented|launched|shipped)\b/i;

const EDUCATION_PATTERN =
  /\b(education|degree|university|school|bachelor|master|phd|course)\b/i;

const CERT_PATTERN =
  /\b(certificate|certification|certified)\b/i;

function normalizeLine(line: string): string {
  return line.replace(/\s+/g, " ").trim();
}

function uniq(items: string[], max = 30): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const v = normalizeLine(item);
    if (!v) continue;
    const key = v.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(v);
    if (out.length >= max) break;
  }
  return out;
}

function splitIntoLines(text: string): string[] {
  return text
    .split(/\r?\n/g)
    .map((l) => l.trim())
    .filter(Boolean);
}

function guessSummary(text: string): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  const sentences = cleaned.split(/(?<=[.!?])\s+/).filter(Boolean);
  return sentences.slice(0, 3).join(" ").trim();
}

function extractSkills(text: string): string[] {
  const lower = text.toLowerCase();

  // If there is a "Skills:" block, harvest it first.
  const skillsBlockMatch = lower.match(/\bskills\b\s*[:\-]\s*([\s\S]{0,600})/i);
  if (skillsBlockMatch?.[1]) {
    const raw = skillsBlockMatch[1]
      .split(/\r?\n/g)
      .slice(0, 8)
      .join("\n");

    const items = raw
      .split(/[,•\u2022;\n]/g)
      .map((s) => normalizeLine(s))
      .filter(Boolean);

    if (items.length >= 3) return uniq(items, 40);
  }

  const lines = splitIntoLines(text);
  const candidates: string[] = [];

  for (const line of lines) {
    const normalized = normalizeLine(line);
    const l = normalized.toLowerCase();
    if (!l) continue;

    const containsKeyword = SKILL_KEYWORDS.some((k) => l.includes(k));
    if (!containsKeyword) continue;

    // Prefer comma-separated skill lists; otherwise keep the whole line.
    if (normalized.includes(",") || normalized.includes(";") || normalized.includes("•")) {
      candidates.push(
        ...normalized
          .split(/[,;•\u2022]/g)
          .map((s) => normalizeLine(s))
          .filter(Boolean),
      );
    } else {
      candidates.push(normalized);
    }
  }

  // Also pick up explicit keyword hits even if they are not on a dedicated "skills" line.
  for (const kw of SKILL_KEYWORDS) {
    if (lower.includes(kw)) candidates.push(kw);
  }

  return uniq(candidates, 40);
}

function extractBuckets(text: string) {
  const lines = splitIntoLines(text);

  const experience: string[] = [];
  const projects: string[] = [];
  const education: string[] = [];
  const certificates: string[] = [];

  for (const line of lines) {
    const normalized = normalizeLine(line);
    if (!normalized) continue;

    if (YEAR_PATTERN.test(normalized) || ROLE_KEYWORDS.test(normalized)) {
      experience.push(normalized);
    }
    if (PROJECT_PATTERN.test(normalized)) {
      projects.push(normalized);
    }
    if (EDUCATION_PATTERN.test(normalized)) {
      education.push(normalized);
    }
    if (CERT_PATTERN.test(normalized)) {
      certificates.push(normalized);
    }
  }

  return {
    experience: uniq(experience, 25),
    projects: uniq(projects, 25),
    education: uniq(education, 25),
    certificates: uniq(certificates, 25),
  };
}

export function parseSourceText(text: string): ResumeSections {
  const summary = guessSummary(text);
  const skills = extractSkills(text);
  const buckets = extractBuckets(text);

  return {
    summary,
    skills,
    experience: buckets.experience,
    projects: buckets.projects,
    education: buckets.education,
    certificates: buckets.certificates,
  };
}

