import { EMPTY_CELL, isEmpty } from "../elements";
import type { GridPoint } from "../lines";

import { assertPositiveInteger, getWaterAmount, isInside, setElementCell, toIndex } from "./grid";
import { isStaticSolidCell } from "./solids";
import type { HearthDefinition, HearthSnapshot, HearthState, MutableWorldState } from "./types";
import { DEFAULT_HEARTH_FLAME_RATE, DEFAULT_HEARTH_HEAT_RADIUS, MIN_WATER } from "./types";

export function createHearthState(definition: HearthDefinition): HearthState {
  assertPositiveInteger("hearth width", definition.rect.width);
  assertPositiveInteger("hearth height", definition.rect.height);

  return {
    definition: {
      ...definition,
      flameRatePerTick: definition.flameRatePerTick ?? DEFAULT_HEARTH_FLAME_RATE,
      heatRadius: definition.heatRadius ?? DEFAULT_HEARTH_HEAT_RADIUS,
    },
    flameCarry: 0,
  };
}

export function processHearths(state: MutableWorldState, emitFlames: boolean): void {
  for (const hearth of state.hearths) {
    convertWaterAtHearth(state, hearth);

    if (emitFlames) {
      emitHearthFlames(state, hearth);
    }
  }
}

export function createHearthSnapshots(hearths: readonly HearthState[]): HearthSnapshot[] {
  return hearths.map((hearth) => ({
    flameRatePerTick: hearth.definition.flameRatePerTick,
    heatRadius: hearth.definition.heatRadius,
    id: hearth.definition.id,
    rect: hearth.definition.rect,
  }));
}

function convertWaterAtHearth(state: MutableWorldState, hearth: HearthState): void {
  const steamCells: GridPoint[] = [];

  for (const cell of getHearthHeatCells(state, hearth.definition)) {
    const index = toIndex(state, cell.x, cell.y);

    if (state.water[index] === undefined || state.water[index] <= MIN_WATER) {
      continue;
    }

    state.water[index] = 0;

    if (isEmpty(state.cells[index] ?? EMPTY_CELL) && !isStaticSolidCell(state, cell.x, cell.y)) {
      steamCells.push(cell);
    }
  }

  for (const cell of steamCells) {
    setElementCell(state, toIndex(state, cell.x, cell.y), "steam");
  }
}

function emitHearthFlames(state: MutableWorldState, hearth: HearthState): void {
  hearth.flameCarry += hearth.definition.flameRatePerTick;

  while (hearth.flameCarry >= 1) {
    const spawn = getHearthFlameSpawnCell(state, hearth.definition);

    if (spawn !== null) {
      const index = toIndex(state, spawn.x, spawn.y);

      if (
        isEmpty(state.cells[index] ?? EMPTY_CELL) &&
        getWaterAmount(state, spawn.x, spawn.y) <= MIN_WATER &&
        !isStaticSolidCell(state, spawn.x, spawn.y)
      ) {
        setElementCell(state, index, "fire");
      }
    }

    hearth.flameCarry -= 1;
  }
}

function getHearthFlameSpawnCell(
  state: MutableWorldState,
  hearth: Required<HearthDefinition>,
): GridPoint | null {
  const x = hearth.rect.x + state.random.nextInt(hearth.rect.width);
  const y = hearth.rect.y - 1;

  if (!isInside(state, x, y)) {
    return null;
  }

  return { x, y };
}

function getHearthHeatCells(
  state: MutableWorldState,
  hearth: Required<HearthDefinition>,
): GridPoint[] {
  const cells: GridPoint[] = [];
  const minX = hearth.rect.x - 1;
  const maxX = hearth.rect.x + hearth.rect.width;
  const minY = hearth.rect.y - hearth.heatRadius;
  const maxY = hearth.rect.y;

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      if (isInside(state, x, y)) {
        cells.push({ x, y });
      }
    }
  }

  return cells;
}
