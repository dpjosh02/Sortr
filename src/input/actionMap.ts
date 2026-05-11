export type GameAction = "reset";

export interface ActionMap {
  keyboard: Readonly<Record<string, GameAction>>;
}

export function createActionMap(): ActionMap {
  return {
    keyboard: {
      r: "reset",
    },
  };
}
