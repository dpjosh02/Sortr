import { describe, expect, it } from "vitest";

import { FIRE_TTL, createWorld } from "../../src/simulation/world";

import { countElementCells, totalWater } from "./worldTestHelpers";

describe("world reactions and fire", () => {
  it("turns water and fire neighbors into steam", () => {
    const world = createWorld({
      emitters: [],
      height: 4,
      seed: 1,
      width: 4,
    });

    world.setCell(1, 1, "water");
    world.setCell(2, 1, "fire");
    world.step();

    expect(totalWater(world)).toBeCloseTo(0);
    expect(countElementCells(world, "fire")).toBe(0);
    expect(countElementCells(world, "steam")).toBe(1);
  });

  it("turns water touching a hearth heat zone into steam", () => {
    const world = createWorld({
      emitters: [],
      hearths: [
        {
          flameRatePerTick: 0,
          heatRadius: 1,
          id: "hearth",
          rect: {
            height: 1,
            width: 3,
            x: 1,
            y: 3,
          },
        },
      ],
      height: 5,
      seed: 1,
      width: 5,
    });

    world.setCell(2, 2, "water");
    world.step();

    expect(totalWater(world)).toBeCloseTo(0);
    expect(countElementCells(world, "steam")).toBe(1);
    expect(world.snapshot().hearths).toHaveLength(1);
  });

  it("processes hearth heat before water and fire contact reactions", () => {
    const world = createWorld({
      emitters: [],
      hearths: [
        {
          flameRatePerTick: 0,
          heatRadius: 1,
          id: "hearth",
          rect: {
            height: 1,
            width: 3,
            x: 1,
            y: 4,
          },
        },
      ],
      height: 5,
      seed: 1,
      width: 5,
    });

    world.setCell(2, 3, "water");
    world.setCell(3, 3, "fire");
    world.step();

    expect(totalWater(world)).toBeCloseTo(0);
    expect(countElementCells(world, "steam")).toBe(1);
    expect(countElementCells(world, "fire")).toBe(1);
  });

  it("turns dirt touching water into mud", () => {
    const world = createWorld({
      emitters: [],
      height: 4,
      seed: 1,
      width: 4,
    });

    world.setCell(1, 1, "water");
    world.setCell(2, 1, "dirt");
    world.step();

    expect(totalWater(world)).toBeCloseTo(0);
    expect(countElementCells(world, "dirt")).toBe(0);
    expect(countElementCells(world, "mud")).toBe(1);
  });

  it("prioritizes steam when water touches fire before dirt can consume it", () => {
    const world = createWorld({
      emitters: [],
      height: 4,
      seed: 1,
      width: 4,
    });

    world.setCell(1, 1, "water");
    world.setCell(2, 1, "fire");
    world.setCell(1, 2, "dirt");
    world.step();

    expect(totalWater(world)).toBeCloseTo(0);
    expect(countElementCells(world, "steam")).toBe(1);
    expect(countElementCells(world, "mud")).toBe(0);
    expect(countElementCells(world, "dirt")).toBe(1);
  });

  it("heats mud into steam and dirt", () => {
    const world = createWorld({
      emitters: [],
      height: 4,
      seed: 1,
      width: 4,
    });

    world.setCell(1, 1, "fire");
    world.setCell(2, 1, "mud");
    world.step();

    expect(countElementCells(world, "fire")).toBe(0);
    expect(countElementCells(world, "mud")).toBe(0);
    expect(countElementCells(world, "steam")).toBe(1);
    expect(countElementCells(world, "dirt")).toBe(1);
  });

  it("uses water and fire before fire can dry neighboring mud", () => {
    const world = createWorld({
      emitters: [],
      height: 4,
      seed: 1,
      width: 4,
    });

    world.setCell(1, 1, "water");
    world.setCell(2, 1, "fire");
    world.setCell(2, 2, "mud");
    world.step();

    expect(countElementCells(world, "steam")).toBe(1);
    expect(countElementCells(world, "mud")).toBe(1);
    expect(countElementCells(world, "dirt")).toBe(0);
  });

  it("burns dirt into smoke and ash", () => {
    const world = createWorld({
      emitters: [],
      height: 4,
      seed: 1,
      width: 4,
    });

    world.setCell(1, 1, "fire");
    world.setCell(2, 1, "dirt");
    world.step();

    expect(countElementCells(world, "fire")).toBe(0);
    expect(countElementCells(world, "dirt")).toBe(0);
    expect(countElementCells(world, "smoke")).toBe(1);
    expect(countElementCells(world, "ash")).toBe(1);
  });

  it("burns dirt before nearby water can turn it into mud", () => {
    const world = createWorld({
      emitters: [],
      height: 4,
      seed: 1,
      width: 4,
    });

    world.setCell(1, 1, "fire");
    world.setCell(2, 1, "dirt");
    world.setCell(3, 1, "water");
    world.step();

    expect(countElementCells(world, "smoke")).toBe(1);
    expect(countElementCells(world, "ash")).toBe(1);
    expect(countElementCells(world, "mud")).toBe(0);
    expect(totalWater(world)).toBeCloseTo(1);
  });

  it("blocks falling particles with hearth solids", () => {
    const world = createWorld({
      emitters: [],
      hearths: [
        {
          flameRatePerTick: 0,
          id: "hearth",
          rect: {
            height: 1,
            width: 3,
            x: 1,
            y: 3,
          },
        },
      ],
      height: 5,
      seed: 1,
      width: 5,
    });

    world.setCell(2, 2, "sand");
    world.step();

    expect(world.getCell(2, 2)).toBe("sand");
  });

  it("emits flame particles from a hearth base", () => {
    const world = createWorld({
      emitters: [],
      hearths: [
        {
          flameRatePerTick: 1,
          id: "hearth",
          rect: {
            height: 1,
            width: 3,
            x: 1,
            y: 3,
          },
        },
      ],
      height: 5,
      seed: 1,
      width: 5,
    });

    world.step();

    expect(countElementCells(world, "fire")).toBe(1);
    expect(Math.max(...world.snapshot().fireLife)).toBe(FIRE_TTL - 1);
  });

  it("lets fire particles exit through the top edge", () => {
    const world = createWorld({
      emitters: [],
      height: 3,
      seed: 1,
      width: 3,
    });

    world.setCell(1, 0, "fire");
    world.step();

    expect(countElementCells(world, "fire")).toBe(0);
  });

  it("expires fire particles after their short lifetime", () => {
    const world = createWorld({
      emitters: [],
      height: 4,
      seed: 1,
      width: 1,
    });

    world.addLineCell(0, 1);
    world.setCell(0, 2, "fire");

    world.step();

    expect(world.getCell(0, 2)).toBe("fire");
    expect(world.snapshot().fireLife[2]).toBe(FIRE_TTL - 1);

    for (let index = 0; index < FIRE_TTL - 1; index += 1) {
      world.step();
    }

    expect(countElementCells(world, "fire")).toBe(0);
  });

  it("moves steam upward and blocks it with drawn lines", () => {
    const world = createWorld({
      emitters: [],
      height: 4,
      seed: 1,
      width: 3,
    });

    world.setCell(1, 2, "steam");
    world.step();

    expect(world.getCell(1, 1)).toBe("steam");

    world.addLineSegment({ x: 0, y: 0 }, { x: 2, y: 0 });
    world.step();

    expect(world.getCell(1, 0)).toBe(-1);
  });
});
