import type { ElementStorage, ElementType } from "./elements";

export type ReactionRule = HearthHeatReactionRule | NeighborContactReactionRule;

export interface ReactionParticipant {
  readonly element: ElementType;
  readonly storage: ElementStorage;
}

export interface NeighborContactReactionProduct {
  readonly element: ElementType;
  readonly location: "neighbor-cell" | "source-cell";
}

export interface HearthHeatReactionProduct {
  readonly element: ElementType;
  readonly location: "heated-cell";
}

export interface NeighborContactReactionRule {
  readonly consumeNeighbor: boolean;
  readonly consumeSource: boolean;
  readonly id: string;
  readonly kind: "neighbor-contact";
  readonly neighbor: ReactionParticipant;
  readonly products: readonly NeighborContactReactionProduct[];
  readonly source: ReactionParticipant & { readonly storage: "particle" };
}

export interface HearthHeatReactionRule {
  readonly consumeReactant: boolean;
  readonly id: string;
  readonly kind: "hearth-heat";
  readonly products: readonly HearthHeatReactionProduct[];
  readonly reactant: ReactionParticipant;
}

export const REACTION_RULES: readonly ReactionRule[] = [
  {
    consumeNeighbor: true,
    consumeSource: true,
    id: "water-fire-to-steam",
    kind: "neighbor-contact",
    neighbor: {
      element: "water",
      storage: "liquid-layer",
    },
    products: [
      {
        element: "steam",
        location: "source-cell",
      },
    ],
    source: {
      element: "fire",
      storage: "particle",
    },
  },
  {
    consumeReactant: true,
    id: "hearth-heat-water-to-steam",
    kind: "hearth-heat",
    products: [
      {
        element: "steam",
        location: "heated-cell",
      },
    ],
    reactant: {
      element: "water",
      storage: "liquid-layer",
    },
  },
];

export function getNeighborContactReactionRules(): readonly NeighborContactReactionRule[] {
  return REACTION_RULES.filter((rule) => rule.kind === "neighbor-contact");
}

export function getHearthHeatReactionRules(): readonly HearthHeatReactionRule[] {
  return REACTION_RULES.filter((rule) => rule.kind === "hearth-heat");
}
