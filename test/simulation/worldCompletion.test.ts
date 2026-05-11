import { describe, expect, it } from "vitest";

import { createWorld } from "../../src/simulation/world";

import { countCollapseCells } from "./worldTestHelpers";

describe("completion collapse", () => {
  it("stops emitters after the level completes", () => {
    const world = createWorld({
      buckets: [
        {
          id: "water-goal",
          intake: "top",
          rect: {
            height: 3,
            width: 3,
            x: 1,
            y: 2,
          },
          required: 1,
          target: "water",
        },
      ],
      emitters: [
        {
          edge: "top",
          element: "water",
          id: "water-source",
          range: {
            end: 4,
            start: 4,
          },
          ratePerTick: 1,
        },
      ],
      height: 6,
      seed: 1,
      width: 6,
    });

    world.setCell(2, 2, "water");
    world.step();

    const completedCount = countCollapseCells(world);

    for (let tick = 0; tick < 8; tick += 1) {
      world.step();
    }

    expect(world.snapshot().isCollapseActive).toBe(true);
    expect(countCollapseCells(world)).toBe(completedCount);
  });

  it("turns particles, lines, obstacles, and buckets into falling collapse grains", () => {
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
          required: 1,
          target: "sand",
        },
      ],
      emitters: [],
      height: 7,
      obstacles: [
        {
          id: "block",
          kind: "solid-rect",
          rect: {
            height: 1,
            width: 2,
            x: 4,
            y: 1,
          },
        },
      ],
      seed: 1,
      width: 7,
    });

    world.setCell(2, 2, "sand");
    world.setCell(0, 0, "water");
    world.setCell(6, 1, "fire");
    world.addLineCell(0, 3);
    world.step();

    const snapshot = world.snapshot();

    expect(snapshot.isComplete).toBe(true);
    expect(snapshot.isCollapseActive).toBe(true);
    expect(countCollapseCells(world, "sand")).toBe(1);
    expect(countCollapseCells(world, "water")).toBe(1);
    expect(countCollapseCells(world, "fire")).toBe(1);
    expect(countCollapseCells(world, "solid")).toBeGreaterThan(6);
    expect(snapshot.cells.every((cell) => cell === 0)).toBe(true);
    expect(snapshot.water.every((amount) => amount === 0)).toBe(true);
  });

  it("keeps completion grains non-reactive while they settle", () => {
    const world = createWorld({
      buckets: [
        {
          id: "water-goal",
          intake: "top",
          rect: {
            height: 3,
            width: 3,
            x: 1,
            y: 3,
          },
          required: 1,
          target: "water",
        },
      ],
      emitters: [],
      height: 7,
      seed: 1,
      width: 7,
    });

    world.setCell(2, 3, "water");
    world.setCell(5, 0, "fire");
    world.step();

    const fireCount = countCollapseCells(world, "fire");
    const waterCount = countCollapseCells(world, "water");

    for (let tick = 0; tick < 8; tick += 1) {
      world.step();
    }

    expect(countCollapseCells(world, "fire")).toBe(fireCount);
    expect(countCollapseCells(world, "water")).toBe(waterCount);
  });
});
