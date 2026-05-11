import type { ElementType } from "./elements";

export type EmitterEdge = "top" | "right" | "bottom" | "left";

export type EmitterFixtureType =
  | "ash-sifter"
  | "charcoal-bed"
  | "clay-chute"
  | "copper-vent"
  | "glass-kiln"
  | "hose"
  | "sand-pump"
  | "slurry-pipe"
  | "soot-vent";

export interface EmitterDefinition {
  readonly id: string;
  readonly element: ElementType;
  readonly edge: EmitterEdge;
  readonly fixture?: EmitterFixtureType;
  readonly range: {
    readonly start: number;
    readonly end: number;
  };
  readonly ratePerTick: number;
}

export interface EmitterState {
  readonly definition: EmitterDefinition;
  carry: number;
}

export function createEmitterState(definition: EmitterDefinition): EmitterState {
  if (definition.ratePerTick < 0) {
    throw new Error(`Emitter "${definition.id}" has a negative rate.`);
  }

  if (definition.range.end < definition.range.start) {
    throw new Error(`Emitter "${definition.id}" has an invalid range.`);
  }

  return {
    carry: 0,
    definition,
  };
}
