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
    expect(LEVEL_CATALOG.map((level) => level.id)).toContain("006-mix-the-earth");
    expect(LEVEL_CATALOG.map((level) => level.id)).toContain("007-warm-the-mud");
    expect(LEVEL_CATALOG.map((level) => level.id)).toContain("008-smoke-and-ash");
  });

  it("uses valid bucket definitions", () => {
    const elementSet = new Set(ELEMENTS);

    for (const level of LEVEL_CATALOG) {
      expect(level.cellSize).toBeGreaterThan(0);
      expect(level.lesson.length).toBeGreaterThan(12);
      expect(level.designerNotes.length).toBeGreaterThan(40);
      expect(level.world.width).toBeGreaterThan(0);
      expect(level.world.height).toBeGreaterThan(0);
      expect(level.world.buckets?.length ?? 0).toBeGreaterThan(0);
      expect(level.world.emitters.length).toBeGreaterThan(0);

      const ids = new Set<string>();
      const registerId = (id: string): void => {
        expect(ids.has(id)).toBe(false);
        ids.add(id);
      };

      for (const bucket of level.world.buckets ?? []) {
        registerId(bucket.id);
        expect(elementSet.has(bucket.target)).toBe(true);
        expect(bucket.required).toBeGreaterThan(0);
        expect(bucket.rect.x).toBeGreaterThanOrEqual(0);
        expect(bucket.rect.y).toBeGreaterThanOrEqual(0);
        expect(bucket.rect.x + bucket.rect.width).toBeLessThanOrEqual(level.world.width);
        expect(bucket.rect.y + bucket.rect.height).toBeLessThanOrEqual(level.world.height);
      }

      for (const emitter of level.world.emitters) {
        registerId(emitter.id);
        expect(elementSet.has(emitter.element)).toBe(true);
        expect(emitter.ratePerTick).toBeGreaterThan(0);
        expect(emitter.range.start).toBeGreaterThanOrEqual(0);
        expect(emitter.range.end).toBeGreaterThanOrEqual(emitter.range.start);

        if (emitter.edge === "top" || emitter.edge === "bottom") {
          expect(emitter.range.end).toBeLessThan(level.world.width);
        } else {
          expect(emitter.range.end).toBeLessThan(level.world.height);
        }
      }

      for (const hearth of level.world.hearths ?? []) {
        registerId(hearth.id);
        expect(hearth.rect.x).toBeGreaterThanOrEqual(0);
        expect(hearth.rect.y).toBeGreaterThanOrEqual(0);
        expect(hearth.rect.x + hearth.rect.width).toBeLessThanOrEqual(level.world.width);
        expect(hearth.rect.y + hearth.rect.height).toBeLessThanOrEqual(level.world.height);
      }

      for (const obstacle of level.world.obstacles ?? []) {
        registerId(obstacle.id);

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

  it("documents one major lesson for each MVP level", () => {
    expect(
      LEVEL_CATALOG.map((level) => ({
        id: level.id,
        lesson: level.lesson,
      })),
    ).toEqual([
      {
        id: "001-first-flow",
        lesson: "Draw ramps to guide falling water into a bucket.",
      },
      {
        id: "002-piles",
        lesson: "Sand piles, avalanches, and needs support differently than water.",
      },
      {
        id: "003-make-it-rise",
        lesson: "Route water into a hearth to create rising steam.",
      },
      {
        id: "004-two-streams",
        lesson: "Separate water and sand so each reaches only its matching bucket.",
      },
      {
        id: "005-crossing-paths",
        lesson: "Balance direct water collection with steam creation in the same space.",
      },
      {
        id: "006-mix-the-earth",
        lesson: "Combine dirt and water to make mud before routing it to the bucket.",
      },
      {
        id: "007-warm-the-mud",
        lesson: "Heat mud to release steam while dirt falls away.",
      },
      {
        id: "008-smoke-and-ash",
        lesson: "Burn dirt into rising smoke and falling ash.",
      },
    ]);
  });
});
