import { describe, expect, it } from "vitest";

import {
  createStatusText,
  formatBucketProgress,
  formatParticleCounts,
} from "../../src/ui/statusText";

describe("formatParticleCounts", () => {
  it("formats empty and populated particle counts", () => {
    expect(formatParticleCounts([])).toBe("no particles");
    expect(
      formatParticleCounts([
        { count: 12, element: "sand" },
        { count: 4, element: "water" },
      ]),
    ).toBe("sand: 12 / water: 4");
  });
});

describe("formatBucketProgress", () => {
  it("formats bucket targets with floored accepted values", () => {
    expect(formatBucketProgress([])).toBe("no buckets");
    expect(
      formatBucketProgress([
        {
          accepted: 9.8,
          required: 12,
          target: "water",
        },
      ]),
    ).toBe("water: 9/12");
  });
});

describe("createStatusText", () => {
  it("keeps player status focused on level progress", () => {
    expect(
      createStatusText({
        activeInputLabel: "Line",
        buckets: [{ accepted: 6, required: 10, target: "steam" }],
        debugEnabled: false,
        isComplete: false,
        levelTitle: "Make It Rise",
        particleCounts: [{ count: 3, element: "steam" }],
        tick: 24,
      }),
    ).toBe("Make It Rise | steam: 6/10");
  });

  it("adds debug-only particle and brush details when debug is enabled", () => {
    expect(
      createStatusText({
        activeInputLabel: "Dev Steam",
        buckets: [{ accepted: 6, required: 10, target: "steam" }],
        debugEnabled: true,
        isComplete: false,
        levelTitle: "Make It Rise",
        particleCounts: [{ count: 3, element: "steam" }],
        tick: 24,
      }),
    ).toBe("Make It Rise | tick 24 | steam: 3 | input: Dev Steam | steam: 6/10");
  });

  it("shows completion outside debug mode", () => {
    expect(
      createStatusText({
        activeInputLabel: "Line",
        buckets: [{ accepted: 10, required: 10, target: "water" }],
        debugEnabled: false,
        isComplete: true,
        levelTitle: "First Flow",
        particleCounts: [],
        tick: 42,
      }),
    ).toBe("First Flow | complete");
  });
});
