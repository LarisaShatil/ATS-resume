import { describe, expect, it } from "vitest";
import { DEFAULT_DRAFT } from "./types";
import { parseResumeDraftJson } from "./storage";

describe("parseResumeDraftJson", () => {
  it("merges partial JSON onto defaults", () => {
    const draft = parseResumeDraftJson(
      JSON.stringify({
        header: { fullName: "Ada Lovelace" },
        sections: { summary: "Summary", skills: ["React"] },
      }),
    );

    expect(draft.header.fullName).toBe("Ada Lovelace");
    expect(draft.sections.summary).toBe("Summary");
    expect(draft.sections.skills).toEqual(["React"]);
  });

  it("guards language, summary, and skills types", () => {
    const draft = parseResumeDraftJson(
      JSON.stringify({
        language: "de",
        sections: {
          summary: 123,
          skills: "React,TypeScript",
        },
      }),
    );

    expect(draft.language).toBe(DEFAULT_DRAFT.language);
    expect(draft.sections.summary).toBe(DEFAULT_DRAFT.sections.summary);
    expect(draft.sections.skills).toEqual(DEFAULT_DRAFT.sections.skills);
  });

  it("trims and de-duplicates nothing for skills (only trims/filters)", () => {
    const draft = parseResumeDraftJson(
      JSON.stringify({
        sections: {
          skills: [" React ", "", "TypeScript", "TypeScript "],
        },
      }),
    );

    expect(draft.sections.skills).toEqual(["React", "TypeScript", "TypeScript"]);
  });
});

