export interface BucketProgress {
  readonly accepted: number;
  readonly required: number;
  readonly target: string;
}

export interface ParticleCount {
  readonly count: number;
  readonly element: string;
}

export interface StatusTextOptions {
  readonly buckets: readonly BucketProgress[];
  readonly activeInputLabel: string;
  readonly debugEnabled: boolean;
  readonly isComplete: boolean;
  readonly levelTitle: string;
  readonly particleCounts: readonly ParticleCount[];
  readonly tick: number;
}

export function createStatusText(options: StatusTextOptions): string {
  if (options.debugEnabled) {
    return [
      options.levelTitle,
      `tick ${String(options.tick)}`,
      formatParticleCounts(options.particleCounts),
      `input: ${options.activeInputLabel}`,
      formatBucketProgress(options.buckets),
    ].join(" | ");
  }

  if (options.isComplete) {
    return `${options.levelTitle} | complete`;
  }

  return `${options.levelTitle} | ${formatBucketProgress(options.buckets)}`;
}

export function formatParticleCounts(counts: readonly ParticleCount[]): string {
  if (counts.length === 0) {
    return "no particles";
  }

  return counts.map(({ count, element }) => `${element}: ${String(count)}`).join(" / ");
}

export function formatBucketProgress(buckets: readonly BucketProgress[]): string {
  if (buckets.length === 0) {
    return "no buckets";
  }

  return buckets
    .map(
      ({ accepted, required, target }) =>
        `${target}: ${String(Math.floor(accepted))}/${String(required)}`,
    )
    .join(" / ");
}
