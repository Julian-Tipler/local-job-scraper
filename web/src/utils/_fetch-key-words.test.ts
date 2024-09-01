import { describe, expect, it } from "vitest";
import { fetchKeyWords } from "./_fetch-key-words";

describe("fetchKeyWords", () => {
  it("should return the correct keywords from the OpenAI API", async () => {
    const userBullets = ["React", "TypeScript", "Tailwind"];
    const description = `
      We are looking for a developer with strong experience in React, TypeScript, and Tailwind CSS.
      Experience with Node.js is also preferred. Knowledge of CI/CD pipelines is a plus.`;

    // Call the function and wait for the response
    const keywords = await fetchKeyWords(userBullets, description);

    // Validate that the returned keywords contain expected values
    expect(keywords).toContain("React");
    expect(keywords).toContain("TypeScript");
    expect(keywords).toContain("Tailwind");
    expect(keywords).toContain("Node.js");
    expect(keywords).toContain("CI/CD");

    // Optionally, you can check that the result is an array and contains unique values
    expect(Array.isArray(keywords)).toBe(true);
    expect(new Set(keywords).size).toBe(keywords.length); // Check for uniqueness
  });
});
