import { createWorld } from "../../src/simulation/world";

export function totalWater(world: ReturnType<typeof createWorld>): number {
  return world.snapshot().water.reduce((total, amount) => total + amount, 0);
}

export function waterInRow(world: ReturnType<typeof createWorld>, row: number): number {
  const snapshot = world.snapshot();
  let total = 0;

  for (let x = 0; x < snapshot.width; x += 1) {
    total += snapshot.water[row * snapshot.width + x] ?? 0;
  }

  return total;
}

export function waterBelowRow(world: ReturnType<typeof createWorld>, row: number): number {
  const snapshot = world.snapshot();
  let total = 0;

  for (let y = row + 1; y < snapshot.height; y += 1) {
    for (let x = 0; x < snapshot.width; x += 1) {
      total += snapshot.water[y * snapshot.width + x] ?? 0;
    }
  }

  return total;
}

export function waterCellCount(world: ReturnType<typeof createWorld>): number {
  return world.snapshot().water.filter((amount) => amount > 0.01).length;
}

export function countElementCells(world: ReturnType<typeof createWorld>, element: string): number {
  return world.snapshot().cells.filter((cell) => cell === element).length;
}
