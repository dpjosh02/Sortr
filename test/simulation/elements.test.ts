import { describe, expect, it } from "vitest";

import {
  ELEMENTS,
  getElementPalette,
  getElementsByBehavior,
  usesLiquidLayer,
} from "../../src/simulation/elements";
import {
  REACTION_RULES,
  getHearthHeatReactionRules,
  getNeighborContactReactionRules,
} from "../../src/simulation/reactionRules";

describe("element registry", () => {
  it("keeps current elements registered with behavior categories", () => {
    expect(ELEMENTS).toEqual(["water", "sand", "fire", "steam", "dirt", "mud", "smoke", "ash"]);
    expect(getElementsByBehavior("liquid-flow")).toEqual(["water"]);
    expect(getElementsByBehavior("powder-fall")).toEqual(["sand", "dirt", "mud", "ash"]);
    expect(getElementsByBehavior("gas-rise")).toEqual(["steam", "smoke"]);
    expect(getElementsByBehavior("energy-rise")).toEqual(["fire"]);
  });

  it("marks water as liquid-layer storage while particles stay in the cell grid", () => {
    expect(usesLiquidLayer("water")).toBe(true);
    expect(usesLiquidLayer("sand")).toBe(false);
    expect(usesLiquidLayer("steam")).toBe(false);
    expect(usesLiquidLayer("fire")).toBe(false);
    expect(usesLiquidLayer("dirt")).toBe(false);
    expect(usesLiquidLayer("mud")).toBe(false);
    expect(usesLiquidLayer("smoke")).toBe(false);
    expect(usesLiquidLayer("ash")).toBe(false);
  });

  it("keeps renderer palettes in element registry data", () => {
    expect(getElementPalette("water")[0]).toBe("#4f9fd9");
    expect(getElementPalette("sand")[0]).toBe("#d7bd72");
    expect(getElementPalette("fire")[0]).toBe("#f26d3d");
    expect(getElementPalette("steam")[0]).toBe("#d8dde1");
    expect(getElementPalette("dirt")[0]).toBe("#8a6a45");
    expect(getElementPalette("mud")[0]).toBe("#5f4a38");
    expect(getElementPalette("smoke")[0]).toBe("#8b8f91");
    expect(getElementPalette("ash")[0]).toBe("#6f6a62");
  });
});

describe("reaction rule registry", () => {
  it("keeps reaction rule order deterministic for future chemistry chains", () => {
    expect(REACTION_RULES.map((rule) => rule.id)).toEqual([
      "water-fire-to-steam",
      "fire-mud-to-steam-dirt",
      "fire-dirt-to-smoke-ash",
      "dirt-water-to-mud",
      "hearth-heat-water-to-steam",
    ]);
  });

  it("registers the current water and fire contact reaction", () => {
    expect(getNeighborContactReactionRules()).toEqual([
      {
        consumeNeighbor: true,
        consumeSource: true,
        id: "water-fire-to-steam",
        kind: "neighbor-contact",
        neighbor: {
          element: "water",
          storage: "liquid-layer",
        },
        products: [
          {
            element: "steam",
            location: "source-cell",
          },
        ],
        source: {
          element: "fire",
          storage: "particle",
        },
      },
      {
        consumeNeighbor: true,
        consumeSource: true,
        id: "fire-mud-to-steam-dirt",
        kind: "neighbor-contact",
        neighbor: {
          element: "mud",
          storage: "particle",
        },
        products: [
          {
            element: "steam",
            location: "source-cell",
          },
          {
            element: "dirt",
            location: "neighbor-cell",
          },
        ],
        source: {
          element: "fire",
          storage: "particle",
        },
      },
      {
        consumeNeighbor: true,
        consumeSource: true,
        id: "fire-dirt-to-smoke-ash",
        kind: "neighbor-contact",
        neighbor: {
          element: "dirt",
          storage: "particle",
        },
        products: [
          {
            element: "smoke",
            location: "source-cell",
          },
          {
            element: "ash",
            location: "neighbor-cell",
          },
        ],
        source: {
          element: "fire",
          storage: "particle",
        },
      },
      {
        consumeNeighbor: true,
        consumeSource: true,
        id: "dirt-water-to-mud",
        kind: "neighbor-contact",
        neighbor: {
          element: "water",
          storage: "liquid-layer",
        },
        products: [
          {
            element: "mud",
            location: "source-cell",
          },
        ],
        source: {
          element: "dirt",
          storage: "particle",
        },
      },
    ]);
  });

  it("registers hearth heat as water to steam", () => {
    expect(getHearthHeatReactionRules()).toEqual([
      {
        consumeReactant: true,
        id: "hearth-heat-water-to-steam",
        kind: "hearth-heat",
        products: [
          {
            element: "steam",
            location: "heated-cell",
          },
        ],
        reactant: {
          element: "water",
          storage: "liquid-layer",
        },
      },
    ]);
  });
});
