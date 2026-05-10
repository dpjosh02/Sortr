export const EMPTY_CELL = 0;

export const ELEMENTS = ["water", "sand", "fire", "steam"] as const;

export type ElementType = (typeof ELEMENTS)[number];

export type CellValue = typeof EMPTY_CELL | ElementType;

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
