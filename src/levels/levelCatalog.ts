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
    id: "snapshot-2-flow-lab",
    title: "Flow Lab",
    world: {
      emitters: [
        {
          edge: "top",
          element: "water",
          id: "water-source",
          range: {
            end: 82,
            start: 76,
          },
          ratePerTick: 1,
        },
        {
          edge: "top",
          element: "sand",
          id: "sand-source",
          range: {
            end: 160,
            start: 154,
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
  const level = LEVEL_CATALOG[0];

  if (level === undefined) {
    throw new Error("Level catalog must contain at least one level.");
  }

  return level;
}
