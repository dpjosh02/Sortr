export interface CanvasRenderer {
  clear(background: string): void;
  drawPlaceholder(message: string): void;
}

export function createCanvasRenderer(canvas: HTMLCanvasElement): CanvasRenderer {
  const context = canvas.getContext("2d");

  if (context === null) {
    throw new Error("Canvas 2D rendering context is unavailable.");
  }

  return {
    clear(background: string): void {
      context.fillStyle = background;
      context.fillRect(0, 0, canvas.width, canvas.height);
    },
    drawPlaceholder(message: string): void {
      context.fillStyle = "#1a1a16";
      context.font = "24px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(message, canvas.width / 2, canvas.height / 2);
    },
  };
}
