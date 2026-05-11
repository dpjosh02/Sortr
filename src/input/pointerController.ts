import type { GridPoint } from "../simulation/lines";

import { getCanvasGridPoint } from "./pointer";

export type PointerDrawAction =
  | {
      readonly kind: "draw-point";
      readonly point: GridPoint;
    }
  | {
      readonly end: GridPoint;
      readonly kind: "draw-segment";
      readonly start: GridPoint;
    };

export interface PointerDrawingController {
  cancel(): void;
  destroy(): void;
}

export interface PointerDrawingControllerOptions {
  readonly applyAction: (action: PointerDrawAction) => void;
  readonly canvas: HTMLCanvasElement;
  readonly getGridSize: () => {
    readonly height: number;
    readonly width: number;
  };
  readonly onChange?: () => void;
}

export function createPointerDrawingController(
  options: PointerDrawingControllerOptions,
): PointerDrawingController {
  let activePointerId: number | null = null;
  let previousDrawPoint: GridPoint | null = null;

  function getDrawPoint(event: PointerEvent): GridPoint {
    const gridSize = options.getGridSize();

    return getCanvasGridPoint({
      canvas: options.canvas,
      clientX: event.clientX,
      clientY: event.clientY,
      gridHeight: gridSize.height,
      gridWidth: gridSize.width,
    });
  }

  function apply(action: PointerDrawAction): void {
    options.applyAction(action);
    options.onChange?.();
  }

  function handleContextMenu(event: MouseEvent): void {
    event.preventDefault();
  }

  function handlePointerDown(event: PointerEvent): void {
    if (event.button !== 0) {
      return;
    }

    activePointerId = event.pointerId;
    options.canvas.setPointerCapture(event.pointerId);
    previousDrawPoint = getDrawPoint(event);
    apply(createPointerDrawAction(previousDrawPoint));
  }

  function handlePointerMove(event: PointerEvent): void {
    if (activePointerId !== event.pointerId || previousDrawPoint === null) {
      return;
    }

    const nextPoint = getDrawPoint(event);
    apply(createPointerDrawAction(previousDrawPoint, nextPoint));
    previousDrawPoint = nextPoint;
  }

  function endDraw(pointerId: number): void {
    if (activePointerId !== pointerId) {
      return;
    }

    if (options.canvas.hasPointerCapture(pointerId)) {
      options.canvas.releasePointerCapture(pointerId);
    }

    activePointerId = null;
    previousDrawPoint = null;
  }

  function handlePointerUp(event: PointerEvent): void {
    endDraw(event.pointerId);
  }

  function handlePointerCancel(event: PointerEvent): void {
    endDraw(event.pointerId);
  }

  options.canvas.addEventListener("contextmenu", handleContextMenu);
  options.canvas.addEventListener("pointerdown", handlePointerDown);
  options.canvas.addEventListener("pointermove", handlePointerMove);
  options.canvas.addEventListener("pointerup", handlePointerUp);
  options.canvas.addEventListener("pointercancel", handlePointerCancel);

  function cancel(): void {
    if (activePointerId !== null) {
      endDraw(activePointerId);
    }
  }

  return {
    cancel,
    destroy(): void {
      cancel();
      options.canvas.removeEventListener("contextmenu", handleContextMenu);
      options.canvas.removeEventListener("pointerdown", handlePointerDown);
      options.canvas.removeEventListener("pointermove", handlePointerMove);
      options.canvas.removeEventListener("pointerup", handlePointerUp);
      options.canvas.removeEventListener("pointercancel", handlePointerCancel);
    },
  };
}

export function createPointerDrawAction(start: GridPoint, end?: GridPoint): PointerDrawAction {
  return end === undefined
    ? {
        kind: "draw-point",
        point: start,
      }
    : {
        end,
        kind: "draw-segment",
        start,
      };
}
