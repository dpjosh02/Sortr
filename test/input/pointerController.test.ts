import { describe, expect, it } from "vitest";

import { createPointerDrawAction } from "../../src/input/pointerController";

describe("createPointerDrawAction", () => {
  it("creates a point action for the first pointer stamp", () => {
    expect(createPointerDrawAction({ x: 2, y: 3 })).toEqual({
      kind: "draw-point",
      point: { x: 2, y: 3 },
    });
  });

  it("creates a segment action for pointer movement", () => {
    expect(createPointerDrawAction({ x: 2, y: 3 }, { x: 5, y: 3 })).toEqual({
      end: { x: 5, y: 3 },
      kind: "draw-segment",
      start: { x: 2, y: 3 },
    });
  });
});
