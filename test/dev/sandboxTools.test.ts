import { describe, expect, it } from "vitest";

import {
  DEV_SANDBOX_ELEMENTS,
  createDevSandboxStamp,
  getDevSandboxBrushCells,
  getDevSandboxElementForKey,
  isDevToolsToggleKey,
} from "../../src/dev/sandboxTools";
import { ELEMENTS } from "../../src/simulation/elements";

describe("dev sandbox tools", () => {
  it("keeps sandbox element choices out of player action mapping", () => {
    expect(DEV_SANDBOX_ELEMENTS).toEqual(ELEMENTS);
    expect(isDevToolsToggleKey("d")).toBe(true);
    expect(isDevToolsToggleKey("r")).toBe(false);
    expect(getDevSandboxElementForKey("1")).toBe("water");
    expect(getDevSandboxElementForKey("4")).toBe("steam");
    expect(getDevSandboxElementForKey("5")).toBe("dirt");
    expect(getDevSandboxElementForKey("6")).toBe("mud");
    expect(getDevSandboxElementForKey("7")).toBeNull();
  });

  it("uses the existing plus-shaped sandbox brush stamp", () => {
    expect(getDevSandboxBrushCells({ x: 10, y: 20 })).toEqual([
      { x: 10, y: 19 },
      { x: 9, y: 20 },
      { x: 10, y: 20 },
      { x: 11, y: 20 },
      { x: 10, y: 21 },
    ]);
  });

  it("stamps every cell along a sandbox pointer segment", () => {
    expect(createDevSandboxStamp("sand", { x: 1, y: 1 }, { x: 2, y: 1 })).toEqual({
      cells: [
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 1, y: 2 },
        { x: 2, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 3, y: 1 },
        { x: 2, y: 2 },
      ],
      element: "sand",
    });
  });
});
