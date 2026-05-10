export interface GameLoop {
  start(): void;
  stop(): void;
}

export interface GameLoopOptions {
  readonly update: () => void;
  readonly maxStepsPerFrame: number;
  readonly stepMs: number;
}

export function createGameLoop(options: GameLoopOptions): GameLoop {
  let animationFrameId: number | null = null;
  let previousTime: number | null = null;
  let accumulatedMs = 0;

  function frame(time: number): void {
    previousTime ??= time;

    accumulatedMs += time - previousTime;
    previousTime = time;

    let steps = 0;

    while (accumulatedMs >= options.stepMs && steps < options.maxStepsPerFrame) {
      options.update();
      accumulatedMs -= options.stepMs;
      steps += 1;
    }

    animationFrameId = window.requestAnimationFrame(frame);
  }

  return {
    start(): void {
      if (animationFrameId !== null) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(frame);
    },
    stop(): void {
      if (animationFrameId === null) {
        return;
      }

      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
      previousTime = null;
      accumulatedMs = 0;
    },
  };
}
