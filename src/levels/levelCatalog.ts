import { CHEMISTRY_LEVELS } from "./chemistryLevels";
import type { LevelDefinition } from "./levelTypes";
import { MVP_LEVELS } from "./mvpLevels";

export type { LevelDefinition } from "./levelTypes";

export const LEVEL_CATALOG: readonly LevelDefinition[] = [...MVP_LEVELS, ...CHEMISTRY_LEVELS];

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
