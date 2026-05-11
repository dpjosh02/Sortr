import type { ElementType } from "../simulation/elements";
import type { EmitterDefinition, EmitterFixtureType } from "../simulation/emitters";
import type { HearthSnapshot, ObstacleDefinition } from "../simulation/world";

import { drawGlassKiln, drawGrains, drawOutlinedRect } from "./fixtureDrawing";

export const DEFAULT_EMITTER_FIXTURE_BY_ELEMENT: Readonly<Record<ElementType, EmitterFixtureType>> =
  {
    ash: "ash-sifter",
    dirt: "clay-chute",
    fire: "charcoal-bed",
    glass: "glass-kiln",
    mud: "slurry-pipe",
    sand: "sand-pump",
    smoke: "soot-vent",
    steam: "copper-vent",
    water: "hose",
  };

export interface EmitterFixtureRenderOptions {
  readonly cellSize: number;
  readonly height: number;
  readonly tick: number;
  readonly width: number;
}

interface FixtureBounds {
  readonly centerX: number;
  readonly centerY: number;
  readonly height: number;
  readonly width: number;
  readonly x: number;
  readonly y: number;
}

export function getEmitterFixtureType(emitter: EmitterDefinition): EmitterFixtureType {
  return emitter.fixture ?? DEFAULT_EMITTER_FIXTURE_BY_ELEMENT[emitter.element];
}

export function drawEmitterFixtures(
  context: CanvasRenderingContext2D,
  emitters: readonly EmitterDefinition[],
  options: EmitterFixtureRenderOptions,
): void {
  for (const emitter of emitters) {
    drawEmitterFixture(context, emitter, options);
  }
}

