import { describe, expect, it } from "vitest";

import { EMPTY_CELL } from "../../src/simulation/elements";
import { createWorld, type WorldDefinition } from "../../src/simulation/world";

import { totalWater } from "./worldTestHelpers";

describe("world sandbox controls", () => {
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
