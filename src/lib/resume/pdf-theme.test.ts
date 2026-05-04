import { describe, expect, it } from "vitest";
import { RESUME_PDF_THEME_VERSION, resumePdfTheme } from "./pdf-theme";

describe("resume PDF theme (spacing single source of truth)", () => {
  it("bumps version intentionally when changing scale tokens", () => {
    expect(RESUME_PDF_THEME_VERSION).toBe(2);
  });

  it("matches snapshot so accidental edits are caught in CI", () => {
    expect(resumePdfTheme).toMatchSnapshot();
  });
});