export function drawHearth(
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

export function drawObstacle(
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

function drawEmitterFixture(
  context: CanvasRenderingContext2D,
  emitter: EmitterDefinition,
  options: EmitterFixtureRenderOptions,
): void {
  const bounds = getFixtureBounds(emitter, options);

  switch (getEmitterFixtureType(emitter)) {
    case "ash-sifter":
      drawAshSifter(context, bounds, options.cellSize);
      return;
    case "charcoal-bed":
      drawCharcoalBed(context, bounds, options.cellSize, options.tick);
      return;
    case "clay-chute":
      drawClayChute(context, bounds, options.cellSize);
      return;
    case "copper-vent":
      drawCopperVent(context, bounds, options.cellSize, options.tick);
      return;
    case "glass-kiln":
      drawGlassKiln(context, bounds, options.cellSize, options.tick);
      return;
    case "hose":
      drawHose(context, bounds, options.cellSize, options.tick);
      return;
    case "sand-pump":
      drawSandPump(context, bounds, options.cellSize);
      return;
    case "slurry-pipe":
      drawSlurryPipe(context, bounds, options.cellSize, options.tick);
      return;
    case "soot-vent":
      drawSootVent(context, bounds, options.cellSize, options.tick);
      return;
  }
}

function getFixtureBounds(
  emitter: EmitterDefinition,
  options: EmitterFixtureRenderOptions,
): FixtureBounds {
  const cellSize = options.cellSize;
  const spanCenter = ((emitter.range.start + emitter.range.end + 1) / 2) * cellSize;
  const spanSize = Math.max((emitter.range.end - emitter.range.start + 1) * cellSize, cellSize * 5);
  const width = emitter.edge === "left" || emitter.edge === "right" ? cellSize * 5 : spanSize;
  const height = emitter.edge === "top" || emitter.edge === "bottom" ? cellSize * 5 : spanSize;

  if (emitter.edge === "bottom") {
    return createBounds(spanCenter - width / 2, options.height * cellSize - height, width, height);
  }

  if (emitter.edge === "left") {
    return createBounds(0, spanCenter - height / 2, width, height);
  }

  if (emitter.edge === "right") {
    return createBounds(options.width * cellSize - width, spanCenter - height / 2, width, height);
  }

  return createBounds(spanCenter - width / 2, 0, width, height);
}

function createBounds(x: number, y: number, width: number, height: number): FixtureBounds {
  return {
    centerX: x + width / 2,
    centerY: y + height / 2,
    height,
    width,
    x,
    y,
  };
}

function drawHose(
  context: CanvasRenderingContext2D,
  bounds: FixtureBounds,
  cellSize: number,
  tick: number,
): void {
  const hoseHeight = cellSize * 2;
  drawOutlinedRect(context, bounds.x, bounds.y + cellSize, bounds.width, hoseHeight, "#4f9fd9");
  drawOutlinedRect(
    context,
    bounds.centerX - cellSize,
    bounds.y + cellSize * 3,
    cellSize * 2,
    cellSize,
    "#b8894a",
  );
  context.fillStyle = tick % 8 < 4 ? "#68b7e8" : "#9acff0";
  context.fillRect(bounds.centerX - cellSize / 2, bounds.y + cellSize * 4, cellSize, cellSize);
}

function drawSandPump(
  context: CanvasRenderingContext2D,
  bounds: FixtureBounds,
  cellSize: number,
): void {
  drawOutlinedRect(context, bounds.x, bounds.y + cellSize, bounds.width, cellSize * 2, "#8d9294");
  drawOutlinedRect(
    context,
    bounds.centerX - cellSize,
    bounds.y + cellSize * 3,
    cellSize * 2,
    cellSize,
    "#5f6467",
  );
  context.fillStyle = "#d7bd72";
  drawGrains(context, bounds.centerX, bounds.y + cellSize * 4, cellSize);
}

function drawCharcoalBed(
  context: CanvasRenderingContext2D,
  bounds: FixtureBounds,
  cellSize: number,
  tick: number,
): void {
  drawOutlinedRect(
    context,
    bounds.x,
    bounds.y + cellSize * 2,
    bounds.width,
    cellSize * 2,
    "#2c1f1a",
  );
  context.fillStyle = "#5f3f2d";
  context.fillRect(
    bounds.x + cellSize,
    bounds.y + cellSize * 2,
    bounds.width - cellSize * 2,
    cellSize,
  );
  context.fillStyle = tick % 2 === 0 ? "#f26d3d" : "#f9d36a";
  context.fillRect(bounds.centerX - cellSize, bounds.y + cellSize, cellSize * 2, cellSize * 2);
}

function drawCopperVent(
  context: CanvasRenderingContext2D,
  bounds: FixtureBounds,
  cellSize: number,
  tick: number,
): void {
  drawOutlinedRect(
    context,
    bounds.centerX - cellSize,
    bounds.y + cellSize,
    cellSize * 2,
    cellSize * 3,
    "#b77845",
  );
  drawOutlinedRect(
    context,
    bounds.centerX - cellSize * 2,
    bounds.y + cellSize * 3,
    cellSize * 4,
    cellSize,
    "#74482f",
  );
  context.fillStyle = tick % 8 < 4 ? "#eef1f2" : "#c5ccd1";
  context.fillRect(bounds.centerX - cellSize / 2, bounds.y, cellSize, cellSize);
}

function drawClayChute(
  context: CanvasRenderingContext2D,
  bounds: FixtureBounds,
  cellSize: number,
): void {
  context.fillStyle = "#111111";
  context.beginPath();
  context.moveTo(bounds.x, bounds.y + cellSize);
  context.lineTo(bounds.x + bounds.width, bounds.y + cellSize);
  context.lineTo(bounds.centerX + cellSize, bounds.y + cellSize * 4);
  context.lineTo(bounds.centerX - cellSize, bounds.y + cellSize * 4);
  context.closePath();
  context.fill();
  context.fillStyle = "#b1794c";
  context.fillRect(
    bounds.x + cellSize,
    bounds.y + cellSize * 1.5,
    bounds.width - cellSize * 2,
    cellSize,
  );
  context.fillStyle = "#8a6a45";
  drawGrains(context, bounds.centerX, bounds.y + cellSize * 4, cellSize);
}

function drawSlurryPipe(
  context: CanvasRenderingContext2D,
  bounds: FixtureBounds,
  cellSize: number,
  tick: number,
): void {
  drawOutlinedRect(
    context,
    bounds.x + cellSize,
    bounds.y + cellSize,
    bounds.width - cellSize * 2,
    cellSize * 2,
    "#6f4d3b",
  );
  drawOutlinedRect(
    context,
    bounds.centerX - cellSize,
    bounds.y + cellSize * 3,
    cellSize * 2,
    cellSize,
    "#4e3c2f",
  );
  context.fillStyle = tick % 8 < 4 ? "#5f4a38" : "#77604a";
  context.fillRect(bounds.centerX - cellSize / 2, bounds.y + cellSize * 4, cellSize, cellSize);
}

function drawSootVent(
  context: CanvasRenderingContext2D,
  bounds: FixtureBounds,
  cellSize: number,
  tick: number,
): void {
  drawOutlinedRect(
    context,
    bounds.centerX - cellSize,
    bounds.y + cellSize * 2,
    cellSize * 2,
    cellSize * 2,
    "#3d3d3a",
  );
  drawOutlinedRect(
    context,
    bounds.centerX - cellSize * 1.5,
    bounds.y + cellSize * 3,
    cellSize * 3,
    cellSize,
    "#222220",
  );
  context.fillStyle = tick % 8 < 4 ? "#8b8f91" : "#a2a6a8";
  context.fillRect(bounds.centerX - cellSize / 2, bounds.y, cellSize, cellSize);
}

function drawAshSifter(
  context: CanvasRenderingContext2D,
  bounds: FixtureBounds,
  cellSize: number,
): void {
  drawOutlinedRect(
    context,
    bounds.x + cellSize,
    bounds.y + cellSize * 2,
    bounds.width - cellSize * 2,
    cellSize,
    "#9a9690",
  );
  drawOutlinedRect(
    context,
    bounds.centerX - cellSize * 2,
    bounds.y + cellSize * 3,
    cellSize * 4,
    cellSize,
    "#6f6a62",
  );
  context.fillStyle = "#6f6a62";
  drawGrains(context, bounds.centerX, bounds.y + cellSize * 4, cellSize);
}
