import { EMPTY_CELL, isEmpty } from "../elements";
import type { GridPoint } from "../lines";

import { clearElementCell, getWaterAmount, isInside, setElementCell, toIndex } from "./grid";
import { getNeighborCells } from "./neighbors";
import { isStaticSolidCell } from "./solids";
import { MIN_WATER, type MutableWorldState } from "./types";

export function processReactions(state: MutableWorldState): void {
  const steamCells: GridPoint[] = [];
  const consumedWater = new Set<number>();
  const consumedFire = new Set<number>();

  for (let y = 0; y < state.height; y += 1) {
    for (let x = 0; x < state.width; x += 1) {
      const index = toIndex(state, x, y);

      if (state.cells[index] !== "fire" || consumedFire.has(index)) {
        continue;
      }

      const waterNeighbor = findWaterNeighbor(state, x, y, consumedWater);

      if (waterNeighbor === null) {
        continue;
      }

      consumedWater.add(toIndex(state, waterNeighbor.x, waterNeighbor.y));
      consumedFire.add(index);
      steamCells.push({ x, y });
    }
  }

  for (const index of consumedWater) {
    state.water[index] = 0;
  }

  for (const index of consumedFire) {
    clearElementCell(state, index);
  }

  for (const cell of steamCells) {
    const index = toIndex(state, cell.x, cell.y);

    if (!isStaticSolidCell(state, cell.x, cell.y) && isEmpty(state.cells[index] ?? EMPTY_CELL)) {
      setElementCell(state, index, "steam");
    }
  }
}

function findWaterNeighbor(
  state: MutableWorldState,
  x: number,
  y: number,
  consumedWater: ReadonlySet<number>,
): GridPoint | null {
  for (const neighbor of getNeighborCells(x, y)) {
    if (!isInside(state, neighbor.x, neighbor.y)) {
      continue;
    }

    const index = toIndex(state, neighbor.x, neighbor.y);

    if (consumedWater.has(index)) {
      continue;
    }

    if (getWaterAmount(state, neighbor.x, neighbor.y) > MIN_WATER) {
      return neighbor;
    }
  }

  return null;
}
