import { EMPTY_CELL, isDrawnLine, isEmpty } from "../elements";

import { getCellUnchecked, isInside, isPointInRect, toIndex } from "./grid";
import type { BucketDefinition, MutableWorldState } from "./types";

export function canContainWater(state: MutableWorldState, x: number, y: number): boolean {
  if (!isInside(state, x, y)) {
    return false;
  }

  return (
    isEmpty(state.cells[toIndex(state, x, y)] ?? EMPTY_CELL) && !isStaticSolidCell(state, x, y)
  );
}

export function isStaticSolidCell(state: MutableWorldState, x: number, y: number): boolean {
  return isBucketWallCell(state, x, y) || isHearthSolidCell(state, x, y);
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
