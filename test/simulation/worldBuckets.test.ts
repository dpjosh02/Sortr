import { describe, expect, it } from "vitest";

import { createWorld } from "../../src/simulation/world";

describe("world buckets", () => {
  it("counts steam settled inside matching buckets", () => {
    const world = createWorld({
      buckets: [
        {
          id: "steam-goal",
          intake: "top",
          rect: {
            height: 3,
            width: 3,
            x: 1,
            y: 0,
          },
          required: 1,
          target: "steam",
        },
      ],
      emitters: [],
      height: 4,
      seed: 1,
      width: 5,
    });

    world.setCell(2, 1, "steam");
    world.step();

    expect(world.snapshot().buckets[0]?.accepted).toBe(1);
    expect(world.snapshot().isComplete).toBe(true);
    expect(world.snapshot().isCollapseActive).toBe(false);
  });

  it("counts matching material that physically settles inside a bucket", () => {
    const world = createWorld({
      buckets: [
        {
          id: "sand-goal",
          intake: "top",
          rect: {
            height: 3,
            width: 4,
            x: 1,
            y: 2,
          },
          required: 2,
          target: "sand",
        },
      ],
      emitters: [],
      height: 5,
      seed: 1,
      width: 6,
    });

    world.setCell(2, 2, "sand");
    world.setCell(3, 2, "sand");

    for (let index = 0; index < 2; index += 1) {
      world.step();
    }

    const snapshot = world.snapshot();
    expect(snapshot.buckets[0]?.accepted).toBe(2);
    expect(snapshot.buckets[0]?.settled).toBe(2);
    expect(snapshot.isComplete).toBe(true);
    expect(snapshot.isCollapseActive).toBe(false);
  });

  it("rejects wrong bucket elements without counting them", () => {
    const world = createWorld({
      buckets: [
        {
          id: "sand-goal",
          intake: "top",
          rect: {
            height: 2,
            width: 3,
            x: 0,
            y: 2,
          },
          required: 1,
          target: "sand",
        },
      ],
      emitters: [],
      height: 3,
      seed: 1,
      width: 3,
    });

    world.setCell(1, 2, "water");
    world.step();

    expect(world.snapshot().buckets[0]?.accepted).toBe(0);
    expect(world.snapshot().isComplete).toBe(false);
    expect(world.getCell(1, 2)).toBe("water");
  });

  it("counts water bucket intake by conserved volume", () => {
    const world = createWorld({
      buckets: [
        {
          id: "water-goal",
          intake: "top",
          rect: {
            height: 2,
            width: 4,
            x: 0,
            y: 2,
          },
          required: 2,
          target: "water",
        },
      ],
      emitters: [],
      height: 3,
      seed: 1,
      width: 4,
    });

    world.setCell(1, 2, "water");
    world.setCell(2, 2, "water");
    world.step();

    expect(world.snapshot().buckets[0]?.accepted).toBeGreaterThan(1.9);
    expect(world.snapshot().isComplete).toBe(true);
    expect(world.snapshot().isCollapseActive).toBe(false);
  });

  it("blocks materials from entering bucket sides and bottom", () => {
    const world = createWorld({
      buckets: [
        {
          id: "sand-goal",
          intake: "top",
          rect: {
            height: 4,
            width: 4,
            x: 1,
            y: 1,
          },
          required: 1,
          target: "sand",
        },
      ],
      emitters: [],
      height: 6,
      seed: 1,
      width: 6,
    });

    world.setCell(0, 2, "sand");
    world.setCell(2, 5, "sand");
    world.step();

    expect(world.getCell(1, 2)).not.toBe("sand");
    expect(world.getCell(2, 4)).not.toBe("sand");
    expect(world.snapshot().buckets[0]?.accepted).toBe(0);
  });

  it("lets bottom-opening buckets catch rising steam while blocking their top", () => {
    const world = createWorld({
      buckets: [
        {
          id: "steam-goal",
          intake: "bottom",
          rect: {
            height: 4,
            width: 3,
            x: 1,
            y: 0,
          },
          required: 1,
          target: "steam",
        },
      ],
      emitters: [],
      height: 5,
      seed: 1,
      width: 5,
    });

    world.setCell(2, 4, "steam");

    for (let index = 0; index < 4; index += 1) {
      world.step();
    }

    const snapshot = world.snapshot();
    expect(snapshot.buckets[0]?.accepted).toBe(1);
    expect(snapshot.isComplete).toBe(true);
    expect(snapshot.isCollapseActive).toBe(false);
  });
});
