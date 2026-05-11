import { describe, expect, it } from "vitest";

import { EMPTY_CELL } from "../../src/simulation/elements";
import { createWorld, type WorldDefinition } from "../../src/simulation/world";

import {
  countElementCells,
  totalWater,
  waterBelowRow,
  waterCellCount,
  waterInRow,
} from "./worldTestHelpers";

describe("world flow and density", () => {
  it("spawns particles from top emitters and moves them deterministically", () => {
    const definition: WorldDefinition = {
      emitters: [
        {
          edge: "top",
          element: "water",
          id: "water-source",
          range: {
            end: 2,
            start: 2,
          },
          ratePerTick: 1,
        },
      ],
      height: 5,
      seed: 7,
      width: 5,
    };

    const first = createWorld(definition);
    const second = createWorld(definition);

    for (let index = 0; index < 4; index += 1) {
      first.step();
      second.step();
    }

    expect(first.snapshot().cells).toEqual(second.snapshot().cells);
    expect(totalWater(first)).toBeCloseTo(4);
  });

  it("moves water downward before spreading sideways", () => {
    const world = createWorld({
      emitters: [],
      height: 4,
      seed: 1,
      width: 4,
    });

    world.setCell(1, 0, "water");
    world.step();

    expect(world.getCell(1, 0)).toBe(EMPTY_CELL);
    expect(waterInRow(world, 0)).toBeCloseTo(0);
    expect(waterBelowRow(world, 0)).toBeCloseTo(1);
  });

  it("lets water spread horizontally when lower cells are blocked", () => {
    const world = createWorld({
      emitters: [],
      height: 3,
      seed: 1,
      width: 5,
    });

    world.setCell(2, 1, "water");
    world.setCell(1, 2, "sand");
    world.setCell(2, 2, "sand");
    world.setCell(3, 2, "sand");
    world.step();

    expect(totalWater(world)).toBeCloseTo(1);
    expect([world.getCell(1, 1), world.getCell(3, 1)]).toContain("water");
  });

  it("piles sand when straight downward movement is blocked", () => {
    const world = createWorld({
      emitters: [],
      height: 4,
      seed: 1,
      width: 5,
    });

    world.setCell(2, 1, "sand");
    world.setCell(2, 2, "sand");
    world.setCell(1, 3, "sand");
    world.setCell(2, 3, "sand");
    world.setCell(3, 3, "sand");
    world.step();

    expect(world.getCell(2, 1)).toBe(EMPTY_CELL);
    expect([world.getCell(1, 2), world.getCell(3, 2)]).toContain("sand");
  });

  it("does not move sand horizontally on a flat blocked row", () => {
    const world = createWorld({
      emitters: [],
      height: 3,
      seed: 1,
      width: 5,
    });

    world.setCell(2, 1, "sand");
    world.setCell(1, 2, "sand");
    world.setCell(2, 2, "sand");
    world.setCell(3, 2, "sand");
    world.step();

    expect(world.getCell(2, 1)).toBe("sand");
  });

  it("lets denser sand sink through water and push water sideways", () => {
    const world = createWorld({
      emitters: [],
      height: 3,
      seed: 1,
      width: 3,
    });

    world.setCell(1, 0, "sand");
    world.setCell(1, 1, "water");
    world.setCell(0, 2, "sand");
    world.setCell(1, 2, "sand");
    world.setCell(2, 2, "sand");
    world.step();

    expect(world.getCell(1, 0)).toBe(EMPTY_CELL);
    expect(world.getCell(1, 1)).toBe("sand");
    expect([world.getCell(0, 1), world.getCell(2, 1)]).toContain("water");
    expect(totalWater(world)).toBeCloseTo(1);
  });

  it("redistributes displaced water volume through nearby liquid capacity", () => {
    const world = createWorld({
      emitters: [],
      height: 4,
      seed: 1,
      width: 5,
    });

    world.setCell(2, 0, "sand");
    world.setCell(1, 1, "water");
    world.setCell(2, 1, "water");
    world.setCell(3, 1, "water");
    world.setCell(0, 3, "sand");
    world.setCell(1, 3, "sand");
    world.setCell(2, 3, "sand");
    world.setCell(3, 3, "sand");
    world.setCell(4, 3, "sand");
    world.step();

    expect(world.getCell(2, 1)).toBe("sand");
    expect(totalWater(world)).toBeCloseTo(3);
    expect(waterCellCount(world)).toBeGreaterThan(1);
  });

  it("lets a tall sand column pressure-displace water without losing water volume", () => {
    const world = createWorld({
      emitters: [],
      height: 5,
      seed: 1,
      width: 5,
    });

    world.setCell(2, 0, "sand");
    world.setCell(2, 1, "sand");
    world.setCell(2, 2, "sand");
    world.setCell(1, 3, "water");
    world.setCell(2, 3, "water");
    world.setCell(3, 3, "water");
    world.setCell(0, 4, "sand");
    world.setCell(1, 4, "sand");
    world.setCell(2, 4, "sand");
    world.setCell(3, 4, "sand");
    world.setCell(4, 4, "sand");
    world.step();

    expect(world.getCell(2, 3)).toBe("sand");
    expect(totalWater(world)).toBeCloseTo(3);
    expect(waterCellCount(world)).toBeGreaterThan(2);
  });

  it("keeps submerged sand sinking toward solid support while conserving water", () => {
    const world = createWorld({
      emitters: [],
      height: 8,
      seed: 1,
      width: 5,
    });

    for (let y = 2; y <= 6; y += 1) {
      world.setCell(1, y, "water");
      world.setCell(2, y, "water");
      world.setCell(3, y, "water");
    }

    world.addElementCell(2, 2, "sand");

    for (let index = 0; index < 4; index += 1) {
      world.step();
    }

    expect(world.getCell(2, 6)).toBe("sand");
    expect(totalWater(world)).toBeCloseTo(15);
    expect(countElementCells(world, "sand")).toBe(1);
  });

  it("does not let submerged sand settle through drawn lines", () => {
    const world = createWorld({
      emitters: [],
      height: 6,
      seed: 1,
      width: 5,
    });

    for (let y = 1; y <= 4; y += 1) {
      world.setCell(2, y, "water");
    }

    world.setCell(2, 1, "sand");
    world.addLineSegment({ x: 1, y: 3 }, { x: 3, y: 3 });

    for (let index = 0; index < 4; index += 1) {
      world.step();
    }

    expect(world.getCell(2, 2)).toBe("sand");
    expect(world.getCell(2, 3)).toBe(-1);
    expect(countElementCells(world, "sand")).toBe(1);
  });

  it("does not let sand displace water when the water has no lateral escape", () => {
    const world = createWorld({
      emitters: [],
      height: 3,
      seed: 1,
      width: 3,
    });

    world.setCell(1, 0, "sand");
    world.setCell(0, 1, "sand");
    world.setCell(1, 1, "water");
    world.setCell(2, 1, "sand");
    world.setCell(0, 2, "sand");
    world.setCell(1, 2, "sand");
    world.setCell(2, 2, "sand");
    world.step();

    expect(world.getCell(1, 0)).toBe("sand");
    expect(world.getCell(1, 1)).toBe("water");
  });

  it("does not chain-displace the same water particle within one tick", () => {
    const world = createWorld({
      emitters: [],
      height: 3,
      seed: 1,
      width: 5,
    });

    world.setCell(1, 0, "sand");
    world.setCell(2, 0, "sand");
    world.setCell(3, 0, "sand");
    world.setCell(2, 1, "water");
    world.setCell(0, 2, "sand");
    world.setCell(1, 2, "sand");
    world.setCell(2, 2, "sand");
    world.setCell(3, 2, "sand");
    world.setCell(4, 2, "sand");
    world.step();

    expect(totalWater(world)).toBeCloseTo(1);
    expect([world.getCell(1, 1), world.getCell(3, 1)]).toContain("water");
    expect(world.getCell(0, 1)).not.toBe("water");
    expect(world.getCell(4, 1)).not.toBe("water");
  });

  it("does not let water displace denser sand", () => {
    const world = createWorld({
      emitters: [],
      height: 3,
      seed: 1,
      width: 3,
    });

    world.setCell(0, 0, "sand");
    world.setCell(1, 0, "water");
    world.setCell(2, 0, "sand");
    world.setCell(0, 1, "sand");
    world.setCell(1, 1, "sand");
    world.setCell(2, 1, "sand");
    world.setCell(0, 2, "sand");
    world.setCell(1, 2, "sand");
    world.setCell(2, 2, "sand");
    world.step();

    expect(world.getCell(1, 0)).toBe("water");
    expect(world.getCell(1, 1)).toBe("sand");
  });

  it("does not let solids sink into each other", () => {
    const world = createWorld({
      emitters: [],
      height: 3,
      seed: 1,
      width: 3,
    });

    world.setCell(0, 0, "sand");
    world.setCell(1, 0, "sand");
    world.setCell(2, 0, "sand");
    world.setCell(0, 1, "sand");
    world.setCell(1, 1, "sand");
    world.setCell(2, 1, "sand");
    world.setCell(0, 2, "sand");
    world.setCell(1, 2, "sand");
    world.setCell(2, 2, "sand");
    world.step();

    expect(world.getCell(1, 0)).toBe("sand");
    expect(world.getCell(1, 1)).toBe("sand");
  });
});
