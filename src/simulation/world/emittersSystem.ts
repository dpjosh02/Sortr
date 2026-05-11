import { EMPTY_CELL, isEmpty } from "../elements";
import type { EmitterDefinition } from "../emitters";

import { clampCell, getWaterAmount, setElementCell, toIndex } from "./grid";
import { isStaticSolidCell } from "./solids";
import { MAX_WATER, MIN_WATER, type MutableWorldState } from "./types";

export function spawnFromEmitters(state: MutableWorldState): void {
  for (const emitter of state.emitters) {
    emitter.carry += emitter.definition.ratePerTick;

    while (emitter.carry >= 1) {
      const spawn = getEmitterSpawnCell(state, emitter.definition);

      if (spawn === null) {
        emitter.carry -= 1;
        continue;
      }

      const spawnIndex = toIndex(state, spawn.x, spawn.y);
      const spawnCell = state.cells[spawnIndex] ?? EMPTY_CELL;

      if (emitter.definition.element === "water") {
        if (isEmpty(spawnCell) && !isStaticSolidCell(state, spawn.x, spawn.y)) {
          state.water[spawnIndex] = Math.min(MAX_WATER, (state.water[spawnIndex] ?? 0) + 1);
        }
      } else if (
        isEmpty(spawnCell) &&
        !isStaticSolidCell(state, spawn.x, spawn.y) &&
        getWaterAmount(state, spawn.x, spawn.y) <= MIN_WATER
      ) {
        setElementCell(state, spawnIndex, emitter.definition.element);
      }

      emitter.carry -= 1;
    }
  }
}

function getEmitterSpawnCell(
  state: MutableWorldState,
  emitter: EmitterDefinition,
): { readonly x: number; readonly y: number } | null {
  const span = emitter.range.end - emitter.range.start + 1;
  const offset = state.random.nextInt(span);
  const position = emitter.range.start + offset;

  switch (emitter.edge) {
    case "bottom":
      return clampCell(state, position, state.height - 1);
    case "left":
      return clampCell(state, 0, position);
    case "right":
      return clampCell(state, state.width - 1, position);
    case "top":
      return clampCell(state, position, 0);
  }
}
