import {
  DEV_SANDBOX_ELEMENTS,
  applyDevSandboxPointerAction,
  getDevSandboxElementForKey,
  getDevSandboxElementLabel,
  isDevToolsToggleKey,
  type DevSandboxElement,
} from "../dev/sandboxTools";
import { createActionMap } from "../input/actionMap";
import {
  createPointerDrawingController,
  type PointerDrawAction,
  type PointerDrawingController,
} from "../input/pointerController";
import {
  LEVEL_CATALOG,
  getInitialLevel,
  getLevelByIndex,
  getNextLevelIndex,
  type LevelDefinition,
} from "../levels/levelCatalog";
import { createCanvasRenderer, type CanvasRenderer } from "../rendering/canvasRenderer";
import { createWorld, type World } from "../simulation/world";
import { createCompletionText, createLevelContextText } from "../ui/campaignText";
import { createGameHud, type GameHud } from "../ui/hud";
import { createStatusText } from "../ui/statusText";

import { createGameLoop } from "./loop";

export interface GameController {
  destroy(): void;
  start(): void;
}

export function mountGame(mountNode: HTMLElement): GameController {
  let devToolsVisible = false;
  let selectedDevSandboxElement: DevSandboxElement | null = null;
  let selectDevSandboxElementFromHud: (element: DevSandboxElement) => void = () => undefined;
  let selectPlayerLineFromHud: () => void = () => undefined;

  const hud = createGameHud({
    devSandboxElements: DEV_SANDBOX_ELEMENTS,
    getDevSandboxElementLabel,
    levels: LEVEL_CATALOG,
    onDevSandboxElementSelect: (element) => {
      selectDevSandboxElementFromHud(element);
    },
    onPlayerLineSelect: () => {
      selectPlayerLineFromHud();
    },
  });

  mountNode.replaceChildren(hud.element);

  let levelIndex = 0;
  let level = getInitialLevel();
  let world = createWorld(level.world);
  const renderer = createCanvasRenderer(hud.canvas);
  const controller = createControllerState({
    getDevToolsVisible: () => devToolsVisible,
    getLevel: () => level,
    getLevelIndex: () => levelIndex,
    getSelectedDevSandboxElement: () => selectedDevSandboxElement,
    getWorld: () => world,
    hud,
    renderer,
    setDevToolsVisible: (visible) => {
      devToolsVisible = visible;

      if (!devToolsVisible) {
        selectedDevSandboxElement = null;
      }

      hud.setDevToolsVisible(devToolsVisible);
      hud.setSelectedDevSandboxElement(selectedDevSandboxElement);
      render();
    },
    setLevel: (nextIndex, nextLevel, nextWorld) => {
      levelIndex = nextIndex;
      level = nextLevel;
      world = nextWorld;
    },
    setSelectedDevSandboxElement: (element) => {
      selectedDevSandboxElement = devToolsVisible ? element : null;
      hud.setSelectedDevSandboxElement(selectedDevSandboxElement);
      render();
    },
  });

  function render(): void {
    controller.render();
  }

  selectDevSandboxElementFromHud = (element) => {
    selectedDevSandboxElement = devToolsVisible ? element : null;
    hud.setSelectedDevSandboxElement(selectedDevSandboxElement);
    render();
  };

  selectPlayerLineFromHud = () => {
    selectedDevSandboxElement = null;
    hud.setSelectedDevSandboxElement(selectedDevSandboxElement);
    render();
  };

  controller.loadLevel(0);

  return {
    destroy(): void {
      controller.destroy();
    },
    start(): void {
      controller.start();
    },
  };
}

interface ControllerStateOptions {
  readonly getDevToolsVisible: () => boolean;
  readonly getLevel: () => LevelDefinition;
  readonly getLevelIndex: () => number;
  readonly getSelectedDevSandboxElement: () => DevSandboxElement | null;
  readonly getWorld: () => World;
  readonly hud: GameHud;
  readonly renderer: CanvasRenderer;
  readonly setDevToolsVisible: (visible: boolean) => void;
  readonly setLevel: (index: number, level: LevelDefinition, world: World) => void;
  readonly setSelectedDevSandboxElement: (element: DevSandboxElement) => void;
}

interface ControllerState {
  destroy(): void;
  loadLevel(index: number): void;
  render(): void;
  start(): void;
}

