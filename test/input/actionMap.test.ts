import { describe, expect, it } from "vitest";

import { createActionMap } from "../../src/input/actionMap";

describe("createActionMap", () => {
  it("maps only player-facing keyboard actions", () => {
    expect(createActionMap().keyboard).toEqual({
      r: "reset",
    });
  });
});
