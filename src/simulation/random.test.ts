import { describe, expect, it } from "vitest";

import { createSeededRandom } from "./random";

describe("createSeededRandom", () => {
  it("replays the same sequence for the same seed", () => {
    const first = createSeededRandom(42);
    const second = createSeededRandom(42);

    expect([first.next(), first.next(), first.nextInt(10), first.pickDirection()]).toEqual([
      second.next(),
      second.next(),
      second.nextInt(10),
      second.pickDirection(),
    ]);
  });

  it("rejects invalid integer bounds", () => {
    expect(() => createSeededRandom(1).nextInt(0)).toThrow(
      "maxExclusive must be a positive integer.",
    );
  });
});
