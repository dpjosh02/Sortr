export type GameAction = "reset" | "toggle-debug";

export interface ActionMap {
  keyboard: Readonly<Record<string, GameAction>>;
}

export function createActionMap(): ActionMap {
  return {
    keyboard: {
      d: "toggle-debug",
      r: "reset",
    },
  };
}
