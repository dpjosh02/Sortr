import { describe, expect, it } from "vitest";

import { createCompletionText, createLevelContextText } from "../../src/ui/campaignText";

describe("createLevelContextText", () => {
  it("combines campaign position and lesson without exposing solutions", () => {
    expect(
      createLevelContextText({
        levelIndex: 1,
        lesson: "Sand piles, avalanches, and needs support differently than water.",
        totalLevels: 5,
      }),
    ).toBe("Level 2 of 5 | Sand piles, avalanches, and needs support differently than water.");
  });
});

describe("createCompletionText", () => {
  it("prompts linear progress when another level is available", () => {
    expect(createCompletionText({ hasNextLevel: true, isComplete: true })).toBe(
      "Level complete. Continue to the next puzzle.",
    );
  });

  it("marks the end of the current campaign pack", () => {
    expect(createCompletionText({ hasNextLevel: false, isComplete: true })).toBe(
      "Campaign complete. Reset to replay the finale.",
    );
  });

  it("stays hidden before completion", () => {
    expect(createCompletionText({ hasNextLevel: true, isComplete: false })).toBeNull();
  });
});
