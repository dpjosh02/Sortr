import type { CellValue, ElementType } from "../elements";
import type { EmitterDefinition, EmitterState } from "../emitters";
import type { GridPoint } from "../lines";
import type { SeededRandom } from "../random";

export interface WorldDefinition {
  readonly width: number;
  readonly height: number;
  readonly seed: number;
  readonly emitters: readonly EmitterDefinition[];
  readonly buckets?: readonly BucketDefinition[];
  readonly hearths?: readonly HearthDefinition[];
  readonly obstacles?: readonly ObstacleDefinition[];
}

export interface GridRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface BucketDefinition {
  readonly id: string;
  readonly target: ElementType;
  readonly required: number;
  readonly rect: GridRect;
  readonly intake: "bottom" | "full-rect" | "top";
}

export interface HearthDefinition {
  readonly id: string;
  readonly rect: GridRect;
  readonly flameRatePerTick?: number;
  readonly heatRadius?: number;
}

export type ObstacleDefinition =
  | {
      readonly id: string;
      readonly kind: "solid-line";
      readonly line: {
        readonly x1: number;
        readonly y1: number;
        readonly x2: number;
        readonly y2: number;
        readonly thickness: number;
      };
    }
  | {
      readonly id: string;
      readonly kind: "solid-rect";
      readonly rect: GridRect;
    };

export interface ParticleCount {
  readonly element: ElementType;
  readonly count: number;
}

export interface WorldSnapshot {
  readonly width: number;
  readonly height: number;
  readonly tick: number;
  readonly cells: readonly CellValue[];
  readonly water: readonly number[];
  readonly fireLife: readonly number[];
  readonly buckets: readonly BucketSnapshot[];
  readonly hearths: readonly HearthSnapshot[];
  readonly obstacles: readonly ObstacleDefinition[];
  readonly collapseCells: readonly CollapseCell[];
  readonly isCollapseActive: boolean;
  readonly isComplete: boolean;
  readonly particleCounts: readonly ParticleCount[];
}

export type CollapseCell = 0 | ElementType | "solid";

export interface BucketSnapshot {
  readonly id: string;
  readonly target: ElementType;
  readonly required: number;
  readonly accepted: number;
  readonly settled: number;
  readonly rect: GridRect;
  readonly intake: "bottom" | "full-rect" | "top";
}

export interface HearthSnapshot {
  readonly id: string;
  readonly rect: GridRect;
  readonly flameRatePerTick: number;
  readonly heatRadius: number;
}

export interface World {
  readonly width: number;
  readonly height: number;
  readonly tick: number;
  addElementCell(x: number, y: number, element: ElementType): void;
  addLineCell(x: number, y: number): void;
  addLineSegment(start: GridPoint, end: GridPoint): void;
  getCell(x: number, y: number): CellValue;
  setCell(x: number, y: number, value: CellValue): void;
  step(): void;
  snapshot(): WorldSnapshot;
}

export interface MutableWorldState {
  readonly width: number;
  readonly height: number;
  readonly cells: CellValue[];
  readonly water: number[];
  readonly fireLife: number[];
  readonly random: SeededRandom;
  readonly emitters: EmitterState[];
  readonly buckets: BucketState[];
  readonly hearths: HearthState[];
  readonly obstacles: readonly ObstacleDefinition[];
  readonly staticSolids: ReadonlySet<number>;
  readonly collapseCells: CollapseCell[];
  isComplete: boolean;
  tick: number;
}

export interface BucketState {
  readonly definition: BucketDefinition;
  accepted: number;
  settled: number;
}

export interface HearthState {
  readonly definition: Required<HearthDefinition>;
  flameCarry: number;
}

export const MIN_WATER = 0.01;
export const MAX_WATER = 1;
export const WATER_FLOW_PASSES = 3;
export const WATER_SIDE_FLOW = 0.45;
export const WATER_EQUALIZE_FLOW = 0.25;
export const DISPLACEMENT_SEARCH_RADIUS = 10;
export const PRESSURE_DISPLACEMENT_SEARCH_RADIUS = 40;
export const SAND_PRESSURE_COLUMN_HEIGHT = 3;
export const SUBMERGED_SETTLE_DISTANCE = 12;
export const DEFAULT_HEARTH_FLAME_RATE = 0.35;
export const DEFAULT_HEARTH_HEAT_RADIUS = 2;
export const FIRE_TTL = 12;
