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
    consumeNeighbor: true,
    consumeSource: true,
    id: "fire-mud-to-steam-dirt",
    kind: "neighbor-contact",
    neighbor: {
      element: "mud",
      storage: "particle",
    },
    products: [
      {
        element: "steam",
        location: "source-cell",
      },
      {
        element: "dirt",
        location: "neighbor-cell",
      },
    ],
    source: {
      element: "fire",
      storage: "particle",
    },
  },
  {
    consumeNeighbor: true,
    consumeSource: true,
    id: "fire-dirt-to-smoke-ash",
    kind: "neighbor-contact",
    neighbor: {
      element: "dirt",
      storage: "particle",
    },
    products: [
      {
        element: "smoke",
        location: "source-cell",
      },
      {
        element: "ash",
        location: "neighbor-cell",
      },
    ],
    source: {
      element: "fire",
      storage: "particle",
    },
  },
  {
    consumeNeighbor: true,
    consumeSource: true,
    id: "fire-sand-to-glass",
    kind: "neighbor-contact",
    neighbor: {
      element: "sand",
      storage: "particle",
    },
    products: [
      {
        element: "glass",
        location: "neighbor-cell",
      },
    ],
    source: {
      element: "fire",
      storage: "particle",
    },
  },
  {
    consumeNeighbor: true,
    consumeSource: true,
    id: "steam-glass-to-crystal",
    kind: "neighbor-contact",
    neighbor: {
      element: "glass",
      storage: "particle",
    },
    products: [
      {
        element: "crystal",
        location: "neighbor-cell",
      },
    ],
    source: {
      element: "steam",
      storage: "particle",
    },
  },
  {
    consumeNeighbor: true,
    consumeSource: true,
    id: "dirt-water-to-mud",
    kind: "neighbor-contact",
    neighbor: {
      element: "water",
      storage: "liquid-layer",
    },
    products: [
      {
        element: "mud",
        location: "source-cell",
      },
    ],
    source: {
      element: "dirt",
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
