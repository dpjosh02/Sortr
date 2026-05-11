import {
  EMPTY_CELL,
  ELEMENT_PALETTE,
  type CellValue,
  isDrawnLine,
  isElement,
} from "../simulation/elements";
import {
  FIRE_TTL,
  type CollapseCell,
  type HearthSnapshot,
  type ObstacleDefinition,
  type WorldSnapshot,
} from "../simulation/world";

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

      if (snapshot.isCollapseActive) {
        drawCollapseWorld(context, snapshot, options);
        drawCompletionText(context, canvas.width, options.cellSize);
        return;
      }

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

      for (const obstacle of snapshot.obstacles) {
        drawObstacle(context, obstacle, options.cellSize);
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

function drawCollapseWorld(
  context: CanvasRenderingContext2D,
  snapshot: WorldSnapshot,
  options: WorldRenderOptions,
): void {
  for (let y = 0; y < snapshot.height; y += 1) {
    for (let x = 0; x < snapshot.width; x += 1) {
      const index = y * snapshot.width + x;
      const cell = snapshot.collapseCells[index] ?? EMPTY_CELL;

      if (cell === EMPTY_CELL) {
        continue;
      }

      context.fillStyle = getCollapseCellColor(cell, x, y);
      context.fillRect(
        x * options.cellSize,
        y * options.cellSize,
        options.cellSize,
        options.cellSize,
      );
    }
  }
}

function getCollapseCellColor(cell: CollapseCell, x: number, y: number): string {
  if (cell === "solid") {
    return "#111111";
  }

  if (cell === EMPTY_CELL) {
    return "#000000";
  }

  return getParticleColor(cell, x, y, FIRE_TTL);
}

function drawCompletionText(
  context: CanvasRenderingContext2D,
  canvasWidth: number,
  cellSize: number,
): void {
  const text = "Sortd!";
  const scale = Math.max(2, Math.floor(cellSize * 1.5));
  const letterGap = scale;
  const width = getPixelTextWidth(text, scale, letterGap);
  let cursorX = Math.floor((canvasWidth - width) / 2);
  const y = cellSize * 5;

  context.fillStyle = "#111111";

  for (const character of text) {
    const glyph = COMPLETION_GLYPHS[character];

    if (glyph === undefined) {
      cursorX += scale * 4;
      continue;
    }

    drawGlyph(context, glyph, cursorX, y, scale);
    cursorX += getGlyphWidth(glyph) * scale + letterGap;
  }
}

const COMPLETION_GLYPHS: Readonly<Record<string, readonly string[]>> = {
  "!": ["1", "1", "1", "1", "1", "0", "1"],
  S: ["1111", "1000", "1000", "1110", "0001", "0001", "1110"],
  d: ["0001", "0001", "0111", "1001", "1001", "1001", "0111"],
  o: ["0000", "0110", "1001", "1001", "1001", "1001", "0110"],
  r: ["0000", "1010", "1101", "1000", "1000", "1000", "1000"],
  t: ["0100", "0100", "1110", "0100", "0100", "0100", "0010"],
};

function getPixelTextWidth(text: string, scale: number, letterGap: number): number {
  let width = 0;

  for (const character of text) {
    const glyph = COMPLETION_GLYPHS[character];
    width += glyph === undefined ? scale * 4 : getGlyphWidth(glyph) * scale;
    width += letterGap;
  }

  return Math.max(0, width - letterGap);
}

function getGlyphWidth(glyph: readonly string[]): number {
  return glyph[0]?.length ?? 0;
}

function drawGlyph(
  context: CanvasRenderingContext2D,
  glyph: readonly string[],
  x: number,
  y: number,
  scale: number,
): void {
  for (let row = 0; row < glyph.length; row += 1) {
    const line = glyph[row] ?? "";

    for (let column = 0; column < line.length; column += 1) {
      if (line[column] === "1") {
        context.fillRect(x + column * scale, y + row * scale, scale, scale);
      }
    }
  }
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
    return "#f6b45a";
  }

  if (remainingRatio <= 0.5) {
    return "#f49a42";
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

function drawObstacle(
  context: CanvasRenderingContext2D,
  obstacle: ObstacleDefinition,
  cellSize: number,
): void {
  context.fillStyle = "#111111";

  if (obstacle.kind === "solid-rect") {
    context.fillRect(
      obstacle.rect.x * cellSize,
      obstacle.rect.y * cellSize,
      obstacle.rect.width * cellSize,
      obstacle.rect.height * cellSize,
    );
    return;
  }

  context.strokeStyle = "#111111";
  context.lineCap = "square";
  context.lineWidth = Math.max(cellSize, obstacle.line.thickness * cellSize);
  context.beginPath();
  context.moveTo(obstacle.line.x1 * cellSize, obstacle.line.y1 * cellSize);
  context.lineTo(obstacle.line.x2 * cellSize, obstacle.line.y2 * cellSize);
  context.stroke();
}
