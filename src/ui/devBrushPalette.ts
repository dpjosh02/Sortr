import type { DevSandboxElement } from "../dev/sandboxTools";

export interface DevBrushPalette {
  readonly element: HTMLDivElement;
  setSelectedElement(element: DevSandboxElement | null): void;
  setVisible(visible: boolean): void;
}

export interface DevBrushPaletteOptions {
  readonly elements: readonly DevSandboxElement[];
  readonly getElementLabel: (element: DevSandboxElement) => string;
  readonly onElementSelect: (element: DevSandboxElement) => void;
  readonly onPlayerLineSelect: () => void;
}

export function createDevBrushPalette(options: DevBrushPaletteOptions): DevBrushPalette {
  const palette = document.createElement("div");
  palette.className = "dev-brush-palette";
  palette.hidden = true;

  const label = document.createElement("span");
  label.className = "dev-brush-palette__label";
  label.textContent = "Dev brushes";
  palette.append(label);

  const lineButton = createButton("Line");
  lineButton.addEventListener("click", () => {
    options.onPlayerLineSelect();
  });
  palette.append(lineButton);

  const elementButtons = new Map<DevSandboxElement, HTMLButtonElement>();

  for (const element of options.elements) {
    const button = createButton(options.getElementLabel(element));
    button.addEventListener("click", () => {
      options.onElementSelect(element);
    });
    elementButtons.set(element, button);
    palette.append(button);
  }

  return {
    element: palette,
    setSelectedElement(element: DevSandboxElement | null): void {
      lineButton.toggleAttribute("aria-pressed", element === null);

      for (const [buttonElement, button] of elementButtons) {
        button.toggleAttribute("aria-pressed", buttonElement === element);
      }
    },
    setVisible(visible: boolean): void {
      palette.hidden = !visible;
    },
  };
}

function createButton(label: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;

  return button;
}
