import { describe, expect, it } from "vitest";

import { getCanvasGridPoint } from "../../src/input/pointer";

describe("getCanvasGridPoint", () => {
  it("maps client coordinates into clamped grid coordinates", () => {
    const canvas = {
      getBoundingClientRect: () => ({
        bottom: 240,
        height: 200,
        left: 100,
        right: 500,
        top: 40,
        width: 400,
        x: 100,
        y: 40,
        toJSON: () => ({}),
      }),
    } as HTMLCanvasElement;

    expect(
      getCanvasGridPoint({
        canvas,
        clientX: 300,
        clientY: 140,
        gridHeight: 100,
        gridWidth: 200,
      }),
    ).toEqual({ x: 100, y: 50 });

    expect(
      getCanvasGridPoint({
        canvas,
        clientX: 900,
        clientY: -100,
        gridHeight: 100,
        gridWidth: 200,
      }),
    ).toEqual({ x: 199, y: 0 });
  });
});
