import { describe, expect, it } from "vitest";

import { ELEMENTS } from "../simulation/elements";

import { LEVEL_CATALOG, getInitialLevel, getLevelByIndex, getNextLevelIndex } from "./levelCatalog";

describe("LEVEL_CATALOG", () => {
  it("contains multiple playable snapshot 4 levels", () => {
    expect(LEVEL_CATALOG.length).toBeGreaterThanOrEqual(2);
    expect(getInitialLevel()).toBe(LEVEL_CATALOG[0]);
    expect(getLevelByIndex(1)).toBe(LEVEL_CATALOG[1]);
    expect(getNextLevelIndex(0)).toBe(1);
    expect(getNextLevelIndex(LEVEL_CATALOG.length - 1)).toBeNull();
  });

  it("uses valid bucket definitions", () => {
    const elementSet = new Set(ELEMENTS);

    for (const level of LEVEL_CATALOG) {
      expect(level.world.buckets?.length ?? 0).toBeGreaterThan(0);

      for (const bucket of level.world.buckets ?? []) {
        expect(elementSet.has(bucket.target)).toBe(true);
        expect(bucket.required).toBeGreaterThan(0);
        expect(bucket.rect.x).toBeGreaterThanOrEqual(0);
        expect(bucket.rect.y).toBeGreaterThanOrEqual(0);
        expect(bucket.rect.x + bucket.rect.width).toBeLessThanOrEqual(level.world.width);
        expect(bucket.rect.y + bucket.rect.height).toBeLessThanOrEqual(level.world.height);
      }
    }
  });
});
