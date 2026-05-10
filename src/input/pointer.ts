import type { GridPoint } from "../simulation/lines";

export interface CanvasGridPointOptions {
  readonly canvas: HTMLCanvasElement;
  readonly clientX: number;
  readonly clientY: number;
  readonly gridWidth: number;
  readonly gridHeight: number;
}

export function getCanvasGridPoint(options: CanvasGridPointOptions): GridPoint {
  const rect = options.canvas.getBoundingClientRect();
  const normalizedX = (options.clientX - rect.left) / rect.width;
  const normalizedY = (options.clientY - rect.top) / rect.height;

  return {
    x: clampGridCoordinate(Math.floor(normalizedX * options.gridWidth), options.gridWidth),
    y: clampGridCoordinate(Math.floor(normalizedY * options.gridHeight), options.gridHeight),
  };
}

function clampGridCoordinate(value: number, size: number): number {
  if (size <= 0) {
    return 0;
  }

  return Math.min(Math.max(value, 0), size - 1);
}
