import type { LevelDefinition } from "./levelTypes";

export const CHEMISTRY_LEVELS: readonly LevelDefinition[] = [
  {
    background: "#e6e4d8",
    cellSize: 4,
    designerNotes:
      "The first post-MVP chemistry level keeps both inputs visible and gives the mud bucket a broad target so players can experiment with where to make the reaction happen.",
    id: "006-mix-the-earth",
    lesson: "Combine dirt and water to make mud before routing it to the bucket.",
    title: "Mix the Earth",
    world: {
      buckets: [
        {
          id: "mud-bucket",
          intake: "top",
          rect: { height: 24, width: 40, x: 100, y: 126 },
          required: 32,
          target: "mud",
        },
      ],
      emitters: [
        {
          edge: "top",
          element: "dirt",
          id: "dirt-source",
          range: { end: 58, start: 52 },
          ratePerTick: 0.55,
        },
        {
          edge: "top",
          element: "water",
          id: "water-source",
          range: { end: 178, start: 172 },
          ratePerTick: 0.45,
        },
      ],
      height: 160,
      seed: 20260510,
      width: 240,
    },
  },
  {
    background: "#e4e0d5",
    cellSize: 4,
    designerNotes:
      "This level teaches the reversible-feeling part of the first chemistry family: mud can be heated into rising steam while the leftover dirt falls away.",
    id: "007-warm-the-mud",
    lesson: "Heat mud to release steam while dirt falls away.",
    title: "Warm the Mud",
    world: {
      buckets: [
        {
          id: "steam-bucket",
          intake: "bottom",
          rect: { height: 24, width: 40, x: 158, y: 20 },
          required: 16,
          target: "steam",
        },
      ],
      emitters: [
        {
          edge: "top",
          element: "mud",
          id: "mud-source",
          range: { end: 72, start: 66 },
          ratePerTick: 0.55,
        },
      ],
      hearths: [
        {
          flameRatePerTick: 0.7,
          heatRadius: 2,
          id: "drying-hearth",
          rect: { height: 4, width: 16, x: 104, y: 148 },
        },
      ],
      height: 160,
      seed: 20260510,
      width: 240,
    },
  },
];
