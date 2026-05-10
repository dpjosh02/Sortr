export interface SeededRandom {
  next(): number;
  nextInt(maxExclusive: number): number;
  pickDirection(): -1 | 1;
}

export function createSeededRandom(seed: number): SeededRandom {
  let state = seed >>> 0;

  return {
    next(): number {
      state += 0x6d2b79f5;
      let value = state;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    },
    nextInt(maxExclusive: number): number {
      if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
        throw new Error("maxExclusive must be a positive integer.");
      }

      return Math.floor(this.next() * maxExclusive);
    },
    pickDirection(): -1 | 1 {
      return this.nextInt(2) === 0 ? -1 : 1;
    },
  };
}
