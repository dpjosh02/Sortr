import type { DevSandboxElement } from "../dev/sandboxTools";
import type { LevelDefinition } from "../levels/levelCatalog";

import { createDevBrushPalette } from "./devBrushPalette";

export interface GameHud {
  readonly canvas: HTMLCanvasElement;
  readonly debugButton: HTMLButtonElement;
  readonly element: HTMLElement;
  readonly levelSelect: HTMLSelectElement;
  readonly nextButton: HTMLButtonElement;
  readonly resetButton: HTMLButtonElement;
  setCanvasSize(width: number, height: number): void;
  setDevToolsVisible(visible: boolean): void;
  setSelectedDevSandboxElement(element: DevSandboxElement | null): void;
  setLevelIndex(index: number): void;
  setNextButtonVisible(visible: boolean): void;
  setStatus(text: string): void;
}

export interface GameHudOptions {
  readonly devSandboxElements: readonly DevSandboxElement[];
  readonly getDevSandboxElementLabel: (element: DevSandboxElement) => string;
  readonly levels: readonly LevelDefinition[];
  readonly onDevSandboxElementSelect: (element: DevSandboxElement) => void;
  readonly onPlayerLineSelect: () => void;
}

export function createGameHud(options: GameHudOptions): GameHud {
  const canvas = document.createElement("canvas");
  canvas.className = "playfield";
  canvas.setAttribute("aria-label", "Sortr particle playfield");

  const title = document.createElement("h1");
  title.textContent = "Sortr";

  const resetButton = createButton("Reset");
  const debugButton = createButton("Dev");
  const nextButton = createButton("Next");
  nextButton.hidden = true;

  const levelSelect = createLevelSelect(options.levels);
  const devBrushPalette = createDevBrushPalette({
    elements: options.devSandboxElements,
    getElementLabel: options.getDevSandboxElementLabel,
    onElementSelect: options.onDevSandboxElementSelect,
    onPlayerLineSelect: options.onPlayerLineSelect,
  });
  const status = document.createElement("p");
  status.className = "status-line";

  const toolbar = document.createElement("div");
  toolbar.className = "toolbar";
  toolbar.append(levelSelect, resetButton, nextButton, debugButton, devBrushPalette.element);

  const header = document.createElement("header");
  header.className = "app-header";
  header.append(title, toolbar);

  const shell = document.createElement("main");
  shell.className = "game-shell";
  shell.append(canvas, status);

  const element = document.createElement("div");
  element.className = "app-root";
  element.append(header, shell);

  return {
    canvas,
    debugButton,
    element,
    levelSelect,
    nextButton,
    resetButton,
    setCanvasSize(width: number, height: number): void {
      canvas.width = width;
      canvas.height = height;
    },
    setDevToolsVisible(visible: boolean): void {
      debugButton.toggleAttribute("aria-pressed", visible);
      levelSelect.hidden = !visible;
      devBrushPalette.setVisible(visible);
    },
    setSelectedDevSandboxElement(element: DevSandboxElement | null): void {
      devBrushPalette.setSelectedElement(element);
    },
    setLevelIndex(index: number): void {
      levelSelect.value = String(index);
    },
    setNextButtonVisible(visible: boolean): void {
      nextButton.hidden = !visible;
    },
    setStatus(text: string): void {
      status.textContent = text;
    },
  };
}

function createButton(label: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;

  return button;
}

function createLevelSelect(levels: readonly LevelDefinition[]): HTMLSelectElement {
  const levelSelect = document.createElement("select");
  levelSelect.className = "level-select dev-level-select";
  levelSelect.hidden = true;
  levelSelect.setAttribute("aria-label", "Dev level");

  for (let index = 0; index < levels.length; index += 1) {
    const level = levels[index];

    if (level === undefined) {
      continue;
    }

    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `${String(index + 1)}. ${level.title}`;
    levelSelect.append(option);
  }

  return levelSelect;
}
