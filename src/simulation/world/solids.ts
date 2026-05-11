import { EMPTY_CELL, isDrawnLine, isEmpty } from "../elements";
import { getLineCells } from "../lines";

import { getCellUnchecked, isInside, isPointInRect, toIndex } from "./grid";
import type {
  BucketDefinition,
  MutableWorldState,
  ObstacleDefinition,
  WorldDefinition,
} from "./types";

export function createStaticSolidCells(definition: WorldDefinition): ReadonlySet<number> {
  const cells = new Set<number>();

  for (const obstacle of definition.obstacles ?? []) {
    addObstacleCells(cells, definition.width, definition.height, obstacle);
  }

  return cells;
}

export function canContainWater(state: MutableWorldState, x: number, y: number): boolean {
  if (!isInside(state, x, y)) {
    return false;
  }

  return (
    isEmpty(state.cells[toIndex(state, x, y)] ?? EMPTY_CELL) && !isStaticSolidCell(state, x, y)
  );
}

export function isStaticSolidCell(state: MutableWorldState, x: number, y: number): boolean {
  if (!isInside(state, x, y)) {
    return true;
  }

  return (
    state.staticSolids.has(toIndex(state, x, y)) ||
    isBucketWallCell(state, x, y) ||
    isHearthSolidCell(state, x, y)
  );
}

export function isMovementBarrierCell(state: MutableWorldState, x: number, y: number): boolean {
  return isDrawnLine(getCellUnchecked(state, x, y)) || isStaticSolidCell(state, x, y);
}

export function isHearthSolidCell(state: MutableWorldState, x: number, y: number): boolean {
  for (const hearth of state.hearths) {
    if (isPointInRect(hearth.definition.rect, x, y)) {
      return true;
    }
  }

  return false;
}

export function isBucketWallCell(state: MutableWorldState, x: number, y: number): boolean {
  for (const bucket of state.buckets) {
    if (isBucketDefinitionWallCell(bucket.definition, x, y)) {
      return true;
    }
  }

  return false;
}

function isBucketDefinitionWallCell(bucket: BucketDefinition, x: number, y: number): boolean {
  const { rect } = bucket;
  const insideX = x >= rect.x && x < rect.x + rect.width;
  const insideY = y >= rect.y && y < rect.y + rect.height;

  if (!insideX || !insideY) {
    return false;
  }

  if (x === rect.x || x === rect.x + rect.width - 1) {
    return true;
  }

  if (bucket.intake === "bottom") {
    return y === rect.y;
  }

  return y === rect.y + rect.height - 1;
}

function addObstacleCells(
  cells: Set<number>,
  worldWidth: number,
  worldHeight: number,
  obstacle: ObstacleDefinition,
): void {
  if (obstacle.kind === "solid-rect") {
    addRectCells(cells, worldWidth, worldHeight, obstacle.rect);
    return;
  }

  addLineCells(cells, worldWidth, worldHeight, obstacle.line);
}

function addRectCells(
  cells: Set<number>,
  worldWidth: number,
  worldHeight: number,
  rect: { readonly height: number; readonly width: number; readonly x: number; readonly y: number },
): void {
  for (let y = rect.y; y < rect.y + rect.height; y += 1) {
    for (let x = rect.x; x < rect.x + rect.width; x += 1) {
      addStaticSolidCell(cells, worldWidth, worldHeight, x, y);
    }
  }
}

function addLineCells(
  cells: Set<number>,
  worldWidth: number,
  worldHeight: number,
  line: {
    readonly thickness: number;
    readonly x1: number;
    readonly x2: number;
    readonly y1: number;
    readonly y2: number;
  },
): void {
  const radius = Math.floor(Math.max(1, line.thickness) / 2);

  for (const point of getLineCells({ x: line.x1, y: line.y1 }, { x: line.x2, y: line.y2 })) {
    for (let y = point.y - radius; y <= point.y + radius; y += 1) {
      for (let x = point.x - radius; x <= point.x + radius; x += 1) {
        addStaticSolidCell(cells, worldWidth, worldHeight, x, y);
      }
    }
  }
}

function addStaticSolidCell(
  cells: Set<number>,
  worldWidth: number,
  worldHeight: number,
  x: number,
  y: number,
): void {
  if (x < 0 || x >= worldWidth || y < 0 || y >= worldHeight) {
    return;
  }

  cells.add(y * worldWidth + x);
}
