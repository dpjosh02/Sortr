import "./styles.css";

import { createGameLoop } from "../game/loop";
import { createActionMap } from "../input/actionMap";
import { getCanvasGridPoint } from "../input/pointer";
import { getInitialLevel } from "../levels/levelCatalog";
import { createCanvasRenderer } from "../rendering/canvasRenderer";
import type { ElementType } from "../simulation/elements";
import { getLineCells, type GridPoint } from "../simulation/lines";
import { createWorld } from "../simulation/world";

const app = document.querySelector<HTMLDivElement>("#app");

if (app === null) {
  throw new Error("Missing #app mount node.");
}

const level = getInitialLevel();
let world = createWorld(level.world);

const canvas = document.createElement("canvas");
canvas.width = level.world.width * level.cellSize;
canvas.height = level.world.height * level.cellSize;
canvas.className = "playfield";
canvas.setAttribute("aria-label", "Sortr particle playfield");
canvas.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

const title = document.createElement("h1");
title.textContent = "Sortr";

const resetButton = document.createElement("button");
resetButton.type = "button";
resetButton.textContent = "Reset";

const debugButton = document.createElement("button");
debugButton.type = "button";
debugButton.textContent = "Debug";

type BrushMode = "line" | "sand" | "water";

const brushModes: readonly BrushMode[] = ["line", "water", "sand"];
const brushButtons = new Map<BrushMode, HTMLButtonElement>();
let selectedBrush: BrushMode = "line";

const brushPalette = document.createElement("div");
brushPalette.className = "brush-palette";

for (const brush of brushModes) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = getBrushLabel(brush);
  button.addEventListener("click", () => {
    selectedBrush = brush;
    syncBrushButtons();
  });
  brushButtons.set(brush, button);
  brushPalette.append(button);
}

const status = document.createElement("p");
status.className = "status-line";

const toolbar = document.createElement("div");
toolbar.className = "toolbar";
toolbar.append(brushPalette, resetButton, debugButton);

const header = document.createElement("header");
header.className = "app-header";
header.append(title, toolbar);

const shell = document.createElement("main");
shell.className = "game-shell";
shell.append(canvas, status);

app.append(header, shell);

const renderer = createCanvasRenderer(canvas);
const actions = createActionMap();
let debugEnabled = false;
let activePointerId: number | null = null;
let previousDrawPoint: GridPoint | null = null;
syncBrushButtons();

function render(): void {
  const snapshot = world.snapshot();
  renderer.drawWorld(snapshot, {
    background: level.background,
    cellSize: level.cellSize,
  });
  status.textContent = debugEnabled
    ? `${level.title} | tick ${String(snapshot.tick)} | ${formatParticleCounts(snapshot.particleCounts)}`
    : `${level.title} | ${getBrushLabel(selectedBrush)} brush`;
}

const loop = createGameLoop({
  maxStepsPerFrame: 4,
  stepMs: 1000 / 60,
  update: () => {
    world.step();
    render();
  },
});

render();
loop.start();

resetButton.addEventListener("click", () => {
  world = createWorld(level.world);
  render();
});

debugButton.addEventListener("click", () => {
  debugEnabled = !debugEnabled;
  debugButton.toggleAttribute("aria-pressed", debugEnabled);
  render();
});

canvas.addEventListener("pointerdown", (event) => {
  if (event.button !== 0) {
    return;
  }

  activePointerId = event.pointerId;
  canvas.setPointerCapture(event.pointerId);
  previousDrawPoint = getDrawPoint(event);
  applyBrushPoint(previousDrawPoint);
  render();
});

canvas.addEventListener("pointermove", (event) => {
  if (activePointerId !== event.pointerId || previousDrawPoint === null) {
    return;
  }

  const nextPoint = getDrawPoint(event);
  applyBrushSegment(previousDrawPoint, nextPoint);
  previousDrawPoint = nextPoint;
  render();
});

canvas.addEventListener("pointerup", (event) => {
  endDraw(event.pointerId);
});

canvas.addEventListener("pointercancel", (event) => {
  endDraw(event.pointerId);
});

window.addEventListener("keydown", (event) => {
  const action = actions.keyboard[event.key];

  if (action === "reset") {
    resetButton.click();
  }

  if (action === "toggle-debug") {
    debugButton.click();
  }

  if (event.key === "1") {
    selectedBrush = "line";
    syncBrushButtons();
  }

  if (event.key === "2") {
    selectedBrush = "water";
    syncBrushButtons();
  }

  if (event.key === "3") {
    selectedBrush = "sand";
    syncBrushButtons();
  }
});

function formatParticleCounts(
  counts: readonly { readonly count: number; readonly element: string }[],
): string {
  if (counts.length === 0) {
    return "no particles";
  }

  return counts.map(({ count, element }) => `${element}: ${String(count)}`).join(" / ");
}

function getDrawPoint(event: PointerEvent): GridPoint {
  return getCanvasGridPoint({
    canvas,
    clientX: event.clientX,
    clientY: event.clientY,
    gridHeight: world.height,
    gridWidth: world.width,
  });
}

function endDraw(pointerId: number): void {
  if (activePointerId !== pointerId) {
    return;
  }

  if (canvas.hasPointerCapture(pointerId)) {
    canvas.releasePointerCapture(pointerId);
  }

  activePointerId = null;
  previousDrawPoint = null;
}

function applyBrushPoint(point: GridPoint): void {
  if (selectedBrush === "line") {
    world.addLineCell(point.x, point.y);
    return;
  }

  stampElement(point, selectedBrush);
}

function applyBrushSegment(start: GridPoint, end: GridPoint): void {
  if (selectedBrush === "line") {
    world.addLineSegment(start, end);
    return;
  }

  for (const point of getLineCells(start, end)) {
    stampElement(point, selectedBrush);
  }
}

function stampElement(point: GridPoint, element: ElementType): void {
  const radius = 1;

  for (let y = point.y - radius; y <= point.y + radius; y += 1) {
    for (let x = point.x - radius; x <= point.x + radius; x += 1) {
      if (Math.abs(x - point.x) + Math.abs(y - point.y) <= radius) {
        world.addElementCell(x, y, element);
      }
    }
  }
}

function syncBrushButtons(): void {
  for (const [brush, button] of brushButtons) {
    button.toggleAttribute("aria-pressed", brush === selectedBrush);
  }
}

function getBrushLabel(brush: BrushMode): string {
  switch (brush) {
    case "line":
      return "Line";
    case "sand":
      return "Sand";
    case "water":
      return "Water";
  }
}
