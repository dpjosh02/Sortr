interface DrawableFixtureBounds {
  readonly centerX: number;
  readonly height: number;
  readonly width: number;
  readonly x: number;
  readonly y: number;
}

export function drawOutlinedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
): void {
  context.fillStyle = "#111111";
  context.fillRect(x, y, width, height);
  context.fillStyle = fill;
  context.fillRect(x + 1, y + 1, Math.max(1, width - 2), Math.max(1, height - 2));
}

export function drawGrains(
  context: CanvasRenderingContext2D,
  centerX: number,
  y: number,
  cellSize: number,
): void {
  context.fillRect(centerX - cellSize, y, cellSize, cellSize);
  context.fillRect(centerX, y + cellSize, cellSize, cellSize);
  context.fillRect(centerX + cellSize, y, cellSize, cellSize);
}

export function drawGlassKiln(
  context: CanvasRenderingContext2D,
  bounds: DrawableFixtureBounds,
  cellSize: number,
  tick: number,
): void {
  drawOutlinedRect(
    context,
    bounds.x + cellSize,
    bounds.y + cellSize * 2,
    bounds.width - cellSize * 2,
    cellSize * 2,
    "#7f8a86",
  );
  drawOutlinedRect(
    context,
    bounds.centerX - cellSize,
    bounds.y + cellSize * 3,
    cellSize * 2,
    cellSize,
    "#2c1f1a",
  );
  context.fillStyle = tick % 8 < 4 ? "#d7f0ea" : "#a8d8cf";
  context.fillRect(bounds.centerX - cellSize / 2, bounds.y + cellSize * 4, cellSize, cellSize);
}
