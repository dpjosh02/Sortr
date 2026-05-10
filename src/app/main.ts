import "./styles.css";

import { createGameLoop } from "../game/loop";
import { createActionMap } from "../input/actionMap";
import { getInitialLevel } from "../levels/levelCatalog";
import { createCanvasRenderer } from "../rendering/canvasRenderer";
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

const title = document.createElement("h1");
title.textContent = "Sortr";

const resetButton = document.createElement("button");
resetButton.type = "button";
resetButton.textContent = "Reset";

const debugButton = document.createElement("button");
debugButton.type = "button";
debugButton.textContent = "Debug";

const status = document.createElement("p");
status.className = "status-line";

const toolbar = document.createElement("div");
toolbar.className = "toolbar";
toolbar.append(resetButton, debugButton);

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

function render(): void {
  const snapshot = world.snapshot();
  renderer.drawWorld(snapshot, {
    background: level.background,
    cellSize: level.cellSize,
  });
  status.textContent = debugEnabled
    ? `${level.title} | tick ${String(snapshot.tick)} | ${formatParticleCounts(snapshot.particleCounts)}`
    : `${level.title} | deterministic water and sand flow`;
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

window.addEventListener("keydown", (event) => {
  const action = actions.keyboard[event.key];

  if (action === "reset") {
    resetButton.click();
  }

  if (action === "toggle-debug") {
    debugButton.click();
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
