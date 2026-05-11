export const EMPTY_CELL = 0;
export const DRAWN_LINE_CELL = -1;

export type ElementBehaviorCategory = "energy-rise" | "gas-rise" | "liquid-flow" | "powder-fall";

export type ElementPhase = "energy" | "gas" | "liquid" | "powder";

export type ElementStorage = "liquid-layer" | "particle";

export interface ElementDefinition {
  readonly behavior: ElementBehaviorCategory;
  readonly density: number;
  readonly palette: readonly string[];
  readonly phase: ElementPhase;
  readonly storage: ElementStorage;
}

export const ELEMENT_REGISTRY = {
  ash: {
    behavior: "powder-fall",
    density: 0.9,
    palette: ["#6f6a62", "#58544f", "#8a8479"],
    phase: "powder",
    storage: "particle",
  },
  crystal: {
    behavior: "powder-fall",
    density: 2.1,
    palette: ["#c9b7f2", "#f1ecff", "#9f89d8"],
    phase: "powder",
    storage: "particle",
  },
  dirt: {
    behavior: "powder-fall",
    density: 1.7,
    palette: ["#8a6a45", "#765737", "#a07d55"],
    phase: "powder",
    storage: "particle",
  },
  fire: {
    behavior: "energy-rise",
    density: 0,
    palette: ["#f26d3d", "#f7a13d", "#f9d36a"],
    phase: "energy",
    storage: "particle",
  },
  glass: {
    behavior: "powder-fall",
    density: 2.4,
    palette: ["#a8d8cf", "#d7f0ea", "#79b9ae"],
    phase: "powder",
    storage: "particle",
  },
  sand: {
    behavior: "powder-fall",
    density: 2.2,
    palette: ["#d7bd72", "#c6a85f", "#e6cf8f"],
    phase: "powder",
    storage: "particle",
  },
  steam: {
    behavior: "gas-rise",
    density: 0.1,
    palette: ["#d8dde1", "#eef1f2", "#c5ccd1"],
    phase: "gas",
    storage: "particle",
  },
  mud: {
    behavior: "powder-fall",
    density: 1.9,
    palette: ["#5f4a38", "#4e3c2f", "#77604a"],
    phase: "powder",
    storage: "particle",
  },
  smoke: {
    behavior: "gas-rise",
    density: 0.05,
    palette: ["#8b8f91", "#a2a6a8", "#6f7476"],
    phase: "gas",
    storage: "particle",
  },
  water: {
    behavior: "liquid-flow",
    density: 1,
    palette: ["#4f9fd9", "#68b7e8", "#2f79bd"],
    phase: "liquid",
    storage: "liquid-layer",
  },
} as const satisfies Readonly<Record<string, ElementDefinition>>;

export type ElementType = keyof typeof ELEMENT_REGISTRY;

export const ELEMENTS = [
  "water",
  "sand",
  "fire",
  "steam",
  "dirt",
  "mud",
  "smoke",
  "ash",
  "glass",
  "crystal",
] as const satisfies readonly ElementType[];

export type CellValue = typeof DRAWN_LINE_CELL | typeof EMPTY_CELL | ElementType;

export const ELEMENT_DEFINITIONS: Readonly<Record<ElementType, ElementDefinition>> =
  ELEMENT_REGISTRY;

export const ELEMENT_PALETTE: Readonly<Record<ElementType, readonly string[]>> = {
  ash: ELEMENT_REGISTRY.ash.palette,
  crystal: ELEMENT_REGISTRY.crystal.palette,
  dirt: ELEMENT_REGISTRY.dirt.palette,
  fire: ELEMENT_REGISTRY.fire.palette,
  glass: ELEMENT_REGISTRY.glass.palette,
  mud: ELEMENT_REGISTRY.mud.palette,
  sand: ELEMENT_REGISTRY.sand.palette,
  smoke: ELEMENT_REGISTRY.smoke.palette,
  steam: ELEMENT_REGISTRY.steam.palette,
  water: ELEMENT_REGISTRY.water.palette,
};

export function isElement(value: CellValue): value is ElementType {
  return typeof value === "string";
}

export function isEmpty(value: CellValue): value is typeof EMPTY_CELL {
  return value === EMPTY_CELL;
}

export function isDrawnLine(value: CellValue): value is typeof DRAWN_LINE_CELL {
  return value === DRAWN_LINE_CELL;
}

export function getElementDefinition(element: ElementType): ElementDefinition {
  return ELEMENT_REGISTRY[element];
}

export function getElementPalette(element: ElementType): readonly string[] {
  return getElementDefinition(element).palette;
}

export function getElementsByBehavior(behavior: ElementBehaviorCategory): readonly ElementType[] {
  return ELEMENTS.filter((element) => getElementDefinition(element).behavior === behavior);
}

export function usesLiquidLayer(element: ElementType): boolean {
  return getElementDefinition(element).storage === "liquid-layer";
}

export function canDisplace(moving: ElementType, target: ElementType): boolean {
  const movingDefinition = getElementDefinition(moving);
  const targetDefinition = getElementDefinition(target);

  return targetDefinition.phase === "liquid" && movingDefinition.density > targetDefinition.density;
}
