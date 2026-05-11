import {
  EMPTY_CELL,
  canDisplace,
  getElementDefinition,
  getElementsByBehavior,
  isElement,
  isEmpty,
} from "../elements";
import type { ElementType } from "../elements";
import type { GridPoint } from "../lines";

import {
  clearElementCell,
  getWaterAmount,
  isInside,
  moveElementCell,
  setElementCell,
  toIndex,
} from "./grid";
import { getOrthogonalNeighbors } from "./neighbors";
import { isMovementBarrierCell, isStaticSolidCell } from "./solids";
import type { MutableWorldState } from "./types";
import {
  DISPLACEMENT_SEARCH_RADIUS,
  FIRE_TTL,
  MIN_WATER,
  PRESSURE_DISPLACEMENT_SEARCH_RADIUS,
  SAND_PRESSURE_COLUMN_HEIGHT,
  SUBMERGED_SETTLE_DISTANCE,
} from "./types";
import { displaceWaterForSolid, flowWater } from "./water";

export function moveParticles(state: MutableWorldState): void {
  const moved = Array<boolean>(state.cells.length).fill(false);
  const displacedWater = Array<boolean>(state.cells.length).fill(false);

  for (const element of getElementsByBehavior("powder-fall")) {
    moveParticleFamily(state, moved, displacedWater, element);
  }

  for (const element of getElementsByBehavior("gas-rise")) {
    moveParticleFamily(state, moved, displacedWater, element);
  }

  for (const element of getElementsByBehavior("energy-rise")) {
    moveParticleFamily(state, moved, displacedWater, element);
  }

  flowWater(state);
}

export function ageFireParticles(state: MutableWorldState): void {
  for (let index = 0; index < state.cells.length; index += 1) {
    if (state.cells[index] !== "fire") {
      state.fireLife[index] = 0;
      continue;
    }

    const remainingLife = (state.fireLife[index] ?? FIRE_TTL) - 1;

    if (remainingLife <= 0) {
      clearElementCell(state, index);
      continue;
    }

    state.fireLife[index] = remainingLife;
  }
}

function moveParticleFamily(
  state: MutableWorldState,
  moved: boolean[],
  displacedWater: boolean[],
  familyElement: ElementType,
): void {
  for (let y = state.height - 1; y >= 0; y -= 1) {
    const leftToRight = state.random.pickDirection() === 1;

    for (let column = 0; column < state.width; column += 1) {
      const x = leftToRight ? column : state.width - 1 - column;
      const index = toIndex(state, x, y);
      const element = state.cells[index];

      if (element === undefined || isEmpty(element) || moved[index] === true) {
        continue;
      }

      if (element !== familyElement) {
        continue;
      }

      const behavior = getElementDefinition(element).behavior;

      if (behavior === "powder-fall") {
        movePowder(state, moved, displacedWater, x, y, element);
      } else if (behavior === "gas-rise") {
        moveGas(state, moved, x, y);
      } else if (behavior === "energy-rise") {
        moveEnergy(state, moved, x, y);
      }
    }
  }
}

function movePowder(
  state: MutableWorldState,
  moved: boolean[],
  displacedWater: boolean[],
  x: number,
  y: number,
  element: ElementType,
): void {
  const side = state.random.pickDirection();
  const candidates = [
    { x, y: y + 1 },
    { x: x + side, y: y + 1 },
    { x: x - side, y: y + 1 },
  ];

  if (tryMoveToFirstAvailableCell(state, moved, displacedWater, x, y, candidates)) {
    return;
  }

  trySettleSubmergedPowder(state, moved, displacedWater, x, y, element);
}

function moveGas(state: MutableWorldState, moved: boolean[], x: number, y: number): void {
  const side = state.random.pickDirection();
  const candidates = [
    { x, y: y - 1 },
    { x: x + side, y: y - 1 },
    { x: x - side, y: y - 1 },
    { x: x + side, y },
    { x: x - side, y },
  ];

  tryMoveGasOrEnergyToFirstAvailableCell(state, moved, x, y, candidates);
}

