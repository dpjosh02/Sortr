import "./styles.css";

import { createActionMap } from "../input/actionMap";
import { createCanvasRenderer } from "../rendering/canvasRenderer";

const app = document.querySelector<HTMLDivElement>("#app");

if (app === null) {
  throw new Error("Missing #app mount node.");
}

const canvas = document.createElement("canvas");
canvas.width = 960;
canvas.height = 640;
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

const toolbar = document.createElement("div");
toolbar.className = "toolbar";
toolbar.append(resetButton, debugButton);

const header = document.createElement("header");
header.className = "app-header";
header.append(title, toolbar);

const shell = document.createElement("main");
shell.className = "game-shell";
shell.append(canvas);

app.append(header, shell);

const renderer = createCanvasRenderer(canvas);
const actions = createActionMap();

renderer.clear("#dfe9dc");
renderer.drawPlaceholder("Snapshot 1: tooling and canvas shell");

resetButton.addEventListener("click", () => {
  renderer.clear("#dfe9dc");
  renderer.drawPlaceholder("Reset ready");
});

debugButton.addEventListener("click", () => {
  debugButton.toggleAttribute("aria-pressed");
});

window.addEventListener("keydown", (event) => {
  const action = actions.keyboard[event.key];

  if (action === "reset") {
    resetButton.click();
  }
});
