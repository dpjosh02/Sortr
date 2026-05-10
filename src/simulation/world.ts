import {
  DRAWN_LINE_CELL,
  EMPTY_CELL,
  canDisplace,
  type CellValue,
  type ElementType,
  isDrawnLine,
  isElement,
  isEmpty,
} from "./elements";
import { createEmitterState, type EmitterDefinition, type EmitterState } from "./emitters";
import { getLineCells, type GridPoint } from "./lines";
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
  readonly water: readonly number[];
  readonly particleCounts: readonly ParticleCount[];
}

export interface World {
  readonly width: number;
  readonly height: number;
  readonly tick: number;
  addElementCell(x: number, y: number, element: ElementType): void;
  addLineCell(x: number, y: number): void;
  addLineSegment(start: GridPoint, end: GridPoint): void;
  getCell(x: number, y: number): CellValue;
  setCell(x: number, y: number, value: CellValue): void;
  step(): void;
  snapshot(): WorldSnapshot;
}

interface MutableWorldState {
  readonly width: number;
  readonly height: number;
  readonly cells: CellValue[];
  readonly water: number[];
  readonly random: SeededRandom;
  readonly emitters: EmitterState[];
  tick: number;
}

const MIN_WATER = 0.01;
const MAX_WATER = 1;
const WATER_FLOW_PASSES = 3;
const WATER_SIDE_FLOW = 0.45;
const WATER_EQUALIZE_FLOW = 0.25;
const DISPLACEMENT_SEARCH_RADIUS = 10;
const PRESSURE_DISPLACEMENT_SEARCH_RADIUS = 40;
const SAND_PRESSURE_COLUMN_HEIGHT = 3;

