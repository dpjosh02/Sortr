import type { GridPoint } from "../lines";
import {
  getNeighborContactReactionRules,
  type NeighborContactReactionProduct,
  type NeighborContactReactionRule,
} from "../reactionRules";

import { isInside, toIndex } from "./grid";
import { getNeighborCells } from "./neighbors";
import {
  consumeReactionParticipantAtIndex,
  hasReactionParticipantAtCell,
  placeReactionProductAtCell,
} from "./reactionCells";
import type { MutableWorldState } from "./types";

export function processReactions(state: MutableWorldState): void {
  for (const rule of getNeighborContactReactionRules()) {
    processNeighborContactReaction(state, rule);
  }
}

function processNeighborContactReaction(
  state: MutableWorldState,
  rule: NeighborContactReactionRule,
): void {
  const productCells: QueuedReactionProduct[] = [];
  const consumedNeighbors = new Set<number>();
  const consumedSources = new Set<number>();

  for (let y = 0; y < state.height; y += 1) {
    for (let x = 0; x < state.width; x += 1) {
      const index = toIndex(state, x, y);

      if (consumedSources.has(index) || !hasReactionParticipantAtCell(state, rule.source, x, y)) {
        continue;
      }

      const reactantNeighbor = findReactantNeighbor(state, x, y, rule, consumedNeighbors);

      if (reactantNeighbor === null) {
        continue;
      }

      consumedNeighbors.add(toIndex(state, reactantNeighbor.x, reactantNeighbor.y));
      consumedSources.add(index);

      for (const product of rule.products) {
        productCells.push({
          element: product.element,
          point: getNeighborContactProductPoint(product, { x, y }, reactantNeighbor),
        });
      }
    }
  }

  if (rule.consumeNeighbor) {
    for (const index of consumedNeighbors) {
      consumeReactionParticipantAtIndex(state, rule.neighbor, index);
    }
  }

  if (rule.consumeSource) {
    for (const index of consumedSources) {
      consumeReactionParticipantAtIndex(state, rule.source, index);
    }
  }

  for (const product of productCells) {
    placeReactionProductAtCell(state, product.element, product.point.x, product.point.y);
  }
}

function findReactantNeighbor(
  state: MutableWorldState,
  x: number,
  y: number,
  rule: NeighborContactReactionRule,
  consumedNeighbors: ReadonlySet<number>,
): GridPoint | null {
  for (const neighbor of getNeighborCells(x, y)) {
    if (!isInside(state, neighbor.x, neighbor.y)) {
      continue;
    }

    const index = toIndex(state, neighbor.x, neighbor.y);

    if (consumedNeighbors.has(index)) {
      continue;
    }

    if (hasReactionParticipantAtCell(state, rule.neighbor, neighbor.x, neighbor.y)) {
      return neighbor;
    }
  }

  return null;
}

interface QueuedReactionProduct {
  readonly element: QueuedReactionProductElement;
  readonly point: GridPoint;
}

type QueuedReactionProductElement = NeighborContactReactionProduct["element"];

function getNeighborContactProductPoint(
  product: NeighborContactReactionProduct,
  source: GridPoint,
  neighbor: GridPoint,
): GridPoint {
  return product.location === "source-cell" ? source : neighbor;
}
