import {
  DRAWN_LINE_CELL,
  EMPTY_CELL,
  type CellValue,
  type ElementType,
  isElement,
  isEmpty,
} from "../elements";
import { createEmitterState } from "../emitters";
import { getLineCells } from "../lines";
import { createSeededRandom } from "../random";

import {
  createBucketSnapshots,
  createBucketState,
  isWorldComplete,
  processBuckets,
} from "./buckets";
import { spawnFromEmitters } from "./emittersSystem";
import {
  assertPositiveInteger,
  clearElementCell,
  getVisibleCell,
  getWaterAmount,
  isInside,
  setElementCell,
  toIndex,
} from "./grid";
import { createHearthSnapshots, createHearthState, processHearths } from "./hearths";
import { ageFireParticles, moveParticles } from "./movement";
import { processReactions } from "./reactions";
import { isHearthSolidCell, isStaticSolidCell } from "./solids";
import {
  FIRE_TTL,
  MAX_WATER,
  MIN_WATER,
  PRESSURE_DISPLACEMENT_SEARCH_RADIUS,
  type MutableWorldState,
  type ParticleCount,
  type World,
  type WorldDefinition,
  type WorldSnapshot,
} from "./types";
import { displaceWaterForSolid } from "./water";

export type {
  BucketDefinition,
  BucketSnapshot,
  GridRect,
  HearthDefinition,
  HearthSnapshot,
  ParticleCount,
  World,
  WorldDefinition,
  WorldSnapshot,
} from "./types";
export { FIRE_TTL };

export function createWorld(definition: WorldDefinition): World {
  assertPositiveInteger("width", definition.width);
  assertPositiveInteger("height", definition.height);

  const state: MutableWorldState = {
    buckets: definition.buckets?.map(createBucketState) ?? [],
    cells: Array<CellValue>(definition.width * definition.height).fill(EMPTY_CELL),
    emitters: definition.emitters.map(createEmitterState),
    fireLife: Array<number>(definition.width * definition.height).fill(0),
    height: definition.height,
    hearths: definition.hearths?.map(createHearthState) ?? [],
    random: createSeededRandom(definition.seed),
    tick: 0,
    water: Array<number>(definition.width * definition.height).fill(0),
    width: definition.width,
  };

  return {
    get height(): number {
      return state.height;
    },
    get tick(): number {
      return state.tick;
    },
    get width(): number {
      return state.width;
    },
    addElementCell(x: number, y: number, element): void {
      addElementCell(state, x, y, element);
    },
    addLineCell(x: number, y: number): void {
      addLineCell(state, x, y);
    },
    addLineSegment(start, end): void {
      for (const cell of getLineCells(start, end)) {
        addLineCell(state, cell.x, cell.y);
      }
    },
    getCell(x: number, y: number): CellValue {
      if (!isInside(state, x, y)) {
        return EMPTY_CELL;
      }

      return getVisibleCell(state, x, y);
    },
    setCell(x: number, y: number, value: CellValue): void {
      setCell(state, x, y, value);
    },
    snapshot(): WorldSnapshot {
      return createSnapshot(state);
    },
    step(): void {
      spawnFromEmitters(state);
      processHearths(state, true);
      processBuckets(state);
      processReactions(state);
      moveParticles(state);
      ageFireParticles(state);
      processHearths(state, false);
      processBuckets(state);
      state.tick += 1;
    },
  };
}

function addElementCell(
  state: MutableWorldState,
  x: number,
  y: number,
  element: ElementType,
): void {
  if (!isInside(state, x, y) || isStaticSolidCell(state, x, y)) {
    return;
  }

  const index = toIndex(state, x, y);
  const cell = state.cells[index] ?? EMPTY_CELL;

  if (!isEmpty(cell)) {
    return;
  }

  if (element === "water") {
    state.fireLife[index] = 0;
    state.water[index] = Math.min(MAX_WATER, (state.water[index] ?? 0) + MAX_WATER);
    return;
  }

  const waterAmount = getWaterAmount(state, x, y);

  if (
    waterAmount > MIN_WATER &&
    !displaceWaterForSolid(
      state,
      Array<boolean>(state.cells.length).fill(false),
      x,
      y,
      waterAmount,
      {
        ignoreDisplacedWater: true,
        searchRadius: PRESSURE_DISPLACEMENT_SEARCH_RADIUS,
      },
    )
  ) {
    return;
  }

  state.water[index] = 0;
  setElementCell(state, index, element);
}

function addLineCell(state: MutableWorldState, x: number, y: number): void {
  if (!isInside(state, x, y) || isHearthSolidCell(state, x, y)) {
    return;
  }

  const index = toIndex(state, x, y);
  state.cells[index] = DRAWN_LINE_CELL;
  state.fireLife[index] = 0;
}

function setCell(state: MutableWorldState, x: number, y: number, value: CellValue): void {
  if (!isInside(state, x, y)) {
    throw new Error(`Cell coordinate is outside the world: ${String(x)},${String(y)}.`);
  }

  const index = toIndex(state, x, y);

  if (value === "water") {
    clearElementCell(state, index);
    state.water[index] = MAX_WATER;
    return;
  }

  state.cells[index] = value;
  state.fireLife[index] = value === "fire" ? FIRE_TTL : 0;
  state.water[index] = 0;
}

function createSnapshot(state: MutableWorldState): WorldSnapshot {
  return {
    buckets: createBucketSnapshots(state.buckets),
    cells: [...state.cells],
    fireLife: [...state.fireLife],
    hearths: createHearthSnapshots(state.hearths),
    height: state.height,
    isComplete: isWorldComplete(state),
    particleCounts: countParticles(state),
    tick: state.tick,
    water: [...state.water],
    width: state.width,
  };
}

function countParticles(state: MutableWorldState): ParticleCount[] {
  const counts = new Map<ElementType, number>();

  for (const cell of state.cells) {
    if (!isElement(cell)) {
      continue;
    }

    counts.set(cell, (counts.get(cell) ?? 0) + 1);
  }

  const waterCells = state.water.filter((amount) => amount > MIN_WATER).length;

  if (waterCells > 0) {
    counts.set("water", waterCells);
  }

  return [...counts.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([element, count]) => ({ count, element }));
}
