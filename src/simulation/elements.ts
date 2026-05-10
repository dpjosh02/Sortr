export const EMPTY_CELL = 0;

export const ELEMENTS = ["water", "sand", "fire", "steam"] as const;

export type ElementType = (typeof ELEMENTS)[number];

export type CellValue = typeof EMPTY_CELL | ElementType;

export type ElementPhase = "energy" | "gas" | "liquid" | "powder";

export interface ElementDefinition {
  readonly density: number;
  readonly phase: ElementPhase;
}

export const ELEMENT_DEFINITIONS: Readonly<Record<ElementType, ElementDefinition>> = {
  fire: {
    density: 0,
    phase: "energy",
  },
  sand: {
    density: 2.2,
    phase: "powder",
  },
  steam: {
    density: 0.1,
    phase: "gas",
  },
  water: {
    density: 1,
    phase: "liquid",
  },
};

export const ELEMENT_PALETTE: Readonly<Record<ElementType, readonly string[]>> = {
  fire: ["#f26d3d", "#f7a13d", "#f9d36a"],
  sand: ["#d7bd72", "#c6a85f", "#e6cf8f"],
  steam: ["#d8dde1", "#eef1f2", "#c5ccd1"],
  water: ["#4f9fd9", "#68b7e8", "#2f79bd"],
};

export function isElement(value: CellValue): value is ElementType {
  return value !== EMPTY_CELL;
}

export function isEmpty(value: CellValue): value is typeof EMPTY_CELL {
  return value === EMPTY_CELL;
}

export function canDisplace(moving: ElementType, target: ElementType): boolean {
  const movingDefinition = ELEMENT_DEFINITIONS[moving];
  const targetDefinition = ELEMENT_DEFINITIONS[target];

  return targetDefinition.phase === "liquid" && movingDefinition.density > targetDefinition.density;
}
