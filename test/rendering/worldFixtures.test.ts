import { describe, expect, it } from "vitest";

import {
  DEFAULT_EMITTER_FIXTURE_BY_ELEMENT,
  getEmitterFixtureType,
} from "../../src/rendering/worldFixtures";
import type { EmitterDefinition } from "../../src/simulation/emitters";

describe("emitter fixtures", () => {
  it("maps each element to a distinct readable fixture by default", () => {
    expect(DEFAULT_EMITTER_FIXTURE_BY_ELEMENT).toEqual({
      ash: "ash-sifter",
      dirt: "clay-chute",
      fire: "charcoal-bed",
      glass: "glass-kiln",
      mud: "slurry-pipe",
      sand: "sand-pump",
      smoke: "soot-vent",
      steam: "copper-vent",
      water: "hose",
    });
  });

  it("lets level data override fixture art without changing spawned element", () => {
    const emitter: EmitterDefinition = {
      edge: "top",
      element: "water",
      fixture: "copper-vent",
      id: "test-source",
      range: {
        end: 2,
        start: 1,
      },
      ratePerTick: 1,
    };

    expect(getEmitterFixtureType(emitter)).toBe("copper-vent");
  });

  it("falls back to the element fixture when no override is authored", () => {
    expect(
      getEmitterFixtureType({
        edge: "top",
        element: "sand",
        id: "sand-source",
        range: {
          end: 2,
          start: 1,
        },
        ratePerTick: 1,
      }),
    ).toBe("sand-pump");
  });
});
