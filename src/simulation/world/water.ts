import { canDisplace, type ElementType, isElement } from "../elements";
import type { GridPoint } from "../lines";

import { getWaterAmount, toIndex } from "./grid";
import { getOrthogonalNeighbors } from "./neighbors";
import { canContainWater } from "./solids";
import type { MutableWorldState } from "./types";
import {
  MAX_WATER,
  MIN_WATER,
  WATER_EQUALIZE_FLOW,
  WATER_FLOW_PASSES,
  WATER_SIDE_FLOW,
} from "./types";

export { getWaterAmount };

export function flowWater(state: MutableWorldState): void {
  for (let pass = 0; pass < WATER_FLOW_PASSES; pass += 1) {
    for (let y = state.height - 1; y >= 0; y -= 1) {
      const leftToRight = state.random.pickDirection() === 1;

      for (let column = 0; column < state.width; column += 1) {
        const x = leftToRight ? column : state.width - 1 - column;
        const amount = getWaterAmount(state, x, y);

        if (amount <= MIN_WATER || !canContainWater(state, x, y)) {
          continue;
        }

        flowWaterCell(state, x, y);
      }
    }
  }

  pruneWater(state);
}

export function displaceWaterForSolid(
  state: MutableWorldState,
  displacedWater: boolean[],
  targetX: number,
  targetY: number,
  amount: number,
  options: {
    readonly ignoreDisplacedWater: boolean;
    readonly searchRadius: number;
  },
): boolean {
  const targetIndex = toIndex(state, targetX, targetY);
  const candidates = getWaterDisplacementCandidates(state, targetX, targetY, options.searchRadius);
  let remaining = amount;

  for (const candidate of candidates) {
    const candidateIndex = toIndex(state, candidate.x, candidate.y);

    if (candidateIndex === targetIndex) {
      continue;
    }

    if (!options.ignoreDisplacedWater && displacedWater[candidateIndex] === true) {
      continue;
    }

    const capacity = MAX_WATER - getWaterAmount(state, candidate.x, candidate.y);

    if (capacity <= MIN_WATER) {
      continue;
    }

    const transferred = Math.min(remaining, capacity);
    state.water[candidateIndex] = (state.water[candidateIndex] ?? 0) + transferred;
    displacedWater[candidateIndex] = true;
    remaining -= transferred;

    if (remaining <= MIN_WATER) {
      state.water[targetIndex] = 0;
      return true;
    }
  }

  return false;
}

export function canElementDisplaceWater(element: ElementType): boolean {
  return isElement(element) && canDisplace(element, "water");
}

function flowWaterCell(state: MutableWorldState, x: number, y: number): void {
  flowWaterDown(state, x, y);
  flowWaterSideways(state, x, y);
  flowWaterUpwardByPressure(state, x, y);
}

function transferWater(
  state: MutableWorldState,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  amount: number,
): void {
  if (amount <= MIN_WATER) {
    return;
  }

  const fromIndex = toIndex(state, fromX, fromY);
  const toIndexValue = toIndex(state, toX, toY);
  const movedAmount = Math.min(amount, state.water[fromIndex] ?? 0);

  state.water[fromIndex] = (state.water[fromIndex] ?? 0) - movedAmount;
  state.water[toIndexValue] = (state.water[toIndexValue] ?? 0) + movedAmount;
}

function flowWaterDown(state: MutableWorldState, x: number, y: number): void {
  const belowY = y + 1;

  if (belowY < state.height && canContainWater(state, x, belowY)) {
    const availableBelow = MAX_WATER - getWaterAmount(state, x, belowY);
    const fallingAmount = Math.min(getWaterAmount(state, x, y), availableBelow);

    if (fallingAmount > MIN_WATER) {
      transferWater(state, x, y, x, belowY, fallingAmount);
    }
  }
}

function flowWaterSideways(state: MutableWorldState, x: number, y: number): void {
  const side = state.random.pickDirection();
  const sideCandidates = [
    { x: x + side, y },
    { x: x - side, y },
  ];

  for (const candidate of sideCandidates) {
    if (!canContainWater(state, candidate.x, candidate.y)) {
      continue;
    }

    const currentAmount = getWaterAmount(state, x, y);
    const neighborAmount = getWaterAmount(state, candidate.x, candidate.y);
    const difference = currentAmount - neighborAmount;

    if (difference <= MIN_WATER) {
      continue;
    }

    const amount = Math.min(difference / 2, WATER_SIDE_FLOW, MAX_WATER - neighborAmount);
    transferWater(state, x, y, candidate.x, candidate.y, amount);
  }
}

function flowWaterUpwardByPressure(state: MutableWorldState, x: number, y: number): void {
  const aboveY = y - 1;

  if (aboveY >= 0 && canContainWater(state, x, aboveY)) {
    const currentAmount = getWaterAmount(state, x, y);
    const aboveAmount = getWaterAmount(state, x, aboveY);

    if (currentAmount > MAX_WATER - MIN_WATER && aboveAmount < currentAmount - MIN_WATER) {
      const amount = Math.min(
        (currentAmount - aboveAmount) / 4,
        WATER_EQUALIZE_FLOW,
        MAX_WATER - aboveAmount,
      );
      transferWater(state, x, y, x, aboveY, amount);
    }
  }
}

function getWaterDisplacementCandidates(
  state: MutableWorldState,
  startX: number,
  startY: number,
  searchRadius: number,
): GridPoint[] {
  const queue: GridPoint[] = [{ x: startX, y: startY }];
  const visited = new Set<number>([toIndex(state, startX, startY)]);
  const candidates: GridPoint[] = [];

  let queueIndex = 0;

  while (queueIndex < queue.length) {
    const current = queue[queueIndex];
    queueIndex += 1;

    if (current === undefined) {
      continue;
    }

    if (Math.abs(current.x - startX) + Math.abs(current.y - startY) > searchRadius) {
      continue;
    }

    if (canContainWater(state, current.x, current.y)) {
      candidates.push(current);
    }

    for (const neighbor of getOrthogonalNeighbors(current.x, current.y)) {
      if (!canContainWater(state, neighbor.x, neighbor.y)) {
        continue;
      }

      const neighborIndex = toIndex(state, neighbor.x, neighbor.y);

      if (!visited.has(neighborIndex)) {
        visited.add(neighborIndex);
        queue.push(neighbor);
      }
    }
  }

  return candidates.sort(
    (left, right) =>
      Math.abs(left.y - startY) - Math.abs(right.y - startY) ||
      Math.abs(left.x - startX) - Math.abs(right.x - startX),
  );
}

function pruneWater(state: MutableWorldState): void {
  for (let index = 0; index < state.water.length; index += 1) {
    const amount = state.water[index] ?? 0;

    if (amount < Number.EPSILON) {
      state.water[index] = 0;
    } else if (amount > MAX_WATER) {
      state.water[index] = MAX_WATER;
    }
  }
}
