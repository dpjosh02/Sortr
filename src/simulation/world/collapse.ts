import { EMPTY_CELL, isDrawnLine, isElement, isEmpty } from "../elements";

import { clearElementCell, getWaterAmount, toIndex } from "./grid";
import { isStaticSolidCell } from "./solids";
import {
  COLLAPSE_RELEASE_COLUMNS_PER_TICK,
  MIN_WATER,
  type CollapseCell,
  type MutableWorldState,
} from "./types";

export function startCompletionCollapse(state: MutableWorldState): void {
  state.collapseReleaseColumn = 0;
  state.isCollapseActive = true;

  for (let y = 0; y < state.height; y += 1) {
    for (let x = 0; x < state.width; x += 1) {
      const index = toIndex(state, x, y);
      state.collapseCells[index] = getCollapseCellForPosition(state, x, y);
      clearElementCell(state, index);
      state.water[index] = 0;
    }
  }
}

export function moveCompletionCollapse(state: MutableWorldState): void {
  advanceCompletionCollapseRelease(state);

  const moved = Array<boolean>(state.collapseCells.length).fill(false);

  for (let y = state.height - 1; y >= 0; y -= 1) {
    const leftToRight = state.random.pickDirection() === 1;

    for (let column = 0; column < state.width; column += 1) {
      const x = leftToRight ? column : state.width - 1 - column;
      const index = toIndex(state, x, y);

      if (
        x >= state.collapseReleaseColumn ||
        state.collapseCells[index] === EMPTY_CELL ||
        moved[index] === true
      ) {
        continue;
      }

      const side = state.random.pickDirection();
      const targets = [
        { x, y: y + 1 },
        { x: x + side, y: y + 1 },
        { x: x - side, y: y + 1 },
      ];

      for (const target of targets) {
        if (tryMoveCollapseCell(state, moved, index, target.x, target.y)) {
          break;
        }
      }
    }
  }
}

function advanceCompletionCollapseRelease(state: MutableWorldState): void {
  state.collapseReleaseColumn = Math.min(
    state.width,
    state.collapseReleaseColumn + COLLAPSE_RELEASE_COLUMNS_PER_TICK,
  );
}

function getCollapseCellForPosition(state: MutableWorldState, x: number, y: number): CollapseCell {
  if (isStaticSolidCell(state, x, y)) {
    return "solid";
  }

  const index = toIndex(state, x, y);
  const cell = state.cells[index] ?? EMPTY_CELL;

  if (isElement(cell)) {
    return cell;
  }

  if (isDrawnLine(cell)) {
    return "solid";
  }

  if (isEmpty(cell) && getWaterAmount(state, x, y) > MIN_WATER) {
    return "water";
  }

  return EMPTY_CELL;
}

function tryMoveCollapseCell(
  state: MutableWorldState,
  moved: boolean[],
  fromIndex: number,
  targetX: number,
  targetY: number,
): boolean {
  if (targetX < 0 || targetX >= state.width || targetY < 0 || targetY >= state.height) {
    return false;
  }

  if (targetX >= state.collapseReleaseColumn) {
    return false;
  }

  const targetIndex = toIndex(state, targetX, targetY);

  if (state.collapseCells[targetIndex] !== EMPTY_CELL) {
    return false;
  }

  state.collapseCells[targetIndex] = state.collapseCells[fromIndex] ?? EMPTY_CELL;
  state.collapseCells[fromIndex] = EMPTY_CELL;
  moved[targetIndex] = true;
  return true;
}
