export interface LevelContextTextOptions {
  readonly lesson: string;
  readonly levelIndex: number;
  readonly totalLevels: number;
}

export interface CompletionTextOptions {
  readonly hasNextLevel: boolean;
  readonly isComplete: boolean;
}

export function createLevelContextText(options: LevelContextTextOptions): string {
  return `Level ${String(options.levelIndex + 1)} of ${String(options.totalLevels)} | ${options.lesson}`;
}

export function createCompletionText(options: CompletionTextOptions): string | null {
  if (!options.isComplete) {
    return null;
  }

  if (options.hasNextLevel) {
    return "Level complete. Continue to the next puzzle.";
  }

  return "Campaign complete. Reset to replay the finale.";
}
