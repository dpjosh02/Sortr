import type { LevelDefinition } from "./levelTypes";

export const MVP_LEVELS: readonly LevelDefinition[] = [
  {
    background: "#dfe9dc",
    cellSize: 4,
    designerNotes:
      "Give the player a generous first target and empty space so any readable ramp, chute, or catch basin can teach that drawn lines redirect flow.",
    id: "001-first-flow",
    lesson: "Draw ramps to guide falling water into a bucket.",
    title: "First Flow",
    world: {
      buckets: [
        {
          id: "water-bucket",
          intake: "top",
          rect: { height: 24, width: 36, x: 180, y: 126 },
          required: 60,
          target: "water",
        },
      ],
      emitters: [
        {
          edge: "top",
          element: "water",
          id: "water-source",
          range: { end: 54, start: 48 },
          ratePerTick: 1,
        },
      ],
      height: 160,
      seed: 20260510,
      width: 240,
    },
  },
  {
    background: "#e4eadf",
    cellSize: 4,
    designerNotes:
      "Sand should visibly pile on a simple ledge before spilling, giving players room to build broad catch shapes instead of threading grains through a narrow path.",
    id: "002-piles",
    lesson: "Sand piles, avalanches, and needs support differently than water.",
    title: "Piles",
    world: {
      buckets: [
        {
          id: "sand-bucket",
          intake: "top",
          rect: { height: 24, width: 36, x: 30, y: 126 },
          required: 70,
          target: "sand",
        },
      ],
      emitters: [
        {
          edge: "top",
          element: "sand",
          id: "sand-source",
          range: { end: 170, start: 164 },
          ratePerTick: 0.75,
        },
      ],
      height: 160,
      obstacles: [
        {
          id: "pile-ledge",
          kind: "solid-line",
          line: { thickness: 2, x1: 112, x2: 180, y1: 96, y2: 96 },
        },
      ],
      seed: 20260510,
      width: 240,
    },
  },
  {
    background: "#e3e9e7",
    cellSize: 4,
    designerNotes:
      "The fixed hearth sits low and broad enough to read as the conversion tool; the steam bucket is high and bottom-opening so the level teaches routing upward output, not precision timing.",
    id: "003-make-it-rise",
    lesson: "Route water into a hearth to create rising steam.",
    title: "Make It Rise",
    world: {
      buckets: [
        {
          id: "steam-bucket",
          intake: "bottom",
          rect: { height: 24, width: 38, x: 148, y: 24 },
          required: 18,
          target: "steam",
        },
      ],
      emitters: [
        {
          edge: "top",
          element: "water",
          id: "water-source",
          range: { end: 66, start: 60 },
          ratePerTick: 0.8,
        },
      ],
      hearths: [
        {
          heatRadius: 3,
          id: "hearth",
          rect: { height: 4, width: 16, x: 120, y: 148 },
        },
      ],
      height: 160,
      seed: 20260510,
      width: 240,
    },
  },
  {
    background: "#e7e5dd",
    cellSize: 4,
    designerNotes:
      "Two independent sources and opposite goals ask players to separate streams with broad dividers or basins; no obstacle should imply a single intended drawing.",
    id: "004-two-streams",
    lesson: "Separate water and sand so each reaches only its matching bucket.",
    title: "Two Streams",
    world: {
      buckets: [
        {
          id: "water-bucket",
          intake: "top",
          rect: { height: 24, width: 34, x: 24, y: 126 },
          required: 45,
          target: "water",
        },
        {
          id: "sand-bucket",
          intake: "top",
          rect: { height: 24, width: 34, x: 182, y: 126 },
          required: 55,
          target: "sand",
        },
      ],
      emitters: [
        {
          edge: "top",
          element: "water",
          id: "water-source",
          range: { end: 75, start: 69 },
          ratePerTick: 0.75,
        },
        {
          edge: "top",
          element: "sand",
          id: "sand-source",
          range: { end: 141, start: 135 },
          ratePerTick: 0.65,
        },
      ],
      height: 160,
      seed: 20260510,
      width: 240,
    },
  },
  {
    background: "#e1e8df",
    cellSize: 4,
    designerNotes:
      "This combines prior lessons with open central geometry: players can split water early, stage water near the hearth, or build steam chimneys without needing a pixel-perfect crossing.",
    id: "005-crossing-paths",
    lesson: "Balance direct water collection with steam creation in the same space.",
    title: "Crossing Paths",
    world: {
      buckets: [
        {
          id: "water-bucket",
          intake: "top",
          rect: { height: 22, width: 34, x: 24, y: 128 },
          required: 38,
          target: "water",
        },
        {
          id: "steam-bucket",
          intake: "bottom",
          rect: { height: 24, width: 38, x: 170, y: 18 },
          required: 18,
          target: "steam",
        },
      ],
      emitters: [
        {
          edge: "top",
          element: "water",
          id: "water-source",
          range: { end: 73, start: 67 },
          ratePerTick: 0.7,
        },
      ],
      hearths: [
        {
          heatRadius: 3,
          id: "right-hearth",
          rect: { height: 4, width: 12, x: 166, y: 144 },
        },
      ],
      height: 160,
      obstacles: [
        {
          id: "upper-shelf",
          kind: "solid-line",
          line: { thickness: 2, x1: 84, x2: 138, y1: 58, y2: 58 },
        },
        {
          id: "center-baffle",
          kind: "solid-line",
          line: { thickness: 2, x1: 128, x2: 108, y1: 78, y2: 112 },
        },
        {
          id: "lower-shelf",
          kind: "solid-line",
          line: { thickness: 2, x1: 94, x2: 154, y1: 124, y2: 124 },
        },
      ],
      seed: 20260510,
      width: 240,
    },
  },
];