export function createWorld(definition: WorldDefinition): World {
  assertPositiveInteger("width", definition.width);
  assertPositiveInteger("height", definition.height);

  const state: MutableWorldState = {
    cells: Array<CellValue>(definition.width * definition.height).fill(EMPTY_CELL),
    emitters: definition.emitters.map(createEmitterState),
    height: definition.height,
    random: createSeededRandom(definition.seed),
    tick: 0,
    water: Array<number>(definition.width * definition.height).fill(0),
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
    addElementCell(x: number, y: number, element: ElementType): void {
      if (!isInside(state, x, y)) {
        return;
      }

      const index = toIndex(state, x, y);
      const cell = state.cells[index] ?? EMPTY_CELL;

      if (!isEmpty(cell)) {
        return;
      }

      if (element === "water") {
        state.water[index] = Math.min(MAX_WATER, (state.water[index] ?? 0) + MAX_WATER);
        return;
      }

      const waterAmount = getWaterAmount(state, x, y);

      if (
        waterAmount > MIN_WATER &&
        (!canDisplace(element, "water") ||
          !displaceWaterForSolid(
            state,
            Array<boolean>(state.cells.length).fill(false),
            x,
            y,
            waterAmount,
            {
              ignoreDisplacedWater: true,
              searchRadius: PRESSURE_DISPLACEMENT_SEARCH_RADIUS,
            },
          ))
      ) {
        return;
      }

      state.water[index] = 0;
      state.cells[index] = element;
    },
    addLineCell(x: number, y: number): void {
      if (!isInside(state, x, y)) {
        return;
      }

      state.cells[toIndex(state, x, y)] = DRAWN_LINE_CELL;
    },
    addLineSegment(start: GridPoint, end: GridPoint): void {
      for (const cell of getLineCells(start, end)) {
        if (isInside(state, cell.x, cell.y)) {
          state.cells[toIndex(state, cell.x, cell.y)] = DRAWN_LINE_CELL;
        }
      }
    },
    getCell(x: number, y: number): CellValue {
      if (!isInside(state, x, y)) {
        return EMPTY_CELL;
      }

      return getVisibleCell(state, x, y);
    },
    setCell(x: number, y: number, value: CellValue): void {
      if (!isInside(state, x, y)) {
        throw new Error(`Cell coordinate is outside the world: ${String(x)},${String(y)}.`);
      }

      const index = toIndex(state, x, y);

      if (value === "water") {
        state.cells[index] = EMPTY_CELL;
        state.water[index] = MAX_WATER;
        return;
      }

      state.cells[index] = value;
      state.water[index] = 0;
    },
    snapshot(): WorldSnapshot {
      return {
        cells: [...state.cells],
        height: state.height,
        particleCounts: countParticles(state),
        tick: state.tick,
        water: [...state.water],
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

      if (spawn === null) {
        emitter.carry -= 1;
        continue;
      }

      const spawnIndex = toIndex(state, spawn.x, spawn.y);
      const spawnCell = state.cells[spawnIndex] ?? EMPTY_CELL;

      if (emitter.definition.element === "water") {
        if (isEmpty(spawnCell)) {
          state.water[spawnIndex] = Math.min(MAX_WATER, (state.water[spawnIndex] ?? 0) + 1);
        }
      } else if (isEmpty(spawnCell) && getWaterAmount(state, spawn.x, spawn.y) <= MIN_WATER) {
        state.cells[spawnIndex] = emitter.definition.element;
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
  const displacedWater = Array<boolean>(state.cells.length).fill(false);

  moveParticleFamily(state, moved, displacedWater, "sand");
  flowWater(state);
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

      if (element === "sand") {
        moveSand(state, moved, displacedWater, x, y);
      }
    }
  }
}

function moveSand(
  state: MutableWorldState,
  moved: boolean[],
  displacedWater: boolean[],
  x: number,
  y: number,
): void {
  const side = state.random.pickDirection();
  const candidates = [
    { x, y: y + 1 },
    { x: x + side, y: y + 1 },
    { x: x - side, y: y + 1 },
  ];

  tryMoveToFirstAvailableCell(state, moved, displacedWater, x, y, candidates);
}

function tryMoveToFirstAvailableCell(
  state: MutableWorldState,
  moved: boolean[],
  displacedWater: boolean[],
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
    const targetWater = getWaterAmount(state, candidate.x, candidate.y);

    if (isDiagonalCornerBlocked(state, fromX, fromY, candidate.x, candidate.y)) {
      continue;
    }

    if (isEmpty(targetCell) && targetWater <= MIN_WATER) {
      state.cells[targetIndex] = movingCell;
      state.cells[fromIndex] = EMPTY_CELL;
      moved[targetIndex] = true;
      return;
    }

    if (isEmpty(targetCell) && targetWater > MIN_WATER && canDisplace(movingCell, "water")) {
      const hasSandPressure =
        movingCell === "sand" &&
        getSandColumnHeight(state, fromX, fromY) >= SAND_PRESSURE_COLUMN_HEIGHT;

      if (
        (!hasSandPressure && displacedWater[targetIndex] === true) ||
        !displaceWaterForSolid(state, displacedWater, candidate.x, candidate.y, targetWater, {
          ignoreDisplacedWater: hasSandPressure,
          searchRadius: hasSandPressure
            ? PRESSURE_DISPLACEMENT_SEARCH_RADIUS
            : DISPLACEMENT_SEARCH_RADIUS,
        })
      ) {
        continue;
      }

      state.cells[targetIndex] = movingCell;
      state.cells[fromIndex] = EMPTY_CELL;
      state.water[targetIndex] = 0;
      moved[targetIndex] = true;
      return;
    }
  }
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

  const horizontalCorner = getCellUnchecked(state, targetX, fromY);
  const verticalCorner = getCellUnchecked(state, fromX, targetY);

  return isDrawnLine(horizontalCorner) && isDrawnLine(verticalCorner);
}

function flowWater(state: MutableWorldState): void {
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

function flowWaterCell(state: MutableWorldState, x: number, y: number): void {
  const belowY = y + 1;

  if (belowY < state.height && canContainWater(state, x, belowY)) {
    const availableBelow = MAX_WATER - getWaterAmount(state, x, belowY);
    const fallingAmount = Math.min(getWaterAmount(state, x, y), availableBelow);

    if (fallingAmount > MIN_WATER) {
      transferWater(state, x, y, x, belowY, fallingAmount);
    }
  }

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

function displaceWaterForSolid(
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
      if (!isInside(state, neighbor.x, neighbor.y)) {
        continue;
      }

      const neighborIndex = toIndex(state, neighbor.x, neighbor.y);

      if (visited.has(neighborIndex)) {
        continue;
      }

      if (!canContainWater(state, neighbor.x, neighbor.y)) {
        continue;
      }

      visited.add(neighborIndex);
      queue.push(neighbor);
    }
  }

  return candidates.sort(
    (left, right) =>
      Math.abs(left.y - startY) - Math.abs(right.y - startY) ||
      Math.abs(left.x - startX) - Math.abs(right.x - startX),
  );
}

function getSandColumnHeight(state: MutableWorldState, x: number, y: number): number {
  let height = 0;

  for (let scanY = y; scanY >= 0; scanY -= 1) {
    if (state.cells[toIndex(state, x, scanY)] !== "sand") {
      break;
    }

    height += 1;
  }

  return height;
}

function getOrthogonalNeighbors(x: number, y: number): GridPoint[] {
  return [
    { x, y: y + 1 },
    { x: x - 1, y },
    { x: x + 1, y },
    { x, y: y - 1 },
  ];
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

function pruneWater(state: MutableWorldState): void {
  for (let index = 0; index < state.water.length; index += 1) {
    const amount = state.water[index] ?? 0;

    if (amount < MIN_WATER) {
      state.water[index] = 0;
    } else if (amount > MAX_WATER) {
      state.water[index] = MAX_WATER;
    }
  }
}

function canContainWater(state: MutableWorldState, x: number, y: number): boolean {
  if (!isInside(state, x, y)) {
    return false;
  }

  return isEmpty(state.cells[toIndex(state, x, y)] ?? EMPTY_CELL);
}

function getWaterAmount(state: MutableWorldState, x: number, y: number): number {
  if (!isInside(state, x, y)) {
    return 0;
  }

  return state.water[toIndex(state, x, y)] ?? 0;
}

function getVisibleCell(state: MutableWorldState, x: number, y: number): CellValue {
  const cell = state.cells[toIndex(state, x, y)] ?? EMPTY_CELL;

  if (!isEmpty(cell)) {
    return cell;
  }

  return getWaterAmount(state, x, y) > MIN_WATER ? "water" : EMPTY_CELL;
}

function countParticles(state: MutableWorldState): ParticleCount[] {
  const counts = new Map<ElementType, number>();

  for (const cell of state.cells) {
    if (!isElement(cell)) {
      continue;
    }

    counts.set(cell, (counts.get(cell) ?? 0) + 1);
  }

  const waterCells = state.water.filter((amount) => amount > MIN_WATER).length;

  if (waterCells > 0) {
    counts.set("water", waterCells);
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

function getCellUnchecked(state: MutableWorldState, x: number, y: number): CellValue {
  if (!isInside(state, x, y)) {
    return EMPTY_CELL;
  }

  return state.cells[toIndex(state, x, y)] ?? EMPTY_CELL;
}

function toIndex(state: MutableWorldState, x: number, y: number): number {
  return y * state.width + x;
}

function assertPositiveInteger(name: string, value: number): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }
}
