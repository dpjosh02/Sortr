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
] as const satisfies readonly ElementType[];

export type CellValue = typeof DRAWN_LINE_CELL | typeof EMPTY_CELL | ElementType;

export const ELEMENT_DEFINITIONS: Readonly<Record<ElementType, ElementDefinition>> =
  ELEMENT_REGISTRY;

export const ELEMENT_PALETTE: Readonly<Record<ElementType, readonly string[]>> = {
  dirt: ELEMENT_REGISTRY.dirt.palette,
  fire: ELEMENT_REGISTRY.fire.palette,
  mud: ELEMENT_REGISTRY.mud.palette,
  sand: ELEMENT_REGISTRY.sand.palette,
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
