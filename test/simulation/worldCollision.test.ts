import { describe, expect, it } from "vitest";

import { EMPTY_CELL } from "../../src/simulation/elements";
import { createWorld } from "../../src/simulation/world";

describe("world collision", () => {
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

  it("blocks particles and water with level-authored solid obstacles", () => {
    const world = createWorld({
      emitters: [],
      height: 4,
      obstacles: [
        {
          id: "floor",
          kind: "solid-rect",
          rect: {
            height: 1,
            width: 3,
            x: 0,
            y: 2,
          },
        },
      ],
      seed: 1,
      width: 3,
    });

    world.setCell(1, 0, "sand");
    world.setCell(0, 1, "water");

    for (let tick = 0; tick < 4; tick += 1) {
      world.step();
    }

    const snapshot = world.snapshot();
    const waterTotal = snapshot.water.reduce((total, amount) => total + amount, 0);

    expect(world.getCell(1, 1)).toBe("sand");
    expect(waterTotal).toBeGreaterThan(0);
    expect(snapshot.water[2 * world.width + 0]).toBe(0);
    expect(snapshot.water[2 * world.width + 1]).toBe(0);
    expect(snapshot.water[2 * world.width + 2]).toBe(0);
  });
});
