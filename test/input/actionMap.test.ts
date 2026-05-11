import { describe, expect, it } from "vitest";

import { createActionMap } from "../../src/input/actionMap";

describe("createActionMap", () => {
  it("maps reset and debug keyboard actions explicitly", () => {
    expect(createActionMap().keyboard).toEqual({
      d: "toggle-debug",
      r: "reset",
    });
  });
});
