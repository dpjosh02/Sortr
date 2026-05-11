import { EMPTY_CELL, type CellValue, type ElementType, isEmpty } from "../elements";

import { FIRE_TTL, type GridRect, type MutableWorldState } from "./types";

export function toIndex(state: MutableWorldState, x: number, y: number): number {
  return y * state.width + x;
}

export function isInside(state: MutableWorldState, x: number, y: number): boolean {
  return x >= 0 && x < state.width && y >= 0 && y < state.height;
}

export function getCellUnchecked(state: MutableWorldState, x: number, y: number): CellValue {
  if (!isInside(state, x, y)) {
    return EMPTY_CELL;
  }

  return state.cells[toIndex(state, x, y)] ?? EMPTY_CELL;
}

export function getWaterAmount(state: MutableWorldState, x: number, y: number): number {
  if (!isInside(state, x, y)) {
    return 0;
  }

  return state.water[toIndex(state, x, y)] ?? 0;
}

export function getVisibleCell(state: MutableWorldState, x: number, y: number): CellValue {
  const cell = state.cells[toIndex(state, x, y)] ?? EMPTY_CELL;

  if (!isEmpty(cell)) {
    return cell;
  }

  return getWaterAmount(state, x, y) > 0.01 ? "water" : EMPTY_CELL;
}

export function setElementCell(
  state: MutableWorldState,
  index: number,
  element: ElementType,
): void {
  state.cells[index] = element;
  state.fireLife[index] = element === "fire" ? FIRE_TTL : 0;
}

export function clearElementCell(state: MutableWorldState, index: number): void {
  state.cells[index] = EMPTY_CELL;
  state.fireLife[index] = 0;
}

export function moveElementCell(
  state: MutableWorldState,
  fromIndex: number,
  targetIndex: number,
): void {
  const movingCell = state.cells[fromIndex] ?? EMPTY_CELL;
  state.cells[targetIndex] = movingCell;
  state.cells[fromIndex] = EMPTY_CELL;
  state.fireLife[targetIndex] = movingCell === "fire" ? (state.fireLife[fromIndex] ?? FIRE_TTL) : 0;
  state.fireLife[fromIndex] = 0;
}

export function clampCell(
  state: MutableWorldState,
  x: number,
  y: number,
): { readonly x: number; readonly y: number } | null {
  if (state.width <= 0 || state.height <= 0) {
    return null;
  }

  return {
    x: Math.min(Math.max(x, 0), state.width - 1),
    y: Math.min(Math.max(y, 0), state.height - 1),
  };
}

export function isPointInRect(rect: GridRect, x: number, y: number): boolean {
  return x >= rect.x && x < rect.x + rect.width && y >= rect.y && y < rect.y + rect.height;
}

export function assertPositiveInteger(name: string, value: number): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }
}