function moveEnergy(state: MutableWorldState, moved: boolean[], x: number, y: number): void {
  if (y === 0) {
    clearElementCell(state, toIndex(state, x, y));
    return;
  }

  const side = state.random.pickDirection();
  const candidates = [
    { x, y: y - 1 },
    { x: x + side, y },
    { x: x - side, y },
  ];

  tryMoveGasOrEnergyToFirstAvailableCell(state, moved, x, y, candidates);
}

function tryMoveGasOrEnergyToFirstAvailableCell(
  state: MutableWorldState,
  moved: boolean[],
  fromX: number,
  fromY: number,
  candidates: readonly GridPoint[],
): void {
  const fromIndex = toIndex(state, fromX, fromY);
  const movingCell = state.cells[fromIndex] ?? EMPTY_CELL;

  if (!isElement(movingCell)) {
    return;
  }

  for (const candidate of candidates) {
    if (!canMoveIntoGasTarget(state, fromX, fromY, candidate)) {
      continue;
    }

    const targetIndex = toIndex(state, candidate.x, candidate.y);
    moveElementCell(state, fromIndex, targetIndex);
    moved[targetIndex] = true;
    return;
  }
}

function canMoveIntoGasTarget(
  state: MutableWorldState,
  fromX: number,
  fromY: number,
  candidate: GridPoint,
): boolean {
  if (!isInside(state, candidate.x, candidate.y)) {
    return false;
  }

  const targetCell = state.cells[toIndex(state, candidate.x, candidate.y)] ?? EMPTY_CELL;

  return (
    !isDiagonalCornerBlocked(state, fromX, fromY, candidate.x, candidate.y) &&
    !isStaticSolidCell(state, candidate.x, candidate.y) &&
    isEmpty(targetCell) &&
    getWaterAmount(state, candidate.x, candidate.y) <= MIN_WATER
  );
}

function tryMoveToFirstAvailableCell(
  state: MutableWorldState,
  moved: boolean[],
  displacedWater: boolean[],
  fromX: number,
  fromY: number,
  candidates: readonly GridPoint[],
): boolean {
  const fromIndex = toIndex(state, fromX, fromY);
  const movingCell = state.cells[fromIndex] ?? EMPTY_CELL;

  if (!isElement(movingCell)) {
    return false;
  }

  for (const candidate of candidates) {
    if (!isInside(state, candidate.x, candidate.y)) {
      continue;
    }

    if (tryMoveIntoEmptyCell(state, moved, fromIndex, movingCell, fromX, fromY, candidate)) {
      return true;
    }

    if (
      tryMoveIntoWaterCell(
        state,
        moved,
        displacedWater,
        fromIndex,
        movingCell,
        fromX,
        fromY,
        candidate,
      )
    ) {
      return true;
    }
  }

  return false;
}

function tryMoveIntoEmptyCell(
  state: MutableWorldState,
  moved: boolean[],
  fromIndex: number,
  movingCell: ElementType,
  fromX: number,
  fromY: number,
  candidate: GridPoint,
): boolean {
  const targetCell = state.cells[toIndex(state, candidate.x, candidate.y)] ?? EMPTY_CELL;
  const targetWater = getWaterAmount(state, candidate.x, candidate.y);

  if (
    isDiagonalCornerBlocked(state, fromX, fromY, candidate.x, candidate.y) ||
    isStaticSolidCell(state, candidate.x, candidate.y) ||
    !isEmpty(targetCell) ||
    targetWater > MIN_WATER
  ) {
    return false;
  }

  const targetIndex = toIndex(state, candidate.x, candidate.y);
  moveElementCell(state, fromIndex, targetIndex);
  moved[targetIndex] = true;
  return movingCell === state.cells[targetIndex];
}

