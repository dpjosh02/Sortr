import type { WorldDefinition } from "../simulation/world";

export interface LevelDefinition {
  readonly id: string;
  readonly title: string;
  readonly background: string;
  readonly cellSize: number;
  readonly lesson: string;
  readonly designerNotes: string;
  readonly world: WorldDefinition;
}
