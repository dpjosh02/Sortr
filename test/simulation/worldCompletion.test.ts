import { describe, expect, it } from "vitest";

import { COMPLETION_COLLAPSE_START_TICK, createWorld } from "../../src/simulation/world";

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

    for (let tick = 0; tick < COMPLETION_COLLAPSE_START_TICK + 8; tick += 1) {
      world.step();
    }

    const completedCount = countCollapseCells(world);

    for (let tick = 0; tick < 8; tick += 1) {
      world.step();
    }

    expect(world.snapshot().isCollapseActive).toBe(true);
    expect(countCollapseCells(world)).toBe(completedCount);
  });

  it("keeps normal materials moving while the completion text falls in", () => {
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
      width: 8,
    });

    world.setCell(2, 3, "water");
    world.setCell(0, 0, "sand");
    world.step();

    expect(world.snapshot().isComplete).toBe(true);
    expect(world.snapshot().isCollapseActive).toBe(false);
    expect(world.getCell(0, 1)).toBe("sand");

    world.step();

    expect(world.snapshot().isCollapseActive).toBe(false);
    expect(world.getCell(0, 2)).toBe("sand");
  });

  it("releases visible completion grains from left to right", () => {
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
      width: 8,
    });

    world.setCell(2, 3, "water");
    world.addLineCell(0, 0);
    world.addLineCell(7, 0);
    world.step();

    for (let tick = 1; tick < COMPLETION_COLLAPSE_START_TICK; tick += 1) {
      world.step();
    }

    const firstCollapseSnapshot = world.snapshot();
    const rightFireIndex = 7;

    expect(firstCollapseSnapshot.isCollapseActive).toBe(true);
    expect(firstCollapseSnapshot.collapseCells[0]).toBe(0);
    expect(firstCollapseSnapshot.collapseCells[rightFireIndex]).toBe("solid");

    for (let tick = 0; tick < 4; tick += 1) {
      world.step();
    }

    expect(world.snapshot().collapseCells[rightFireIndex]).toBe(0);
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
    world.setCell(6, 1, "ash");
    world.addLineCell(0, 3);
    world.step();

    for (let tick = 1; tick < COMPLETION_COLLAPSE_START_TICK; tick += 1) {
      world.step();
    }

    const snapshot = world.snapshot();

    expect(snapshot.isComplete).toBe(true);
    expect(snapshot.isCollapseActive).toBe(true);
    expect(countCollapseCells(world, "sand")).toBe(1);
    expect(countCollapseCells(world, "water")).toBe(1);
    expect(countCollapseCells(world, "ash")).toBe(1);
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
    world.setCell(5, 0, "ash");
    world.step();

    for (let tick = 1; tick < COMPLETION_COLLAPSE_START_TICK; tick += 1) {
      world.step();
    }

    const ashCount = countCollapseCells(world, "ash");
    const waterCount = countCollapseCells(world, "water");

    for (let tick = 0; tick < 8; tick += 1) {
      world.step();
    }

    expect(countCollapseCells(world, "ash")).toBe(ashCount);
    expect(countCollapseCells(world, "water")).toBe(waterCount);
  });
});
