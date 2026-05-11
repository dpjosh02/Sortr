import type { ElementType } from "../elements";
import type { GridPoint } from "../lines";

import { assertPositiveInteger, isInside, toIndex } from "./grid";
import type { BucketDefinition, BucketSnapshot, BucketState, MutableWorldState } from "./types";

export function createBucketState(definition: BucketDefinition): BucketState {
  assertPositiveInteger("bucket required", definition.required);
  assertPositiveInteger("bucket width", definition.rect.width);
  assertPositiveInteger("bucket height", definition.rect.height);

  return {
    accepted: 0,
    definition,
    settled: 0,
  };
}

export function processBuckets(state: MutableWorldState): void {
  for (const bucket of state.buckets) {
    let accepted = 0;

    for (const point of getBucketInteriorCells(bucket.definition)) {
      if (!isInside(state, point.x, point.y)) {
        continue;
      }

      accepted += getBucketCellFill(state, bucket.definition.target, point.x, point.y);
    }

    bucket.accepted = Math.min(bucket.definition.required, accepted);
    bucket.settled = accepted;
  }
}

export function createBucketSnapshots(buckets: readonly BucketState[]): BucketSnapshot[] {
  return buckets.map((bucket) => ({
    accepted: bucket.accepted,
    id: bucket.definition.id,
    intake: bucket.definition.intake,
    rect: bucket.definition.rect,
    required: bucket.definition.required,
    settled: bucket.settled,
    target: bucket.definition.target,
  }));
}

export function isWorldComplete(state: MutableWorldState): boolean {
  return (
    state.buckets.length > 0 &&
    state.buckets.every((bucket) => bucket.accepted >= bucket.definition.required - 0.1)
  );
}

function getBucketCellFill(
  state: MutableWorldState,
  target: ElementType,
  x: number,
  y: number,
): number {
  const index = toIndex(state, x, y);

  if (target === "water") {
    return state.water[index] ?? 0;
  }

  return state.cells[index] === target ? 1 : 0;
}

function getBucketInteriorCells(bucket: BucketDefinition): GridPoint[] {
  const cells: GridPoint[] = [];
  const startY = bucket.intake === "bottom" ? bucket.rect.y + 1 : bucket.rect.y;
  const endY =
    bucket.intake === "top"
      ? bucket.rect.y + bucket.rect.height - 2
      : bucket.rect.y + bucket.rect.height - 1;
  const startX = bucket.rect.x + 1;
  const endX = bucket.rect.x + bucket.rect.width - 2;

  for (let y = startY; y <= endY; y += 1) {
    for (let x = startX; x <= endX; x += 1) {
      cells.push({ x, y });
    }
  }

  return cells;
}
