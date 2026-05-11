import {
  DRAWN_LINE_CELL,
  EMPTY_CELL,
  type CellValue,
  type ElementType,
  isElement,
  isEmpty,
  usesLiquidLayer,
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
import { moveCompletionCollapse, startCompletionCollapse } from "./collapse";
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
import { createStaticSolidCells, isHearthSolidCell, isStaticSolidCell } from "./solids";
import {
  FIRE_TTL,
  MAX_WATER,
  MIN_WATER,
  PRESSURE_DISPLACEMENT_SEARCH_RADIUS,
  type CollapseCell,
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
  CollapseCell,
  GridRect,
  HearthDefinition,
  HearthSnapshot,
  ObstacleDefinition,
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
    collapseCells: Array<0>(definition.width * definition.height).fill(EMPTY_CELL),
    emitters: definition.emitters.map(createEmitterState),
    fireLife: Array<number>(definition.width * definition.height).fill(0),
    height: definition.height,
    hearths: definition.hearths?.map(createHearthState) ?? [],
    obstacles: definition.obstacles ?? [],
    random: createSeededRandom(definition.seed),
    isComplete: false,
    staticSolids: createStaticSolidCells(definition),
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
      if (state.isComplete) {
        return;
      }

      addElementCell(state, x, y, element);
    },
    addLineCell(x: number, y: number): void {
      if (state.isComplete) {
        return;
      }

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

      if (state.isComplete) {
        return getCollapseVisibleCell(state, x, y);
      }

      return getVisibleCell(state, x, y);
    },
    setCell(x: number, y: number, value: CellValue): void {
      if (state.isComplete) {
        return;
      }

      setCell(state, x, y, value);
    },
    snapshot(): WorldSnapshot {
      return createSnapshot(state);
    },
    step(): void {
      if (state.isComplete) {
        moveCompletionCollapse(state);
        state.tick += 1;
        return;
      }

      spawnFromEmitters(state);
      processHearths(state, true);
      processBuckets(state);
      processReactions(state);
      moveParticles(state);
      ageFireParticles(state);
      processHearths(state, false);
      processBuckets(state);

      if (isWorldComplete(state)) {
        state.isComplete = true;
        startCompletionCollapse(state);
        moveCompletionCollapse(state);
      }

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

  if (usesLiquidLayer(element)) {
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

  if (isElement(value) && usesLiquidLayer(value)) {
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
    collapseCells: [...state.collapseCells],
    fireLife: [...state.fireLife],
    hearths: createHearthSnapshots(state.hearths),
    height: state.height,
    isCollapseActive: state.isComplete,
    isComplete: state.isComplete || isWorldComplete(state),
    obstacles: state.obstacles,
    particleCounts: countParticles(state),
    tick: state.tick,
    water: [...state.water],
    width: state.width,
  };
}

function countParticles(state: MutableWorldState): ParticleCount[] {
  const counts = new Map<ElementType, number>();

  if (state.isComplete) {
    for (const cell of state.collapseCells) {
      if (isCollapseElement(cell)) {
        counts.set(cell, (counts.get(cell) ?? 0) + 1);
      }
    }

    return createParticleCountList(counts);
  }

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

  return createParticleCountList(counts);
}

function createParticleCountList(counts: Map<ElementType, number>): ParticleCount[] {
  return [...counts.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([element, count]) => ({ count, element }));
}

function getCollapseVisibleCell(state: MutableWorldState, x: number, y: number): CellValue {
  const collapseCell = state.collapseCells[toIndex(state, x, y)] ?? EMPTY_CELL;

  if (isCollapseElement(collapseCell)) {
    return collapseCell;
  }

  return collapseCell === "solid" ? DRAWN_LINE_CELL : EMPTY_CELL;
}

function isCollapseElement(cell: CollapseCell): cell is ElementType {
  return cell !== EMPTY_CELL && cell !== "solid";
}
