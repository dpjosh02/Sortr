import { describe, expect, it } from "vitest";

import { EMPTY_CELL } from "./elements";
import { createWorld, type WorldDefinition } from "./world";

describe("createWorld", () => {
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

  it("blocks water with drawn line cells", () => {
    const world = createWorld({
      emitters: [],
      height: 3,
      seed: 1,
      width: 3,
    });

    world.setCell(1, 0, "water");
    world.addLineCell(0, 0);
    world.addLineCell(2, 0);
    world.addLineSegment({ x: 0, y: 1 }, { x: 2, y: 1 });
    world.step();

    expect(world.getCell(1, 0)).toBe("water");
  });

  it("blocks sand with drawn line cells", () => {
    const world = createWorld({
      emitters: [],
      height: 3,
      seed: 1,
      width: 3,
    });

    world.setCell(1, 0, "sand");
    world.addLineSegment({ x: 0, y: 1 }, { x: 2, y: 1 });
    world.step();

    expect(world.getCell(1, 0)).toBe("sand");
  });

  it("blocks diagonal movement through touching corner line cells", () => {
    const world = createWorld({
      emitters: [],
      height: 2,
      seed: 1,
      width: 2,
    });

    world.setCell(0, 0, "sand");
    world.addLineCell(0, 1);
    world.addLineCell(1, 0);
    world.step();

    expect(world.getCell(0, 0)).toBe("sand");
    expect(world.getCell(1, 1)).toBe(EMPTY_CELL);
  });

  it("lets sand diagonally displace water when the water escapes sideways", () => {
    const world = createWorld({
      emitters: [],
      height: 3,
      seed: 1,
      width: 4,
    });

    world.setCell(1, 0, "sand");
    world.setCell(0, 1, "sand");
    world.setCell(1, 1, "sand");
    world.setCell(2, 1, "water");
    world.setCell(0, 2, "sand");
    world.setCell(1, 2, "sand");
    world.setCell(2, 2, "sand");
    world.setCell(3, 2, "sand");
    world.step();

    expect(world.getCell(1, 0)).toBe(EMPTY_CELL);
    expect(world.getCell(2, 1)).toBe("sand");
    expect(world.getCell(3, 1)).toBe("water");
  });

  it("does not spawn particles into drawn line cells", () => {
    const world = createWorld({
      emitters: [
        {
          edge: "top",
          element: "water",
          id: "water-source",
          range: {
            end: 1,
            start: 1,
          },
          ratePerTick: 1,
        },
      ],
      height: 3,
      seed: 1,
      width: 3,
    });

    world.addLineCell(1, 0);
    world.step();

    expect(world.snapshot().particleCounts).toEqual([]);
    expect(world.getCell(1, 0)).toBe(-1);
  });

  it("lets sandbox brushes add elements without replacing existing solids", () => {
    const world = createWorld({
      emitters: [],
      height: 3,
      seed: 1,
      width: 3,
    });

    world.addElementCell(1, 1, "water");
    world.addElementCell(1, 1, "sand");
    world.addElementCell(0, 1, "sand");
    world.addElementCell(0, 1, "water");

    expect(world.getCell(1, 1)).toBe("sand");
    expect(world.getCell(0, 1)).toBe("sand");
    expect(totalWater(world)).toBeCloseTo(1);
  });

  it("clears drawn lines when the world is recreated for reset", () => {
    const definition: WorldDefinition = {
      emitters: [],
      height: 3,
      seed: 1,
      width: 3,
    };
    const world = createWorld(definition);

    world.addLineCell(1, 1);

    expect(world.getCell(1, 1)).toBe(-1);
    expect(createWorld(definition).getCell(1, 1)).toBe(EMPTY_CELL);
  });
});

function totalWater(world: ReturnType<typeof createWorld>): number {
  return world.snapshot().water.reduce((total, amount) => total + amount, 0);
}

function waterInRow(world: ReturnType<typeof createWorld>, row: number): number {
  const snapshot = world.snapshot();
  let total = 0;

  for (let x = 0; x < snapshot.width; x += 1) {
    total += snapshot.water[row * snapshot.width + x] ?? 0;
  }

  return total;
}

function waterBelowRow(world: ReturnType<typeof createWorld>, row: number): number {
  const snapshot = world.snapshot();
  let total = 0;

  for (let y = row + 1; y < snapshot.height; y += 1) {
    for (let x = 0; x < snapshot.width; x += 1) {
      total += snapshot.water[y * snapshot.width + x] ?? 0;
    }
  }

  return total;
}

function waterCellCount(world: ReturnType<typeof createWorld>): number {
  return world.snapshot().water.filter((amount) => amount > 0.01).length;
}
