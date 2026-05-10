import { EMPTY_CELL, ELEMENT_PALETTE, type CellValue, isElement } from "../simulation/elements";
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
          const cell = snapshot.cells[y * snapshot.width + x] ?? EMPTY_CELL;

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
    },
  };
}

function getParticleColor(element: CellValue, x: number, y: number): string {
  if (!isElement(element)) {
    return "#000000";
  }

  const colors = ELEMENT_PALETTE[element];
  const color = colors[(x * 17 + y * 31) % colors.length];

  return color ?? colors[0] ?? "#000000";
}