function tryMoveIntoWaterCell(
  state: MutableWorldState,
  moved: boolean[],
  displacedWater: boolean[],
  fromIndex: number,
  movingCell: ElementType,
  fromX: number,
  fromY: number,
  candidate: GridPoint,
): boolean {
  const targetIndex = toIndex(state, candidate.x, candidate.y);
  const targetCell = state.cells[targetIndex] ?? EMPTY_CELL;
  const targetWater = getWaterAmount(state, candidate.x, candidate.y);

  if (
    isDiagonalCornerBlocked(state, fromX, fromY, candidate.x, candidate.y) ||
    isStaticSolidCell(state, candidate.x, candidate.y) ||
    !isEmpty(targetCell) ||
    targetWater <= MIN_WATER ||
    !canDisplace(movingCell, "water")
  ) {
    return false;
  }

  const hasPowderPressure =
    getElementDefinition(movingCell).behavior === "powder-fall" &&
    getPowderColumnHeight(state, fromX, fromY, movingCell) >= SAND_PRESSURE_COLUMN_HEIGHT;

  if (
    (!hasPowderPressure && displacedWater[targetIndex] === true) ||
    !displaceWaterForSolid(state, displacedWater, candidate.x, candidate.y, targetWater, {
      ignoreDisplacedWater: hasPowderPressure,
      searchRadius: hasPowderPressure
        ? PRESSURE_DISPLACEMENT_SEARCH_RADIUS
        : DISPLACEMENT_SEARCH_RADIUS,
    })
  ) {
    return false;
  }

  moveElementCell(state, fromIndex, targetIndex);
  state.water[targetIndex] = 0;
  moved[targetIndex] = true;
  return true;
}

function trySettleSubmergedPowder(
  state: MutableWorldState,
  moved: boolean[],
  displacedWater: boolean[],
  fromX: number,
  fromY: number,
  element: ElementType,
): void {
  if (!isPowderTouchingWater(state, fromX, fromY)) {
    return;
  }

  const target = findSubmergedPowderSettleTarget(state, fromX, fromY);

  if (target === null) {
    return;
  }

  const targetIndex = toIndex(state, target.x, target.y);
  const targetWater = getWaterAmount(state, target.x, target.y);

  if (
    targetWater <= MIN_WATER ||
    !displaceWaterForSolid(state, displacedWater, target.x, target.y, targetWater, {
      ignoreDisplacedWater: true,
      searchRadius: PRESSURE_DISPLACEMENT_SEARCH_RADIUS,
    })
  ) {
    return;
  }

  clearElementCell(state, toIndex(state, fromX, fromY));
  setElementCell(state, targetIndex, element);
  state.water[targetIndex] = 0;
  moved[targetIndex] = true;
}

function findSubmergedPowderSettleTarget(
  state: MutableWorldState,
  fromX: number,
  fromY: number,
): GridPoint | null {
  let best: GridPoint | null = null;

  for (let y = fromY + 1; y < state.height && y <= fromY + SUBMERGED_SETTLE_DISTANCE; y += 1) {
    const verticalCell = state.cells[toIndex(state, fromX, y)] ?? EMPTY_CELL;

    if (!isEmpty(verticalCell)) {
      break;
    }

    if (getWaterAmount(state, fromX, y) > MIN_WATER) {
      best = { x: fromX, y };
      continue;
    }

    if (best !== null) {
      break;
    }
  }

  return best;
}

function isPowderTouchingWater(state: MutableWorldState, x: number, y: number): boolean {
  for (const neighbor of getOrthogonalNeighbors(x, y)) {
    if (getWaterAmount(state, neighbor.x, neighbor.y) > MIN_WATER) {
      return true;
    }
  }

  return false;
}

function getPowderColumnHeight(
  state: MutableWorldState,
  x: number,
  y: number,
  element: ElementType,
): number {
  let height = 0;

  for (let scanY = y; scanY >= 0; scanY -= 1) {
    if (state.cells[toIndex(state, x, scanY)] !== element) {
      break;
    }

    height += 1;
  }

  return height;
}

function isDiagonalCornerBlocked(
  state: MutableWorldState,
  fromX: number,
  fromY: number,
  targetX: number,
  targetY: number,
): boolean {
  if (fromX === targetX || fromY === targetY) {
    return false;
  }

  return (
    isMovementBarrierCell(state, targetX, fromY) && isMovementBarrierCell(state, fromX, targetY)
  );
}
