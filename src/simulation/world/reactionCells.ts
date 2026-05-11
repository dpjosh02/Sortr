import { EMPTY_CELL, isEmpty, usesLiquidLayer } from "../elements";
import type { ElementType } from "../elements";
import type { ReactionParticipant } from "../reactionRules";

import { clearElementCell, getWaterAmount, setElementCell, toIndex } from "./grid";
import { isStaticSolidCell } from "./solids";
import { MAX_WATER, MIN_WATER, type MutableWorldState } from "./types";

export function hasReactionParticipantAtCell(
  state: MutableWorldState,
  participant: ReactionParticipant,
  x: number,
  y: number,
): boolean {
  const index = toIndex(state, x, y);

  if (participant.storage === "liquid-layer") {
    return usesLiquidLayer(participant.element) && getWaterAmount(state, x, y) > MIN_WATER;
  }

  return state.cells[index] === participant.element;
}

export function consumeReactionParticipantAtIndex(
  state: MutableWorldState,
  participant: ReactionParticipant,
  index: number,
): void {
  if (participant.storage === "liquid-layer") {
    state.water[index] = 0;
    return;
  }

  clearElementCell(state, index);
}

export function placeReactionProductAtCell(
  state: MutableWorldState,
  element: ElementType,
  x: number,
  y: number,
): void {
  if (isStaticSolidCell(state, x, y)) {
    return;
  }

  const index = toIndex(state, x, y);

  if (!isEmpty(state.cells[index] ?? EMPTY_CELL)) {
    return;
  }

  if (usesLiquidLayer(element)) {
    state.water[index] = MAX_WATER;
    return;
  }

  setElementCell(state, index, element);
}
