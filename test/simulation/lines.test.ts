import { describe, expect, it } from "vitest";

import { getLineCells } from "../../src/simulation/lines";

describe("getLineCells", () => {
  it("returns the exact cell for a point line", () => {
    expect(getLineCells({ x: 2, y: 3 }, { x: 2, y: 3 })).toEqual([{ x: 2, y: 3 }]);
  });

  it("interpolates horizontal cells", () => {
    expect(getLineCells({ x: 1, y: 2 }, { x: 4, y: 2 })).toEqual([
      { x: 1, y: 2 },
      { x: 2, y: 2 },
      { x: 3, y: 2 },
      { x: 4, y: 2 },
    ]);
  });

  it("interpolates diagonal cells", () => {
    expect(getLineCells({ x: 1, y: 1 }, { x: 4, y: 4 })).toEqual([
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 3 },
      { x: 4, y: 4 },
    ]);
  });

  it("interpolates in reverse direction", () => {
    expect(getLineCells({ x: 4, y: 2 }, { x: 1, y: 2 })).toEqual([
      { x: 4, y: 2 },
      { x: 3, y: 2 },
      { x: 2, y: 2 },
      { x: 1, y: 2 },
    ]);
  });
});
