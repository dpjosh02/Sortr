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
  {
    background: "#e2e2dc",
    cellSize: 4,
    designerNotes:
      "This introduces the smoke and ash family with one clear split: heating dirt creates a rising goal material and a falling byproduct that players can route separately.",
    id: "008-smoke-and-ash",
    lesson: "Burn dirt into rising smoke and falling ash.",
    title: "Smoke and Ash",
    world: {
      buckets: [
        {
          id: "smoke-bucket",
          intake: "bottom",
          rect: { height: 24, width: 40, x: 166, y: 20 },
          required: 16,
          target: "smoke",
        },
        {
          id: "ash-bucket",
          intake: "top",
          rect: { height: 24, width: 40, x: 28, y: 126 },
          required: 24,
          target: "ash",
        },
      ],
      emitters: [
        {
          edge: "top",
          element: "dirt",
          id: "dirt-source",
          range: { end: 76, start: 70 },
          ratePerTick: 0.6,
        },
      ],
      hearths: [
        {
          flameRatePerTick: 0.8,
          heatRadius: 2,
          id: "ember-hearth",
          rect: { height: 4, width: 16, x: 108, y: 148 },
        },
      ],
      height: 160,
      seed: 20260510,
      width: 240,
    },
  },
  {
    background: "#e5e1d7",
    cellSize: 4,
    designerNotes:
      "This review level uses one dirt source with a water side and a hearth side, inviting players to split the stream instead of solving a single straight route.",
    id: "009-branching-reactions",
    lesson: "Split one dirt source into wet and hot reaction paths.",
    title: "Branching Reactions",
    world: {
      buckets: [
        {
          id: "mud-bucket",
          intake: "top",
          rect: { height: 24, width: 40, x: 26, y: 126 },
          required: 24,
          target: "mud",
        },
        {
          id: "smoke-bucket",
          intake: "bottom",
          rect: { height: 24, width: 40, x: 174, y: 20 },
          required: 14,
          target: "smoke",
        },
      ],
      emitters: [
        {
          edge: "top",
          element: "water",
          id: "water-source",
          range: { end: 48, start: 42 },
          ratePerTick: 0.4,
        },
        {
          edge: "top",
          element: "dirt",
          id: "dirt-source",
          range: { end: 120, start: 114 },
          ratePerTick: 0.6,
        },
      ],
      hearths: [
        {
          flameRatePerTick: 0.75,
          heatRadius: 2,
          id: "branching-hearth",
          rect: { height: 4, width: 16, x: 150, y: 148 },
        },
      ],
      height: 160,
      seed: 20260511,
      width: 240,
    },
  },
];