function createControllerState(options: ControllerStateOptions): ControllerState {
  const actions = createActionMap();
  const loop = createGameLoop({
    maxStepsPerFrame: 2,
    stepMs: 1000 / 36,
    update: () => {
      options.getWorld().step();
      render();
    },
  });
  const pointerController = createPointerController(options, render);

  function loadLevel(index: number): void {
    const level = getLevelByIndex(index);
    const world = createWorld(level.world);

    pointerController.cancel();
    options.setLevel(index, level, world);
    options.hud.setCanvasSize(
      level.world.width * level.cellSize,
      level.world.height * level.cellSize,
    );
    options.hud.setCompletionText(null);
    options.hud.setLevelContext(
      createLevelContextText({
        lesson: level.lesson,
        levelIndex: index,
        totalLevels: LEVEL_CATALOG.length,
      }),
    );
    options.hud.setLevelIndex(index);
    render();
  }

  function render(): void {
    const level = options.getLevel();
    const snapshot = options.getWorld().snapshot();
    const hasNextLevel = getNextLevelIndex(options.getLevelIndex()) !== null;

    options.renderer.drawWorld(snapshot, {
      background: level.background,
      cellSize: level.cellSize,
      emitters: level.world.emitters,
    });
    options.hud.setNextButtonVisible(snapshot.isComplete && hasNextLevel);
    options.hud.setCompletionText(
      createCompletionText({
        hasNextLevel,
        isComplete: snapshot.isComplete,
      }),
    );
    options.hud.setStatus(
      createStatusText({
        activeInputLabel: getActiveInputLabel(options.getSelectedDevSandboxElement()),
        buckets: snapshot.buckets,
        debugEnabled: options.getDevToolsVisible(),
        isComplete: snapshot.isComplete,
        levelTitle: level.title,
        particleCounts: snapshot.particleCounts,
        tick: snapshot.tick,
      }),
    );
  }

  function handleKeyDown(event: KeyboardEvent): void {
    const action = actions.keyboard[event.key];

    if (action === "reset") {
      loadLevel(options.getLevelIndex());
    }

    if (isDevToolsToggleKey(event.key)) {
      options.setDevToolsVisible(!options.getDevToolsVisible());
    }

    if (!options.getDevToolsVisible()) {
      return;
    }

    const devSandboxElement = getDevSandboxElementForKey(event.key);

    if (devSandboxElement !== null) {
      options.setSelectedDevSandboxElement(devSandboxElement);
    }
  }

  options.hud.resetButton.addEventListener("click", () => {
    loadLevel(options.getLevelIndex());
  });
  options.hud.nextButton.addEventListener("click", () => {
    const nextIndex = getNextLevelIndex(options.getLevelIndex());

    if (nextIndex !== null) {
      loadLevel(nextIndex);
    }
  });
  options.hud.levelSelect.addEventListener("change", () => {
    const index = Number(options.hud.levelSelect.value);

    if (Number.isInteger(index)) {
      loadLevel(index);
    }
  });
  options.hud.debugButton.addEventListener("click", () => {
    options.setDevToolsVisible(!options.getDevToolsVisible());
  });
  window.addEventListener("keydown", handleKeyDown);

  options.hud.setDevToolsVisible(options.getDevToolsVisible());
  options.hud.setSelectedDevSandboxElement(null);

  return {
    destroy(): void {
      pointerController.destroy();
      loop.stop();
      window.removeEventListener("keydown", handleKeyDown);
    },
    loadLevel,
    render,
    start(): void {
      render();
      loop.start();
    },
  };
}

function createPointerController(
  options: ControllerStateOptions,
  render: () => void,
): PointerDrawingController {
  return createPointerDrawingController({
    applyAction: (action) => {
      applyPointerAction(
        options.getWorld(),
        options.getDevToolsVisible() ? options.getSelectedDevSandboxElement() : null,
        action,
      );
    },
    canvas: options.hud.canvas,
    getGridSize: () => ({
      height: options.getWorld().height,
      width: options.getWorld().width,
    }),
    onChange: render,
  });
}

function applyPointerAction(
  world: World,
  devSandboxElement: DevSandboxElement | null,
  action: PointerDrawAction,
): void {
  if (devSandboxElement !== null) {
    applyDevSandboxPointerAction(world, devSandboxElement, action);
    return;
  }

  if (action.kind === "draw-point") {
    world.addLineCell(action.point.x, action.point.y);
    return;
  }

  world.addLineSegment(action.start, action.end);
}

function getActiveInputLabel(devSandboxElement: DevSandboxElement | null): string {
  return devSandboxElement === null
    ? "Line"
    : `Dev ${getDevSandboxElementLabel(devSandboxElement)}`;
}
