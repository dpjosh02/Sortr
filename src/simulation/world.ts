import {
  EMPTY_CELL,
  canDisplace,
  type CellValue,
  type ElementType,
  isElement,
  isEmpty,
} from "./elements";
import { createEmitterState, type EmitterDefinition, type EmitterState } from "./emitters";
import { createSeededRandom, type SeededRandom } from "./random";

export interface WorldDefinition {
  readonly width: number;
  readonly height: number;
  readonly seed: number;
  readonly emitters: readonly EmitterDefinition[];
}

export interface ParticleCount {
  readonly element: ElementType;
  readonly count: number;
}

export interface WorldSnapshot {
  readonly width: number;
  readonly height: number;
  readonly tick: number;
  readonly cells: readonly CellValue[];
  readonly particleCounts: readonly ParticleCount[];
}

export interface World {
  readonly width: number;
  readonly height: number;
  readonly tick: number;
  getCell(x: number, y: number): CellValue;
  setCell(x: number, y: number, value: CellValue): void;
  step(): void;
  snapshot(): WorldSnapshot;
}

interface MutableWorldState {
  readonly width: number;
  readonly height: number;
  readonly cells: CellValue[];
  readonly random: SeededRandom;
  readonly emitters: EmitterState[];
  tick: number;
}

export function createWorld(definition: WorldDefinition): World {
  assertPositiveInteger("width", definition.width);
  assertPositiveInteger("height", definition.height);

  const state: MutableWorldState = {
    cells: Array<CellValue>(definition.width * definition.height).fill(EMPTY_CELL),
    emitters: definition.emitters.map(createEmitterState),
    height: definition.height,
    random: createSeededRandom(definition.seed),
    tick: 0,
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
    getCell(x: number, y: number): CellValue {
      if (!isInside(state, x, y)) {
        return EMPTY_CELL;
      }

      return state.cells[toIndex(state, x, y)] ?? EMPTY_CELL;
    },
    setCell(x: number, y: number, value: CellValue): void {
      if (!isInside(state, x, y)) {
        throw new Error(`Cell coordinate is outside the world: ${String(x)},${String(y)}.`);
      }

      state.cells[toIndex(state, x, y)] = value;
    },
    snapshot(): WorldSnapshot {
      return {
        cells: [...state.cells],
        height: state.height,
        particleCounts: countParticles(state.cells),
        tick: state.tick,
        width: state.width,
      };
    },
    step(): void {
      spawnFromEmitters(state);
      moveParticles(state);
      state.tick += 1;
    },
  };
}

function spawnFromEmitters(state: MutableWorldState): void {
  for (const emitter of state.emitters) {
    emitter.carry += emitter.definition.ratePerTick;

    while (emitter.carry >= 1) {
      const spawn = getEmitterSpawnCell(state, emitter.definition);

      if (spawn !== null && isEmpty(state.cells[toIndex(state, spawn.x, spawn.y)] ?? EMPTY_CELL)) {
        state.cells[toIndex(state, spawn.x, spawn.y)] = emitter.definition.element;
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

function moveParticles(state: MutableWorldState): void {
  const moved = Array<boolean>(state.cells.length).fill(false);

  moveParticleFamily(state, moved, "sand");
  moveParticleFamily(state, moved, "water");
}

function moveParticleFamily(
  state: MutableWorldState,
  moved: boolean[],
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

      if (element === "sand") {
        moveSand(state, moved, x, y);
      } else if (element === "water") {
        moveWater(state, moved, x, y);
      }
    }
  }
}

function moveWater(state: MutableWorldState, moved: boolean[], x: number, y: number): void {
  const side = state.random.pickDirection();
  const candidates = [
    { x, y: y + 1 },
    { x: x + side, y: y + 1 },
    { x: x - side, y: y + 1 },
    { x: x + side, y },
    { x: x - side, y },
  ];

  tryMoveToFirstAvailableCell(state, moved, x, y, candidates);
}

function moveSand(state: MutableWorldState, moved: boolean[], x: number, y: number): void {
  const side = state.random.pickDirection();
  const candidates = [
    { x, y: y + 1 },
    { x: x + side, y: y + 1 },
    { x: x - side, y: y + 1 },
  ];

  tryMoveToFirstAvailableCell(state, moved, x, y, candidates);
}

function tryMoveToFirstAvailableCell(
  state: MutableWorldState,
  moved: boolean[],
  fromX: number,
  fromY: number,
  candidates: readonly { readonly x: number; readonly y: number }[],
): void {
  const fromIndex = toIndex(state, fromX, fromY);
  const movingCell = state.cells[fromIndex] ?? EMPTY_CELL;

  if (!isElement(movingCell)) {
    return;
  }

  for (const candidate of candidates) {
    if (!isInside(state, candidate.x, candidate.y)) {
      continue;
    }

    const targetIndex = toIndex(state, candidate.x, candidate.y);
    const targetCell = state.cells[targetIndex] ?? EMPTY_CELL;

    if (isEmpty(targetCell)) {
      state.cells[targetIndex] = movingCell;
      state.cells[fromIndex] = EMPTY_CELL;
      moved[targetIndex] = true;
      return;
    }

    if (!isElement(targetCell) || !canDisplace(movingCell, targetCell)) {
      continue;
    }

    state.cells[targetIndex] = movingCell;
    state.cells[fromIndex] = targetCell;
    moved[fromIndex] = true;
    moved[targetIndex] = true;
    return;
  }
}

function countParticles(cells: readonly CellValue[]): ParticleCount[] {
  const counts = new Map<ElementType, number>();

  for (const cell of cells) {
    if (isEmpty(cell)) {
      continue;
    }

    counts.set(cell, (counts.get(cell) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([element, count]) => ({ count, element }));
}

function clampCell(
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

function isInside(state: MutableWorldState, x: number, y: number): boolean {
  return x >= 0 && x < state.width && y >= 0 && y < state.height;
}

function toIndex(state: MutableWorldState, x: number, y: number): number {
  return y * state.width + x;
}

function assertPositiveInteger(name: string, value: number): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }
}
