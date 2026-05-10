export interface GridPoint {
  readonly x: number;
  readonly y: number;
}

export function getLineCells(start: GridPoint, end: GridPoint): GridPoint[] {
  const cells: GridPoint[] = [];
  const dx = Math.abs(end.x - start.x);
  const dy = Math.abs(end.y - start.y);
  const stepX = start.x < end.x ? 1 : -1;
  const stepY = start.y < end.y ? 1 : -1;
  let error = dx - dy;
  let x = start.x;
  let y = start.y;
  let isComplete = false;

  while (!isComplete) {
    cells.push({ x, y });

    if (x === end.x && y === end.y) {
      isComplete = true;
      continue;
    }

    const doubledError = error * 2;

    if (doubledError > -dy) {
      error -= dy;
      x += stepX;
    }

    if (doubledError < dx) {
      error += dx;
      y += stepY;
    }
  }

  return cells;
}
