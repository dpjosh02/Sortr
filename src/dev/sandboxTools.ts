import type { PointerDrawAction } from "../input/pointerController";
import { ELEMENTS, type ElementType } from "../simulation/elements";
import { getLineCells, type GridPoint } from "../simulation/lines";
import type { World } from "../simulation/world";

export type DevSandboxElement = ElementType;

export interface DevSandboxStamp {
  readonly cells: readonly GridPoint[];
  readonly element: DevSandboxElement;
}

export const DEV_SANDBOX_ELEMENTS: readonly DevSandboxElement[] = ELEMENTS;

export function getDevSandboxElementLabel(element: DevSandboxElement): string {
  return `${element.charAt(0).toUpperCase()}${element.slice(1)}`;
}

export function isDevToolsToggleKey(key: string): boolean {
  return key === "d";
}

export function getDevSandboxElementForKey(key: string): DevSandboxElement | null {
  if (!/^[1-9]$/.test(key)) {
    return null;
  }

  const numericToolIndex = Number(key) - 1;

  return DEV_SANDBOX_ELEMENTS[numericToolIndex] ?? null;
}

export function createDevSandboxStamp(
  element: DevSandboxElement,
  start: GridPoint,
  end?: GridPoint,
): DevSandboxStamp {
  return {
    cells: getDevSandboxStampCells(start, end),
    element,
  };
}

export function getDevSandboxStampCells(start: GridPoint, end?: GridPoint): GridPoint[] {
  const path = end === undefined ? [start] : getLineCells(start, end);
  const cells: GridPoint[] = [];

  for (const point of path) {
    cells.push(...getDevSandboxBrushCells(point));
  }

  return cells;
}

export function getDevSandboxBrushCells(point: GridPoint): GridPoint[] {
  const radius = 1;
  const cells: GridPoint[] = [];

  for (let y = point.y - radius; y <= point.y + radius; y += 1) {
    for (let x = point.x - radius; x <= point.x + radius; x += 1) {
      if (Math.abs(x - point.x) + Math.abs(y - point.y) <= radius) {
        cells.push({ x, y });
      }
    }
  }

  return cells;
}

export function applyDevSandboxPointerAction(
  world: World,
  element: DevSandboxElement,
  action: PointerDrawAction,
): void {
  const stamp =
    action.kind === "draw-point"
      ? createDevSandboxStamp(element, action.point)
      : createDevSandboxStamp(element, action.start, action.end);

  for (const point of stamp.cells) {
    world.addElementCell(point.x, point.y, stamp.element);
  }
}
