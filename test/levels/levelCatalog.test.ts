import { describe, expect, it } from "vitest";

import {
  LEVEL_CATALOG,
  getInitialLevel,
  getLevelByIndex,
  getNextLevelIndex,
} from "../../src/levels/levelCatalog";
import { ELEMENTS } from "../../src/simulation/elements";

describe("LEVEL_CATALOG", () => {
  it("contains the first playable level pack", () => {
    expect(LEVEL_CATALOG.length).toBeGreaterThanOrEqual(5);
    expect(getInitialLevel()).toBe(LEVEL_CATALOG[0]);
    expect(getLevelByIndex(1)).toBe(LEVEL_CATALOG[1]);
    expect(getNextLevelIndex(0)).toBe(1);
    expect(getNextLevelIndex(LEVEL_CATALOG.length - 1)).toBeNull();
    expect(LEVEL_CATALOG.map((level) => level.id)).toContain("005-crossing-paths");
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

      for (const hearth of level.world.hearths ?? []) {
        expect(hearth.rect.x).toBeGreaterThanOrEqual(0);
        expect(hearth.rect.y).toBeGreaterThanOrEqual(0);
        expect(hearth.rect.x + hearth.rect.width).toBeLessThanOrEqual(level.world.width);
        expect(hearth.rect.y + hearth.rect.height).toBeLessThanOrEqual(level.world.height);
      }

      for (const obstacle of level.world.obstacles ?? []) {
        if (obstacle.kind === "solid-rect") {
          expect(obstacle.rect.x).toBeGreaterThanOrEqual(0);
          expect(obstacle.rect.y).toBeGreaterThanOrEqual(0);
          expect(obstacle.rect.x + obstacle.rect.width).toBeLessThanOrEqual(level.world.width);
          expect(obstacle.rect.y + obstacle.rect.height).toBeLessThanOrEqual(level.world.height);
        } else {
          expect(obstacle.line.thickness).toBeGreaterThan(0);
          expect(obstacle.line.x1).toBeGreaterThanOrEqual(0);
          expect(obstacle.line.x2).toBeGreaterThanOrEqual(0);
          expect(obstacle.line.y1).toBeGreaterThanOrEqual(0);
          expect(obstacle.line.y2).toBeGreaterThanOrEqual(0);
          expect(obstacle.line.x1).toBeLessThan(level.world.width);
          expect(obstacle.line.x2).toBeLessThan(level.world.width);
          expect(obstacle.line.y1).toBeLessThan(level.world.height);
          expect(obstacle.line.y2).toBeLessThan(level.world.height);
        }
      }
    }
  });
});
