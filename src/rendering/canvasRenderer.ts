import {
  EMPTY_CELL,
  ELEMENT_PALETTE,
  type CellValue,
  isDrawnLine,
  isElement,
} from "../simulation/elements";
import { FIRE_TTL, type HearthSnapshot, type WorldSnapshot } from "../simulation/world";

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

          context.fillStyle = getParticleColor(cell, x, y, snapshot.fireLife[index] ?? 0);
          context.fillRect(
            x * options.cellSize,
            y * options.cellSize,
            options.cellSize,
            options.cellSize,
          );
        }
      }

      for (const bucket of snapshot.buckets) {
        const x = bucket.rect.x * options.cellSize;
        const y = bucket.rect.y * options.cellSize;
        const width = bucket.rect.width * options.cellSize;
        const height = bucket.rect.height * options.cellSize;
        const wall = Math.max(1, options.cellSize);

        context.strokeStyle = bucket.accepted >= bucket.required ? "#2f6f45" : "#111111";
        context.lineWidth = wall;
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x, y + height);

        if (bucket.intake !== "bottom") {
          context.lineTo(x + width, y + height);
        } else {
          context.moveTo(x + width, y + height);
        }

        context.lineTo(x + width, y);

        if (bucket.intake === "bottom") {
          context.lineTo(x, y);
        }

        context.stroke();

        context.fillStyle = getBucketFillColor(bucket.target);
        context.fillRect(
          x,
          bucket.intake === "bottom" ? y + height + options.cellSize : y - options.cellSize * 2,
          width,
          options.cellSize,
        );
      }

      for (const hearth of snapshot.hearths) {
        drawHearth(context, hearth, options.cellSize, snapshot.tick);
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

function getParticleColor(element: CellValue, x: number, y: number, fireLife: number): string {
  if (!isElement(element)) {
    return "#000000";
  }

  if (element === "fire") {
    return getFireColor(fireLife, x, y);
  }

  const colors = ELEMENT_PALETTE[element];
  const color = colors[(x * 17 + y * 31) % colors.length];

  return color ?? colors[0] ?? "#000000";
}

function getFireColor(fireLife: number, x: number, y: number): string {
  const remainingRatio = Math.max(0, Math.min(1, fireLife / FIRE_TTL));

  if (remainingRatio <= 0.25) {
    return "#fff0b8";
  }

  if (remainingRatio <= 0.5) {
    return "#f9d36a";
  }

  const colors = ELEMENT_PALETTE.fire;
  const color = colors[(x * 17 + y * 31) % colors.length];

  return color ?? colors[0] ?? "#f26d3d";
}

function drawHearth(
  context: CanvasRenderingContext2D,
  hearth: HearthSnapshot,
  cellSize: number,
  tick: number,
): void {
  const x = hearth.rect.x * cellSize;
  const y = hearth.rect.y * cellSize;
  const width = hearth.rect.width * cellSize;
  const height = hearth.rect.height * cellSize;
  const emberHeight = Math.max(cellSize, Math.floor(height / 2));

  context.fillStyle = "#5f3f2d";
  context.fillRect(x, y + height - emberHeight, width, emberHeight);

  context.fillStyle = "#2c1f1a";
  context.fillRect(x, y + height - cellSize, width, cellSize);

  context.fillStyle = "#8d4d2e";
  context.fillRect(
    x + cellSize,
    y + height - emberHeight,
    Math.max(cellSize, width - cellSize * 2),
    cellSize,
  );

  const flicker = tick % 2 === 0 ? 0 : cellSize;
  const flameY = y - cellSize * 2;
  const flameWidth = Math.max(cellSize, Math.floor(width / 4));
  const centerX = x + Math.floor(width / 2);

  context.fillStyle = "#f26d3d";
  context.fillRect(centerX - flameWidth, flameY + flicker, flameWidth * 2, cellSize * 3);

  context.fillStyle = "#f9d36a";
  context.fillRect(
    centerX - Math.floor(flameWidth / 2),
    flameY + cellSize,
    flameWidth,
    cellSize * 2,
  );
}
