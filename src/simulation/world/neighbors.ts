import type { GridPoint } from "../lines";

export function getOrthogonalNeighbors(x: number, y: number): GridPoint[] {
  return [
    { x, y: y + 1 },
    { x: x - 1, y },
    { x: x + 1, y },
    { x, y: y - 1 },
  ];
}

export function getNeighborCells(x: number, y: number): GridPoint[] {
  return [
    { x: x - 1, y: y - 1 },
    { x, y: y - 1 },
    { x: x + 1, y: y - 1 },
    { x: x - 1, y },
    { x: x + 1, y },
    { x: x - 1, y: y + 1 },
    { x, y: y + 1 },
    { x: x + 1, y: y + 1 },
  ];
}
