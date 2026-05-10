import {
  EMPTY_CELL,
  ELEMENT_PALETTE,
  type CellValue,
  isDrawnLine,
  isElement,
} from "../simulation/elements";
import type { WorldSnapshot } from "../simulation/world";

export interface CanvasRenderer {
  clear(background: string): void;
  drawPlaceholder(message: string): void;
  drawWorld(snapshot: WorldSnapshot, options: WorldRenderOptions): void;
}

export interface WorldRenderOptions {
  readonly background: string;
  readonly cellSize: number;
}

export function createCanvasRenderer(canvas: HTMLCanvasElement): CanvasRenderer {
  const context = canvas.getContext("2d");

  if (context === null) {
    throw new Error("Canvas 2D rendering context is unavailable.");
  }

  return {
    clear(background: string): void {
      context.fillStyle = background;
      context.fillRect(0, 0, canvas.width, canvas.height);
    },
    drawPlaceholder(message: string): void {
      context.fillStyle = "#1a1a16";
      context.font = "24px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(message, canvas.width / 2, canvas.height / 2);
    },
    drawWorld(snapshot: WorldSnapshot, options: WorldRenderOptions): void {
      context.fillStyle = options.background;
      context.fillRect(0, 0, canvas.width, canvas.height);

      for (let y = 0; y < snapshot.height; y += 1) {
        for (let x = 0; x < snapshot.width; x += 1) {
          const index = y * snapshot.width + x;
          const cell = snapshot.cells[index] ?? EMPTY_CELL;
          const waterAmount = snapshot.water[index] ?? 0;

          if (isDrawnLine(cell)) {
            context.fillStyle = "#111111";
            context.fillRect(
              x * options.cellSize,
              y * options.cellSize,
              options.cellSize,
              options.cellSize,
            );
            continue;
          }

          if (waterAmount > 0.01) {
            context.fillStyle = getWaterColor(waterAmount, x, y);
            context.fillRect(
              x * options.cellSize,
              y * options.cellSize,
              options.cellSize,
              options.cellSize,
            );
            continue;
          }

          if (!isElement(cell)) {
            continue;
          }

          context.fillStyle = getParticleColor(cell, x, y);
          context.fillRect(
            x * options.cellSize,
            y * options.cellSize,
            options.cellSize,
            options.cellSize,
          );
        }
      }

      for (const bucket of snapshot.buckets) {
        const fillRatio = Math.min(1, bucket.accepted / bucket.required);
        const x = bucket.rect.x * options.cellSize;
        const y = bucket.rect.y * options.cellSize;
        const width = bucket.rect.width * options.cellSize;
        const height = bucket.rect.height * options.cellSize;

        context.fillStyle = getBucketFillColor(bucket.target);
        context.globalAlpha = 0.25;
        context.fillRect(x, y + height * (1 - fillRatio), width, height * fillRatio);
        context.globalAlpha = 1;

        context.strokeStyle = bucket.accepted >= bucket.required ? "#2f6f45" : "#111111";
        context.lineWidth = Math.max(1, options.cellSize);
        context.strokeRect(x, y, width, height);

        context.fillStyle = getBucketFillColor(bucket.target);
        context.fillRect(x, y - options.cellSize * 2, width, options.cellSize);
      }
    },
  };
}

function getBucketFillColor(element: keyof typeof ELEMENT_PALETTE): string {
  return ELEMENT_PALETTE[element][0] ?? "#111111";
}

function getWaterColor(amount: number, x: number, y: number): string {
  const colors = ELEMENT_PALETTE.water;
  const baseColor = colors[(x * 17 + y * 31) % colors.length] ?? colors[0] ?? "#4f9fd9";

  if (amount > 0.65) {
    return baseColor;
  }

  return amount > 0.33 ? "#68b7e8" : "#9acff0";
}

function getParticleColor(element: CellValue, x: number, y: number): string {
  if (!isElement(element)) {
    return "#000000";
  }

  const colors = ELEMENT_PALETTE[element];
  const color = colors[(x * 17 + y * 31) % colors.length];

  return color ?? colors[0] ?? "#000000";
}
