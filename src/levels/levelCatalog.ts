import type { WorldDefinition } from "../simulation/world";

export interface LevelDefinition {
  readonly id: string;
  readonly title: string;
  readonly background: string;
  readonly cellSize: number;
  readonly world: WorldDefinition;
}

export const LEVEL_CATALOG: readonly LevelDefinition[] = [
  {
    background: "#dfe9dc",
    cellSize: 4,
    id: "001-first-flow",
    title: "First Flow",
    world: {
      buckets: [
        {
          id: "water-bucket",
          intake: "full-rect",
          rect: {
            height: 24,
            width: 28,
            x: 188,
            y: 126,
          },
          required: 60,
          target: "water",
        },
      ],
      emitters: [
        {
          edge: "top",
          element: "water",
          id: "water-source",
          range: {
            end: 54,
            start: 48,
          },
          ratePerTick: 1,
        },
      ],
      height: 160,
      seed: 20260510,
      width: 240,
    },
  },
  {
    background: "#e4eadf",
    cellSize: 4,
    id: "002-piles",
    title: "Piles",
    world: {
      buckets: [
        {
          id: "sand-bucket",
          intake: "full-rect",
          rect: {
            height: 24,
            width: 30,
            x: 32,
            y: 126,
          },
          required: 70,
          target: "sand",
        },
      ],
      emitters: [
        {
          edge: "top",
          element: "sand",
          id: "sand-source",
          range: {
            end: 170,
            start: 164,
          },
          ratePerTick: 0.75,
        },
      ],
      height: 160,
      seed: 20260510,
      width: 240,
    },
  },
];

export function getInitialLevel(): LevelDefinition {
  return getLevelByIndex(0);
}

export function getLevelByIndex(index: number): LevelDefinition {
  const level = LEVEL_CATALOG[index];

  if (level === undefined) {
    throw new Error(`Missing level at index ${String(index)}.`);
  }

  return level;
}

export function getNextLevelIndex(index: number): number | null {
  return index + 1 < LEVEL_CATALOG.length ? index + 1 : null;
}
