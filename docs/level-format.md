# Level Format

## Purpose

Level data should be declarative, reviewable, and separate from engine code. A level describes the initial world setup and goals; simulation systems decide how it runs.

## Format Choice

Use TypeScript objects for early development so level definitions get typechecking and editor support. A JSON-compatible shape should be preserved so a later level editor can save and load levels.

## Level Definition Shape

```ts
type LevelDefinition = {
  id: string;
  title: string;
  background: string;
  grid: {
    width: number;
    height: number;
    cellSize: number;
  };
  emitters: EmitterDefinition[];
  buckets: BucketDefinition[];
  obstacles: ObstacleDefinition[];
  tutorialHint?: string;
};
```

## Emitters

```ts
type EmitterDefinition = {
  id: string;
  element: ElementType;
  edge: "top" | "right" | "bottom" | "left";
  range: {
    start: number;
    end: number;
  };
  ratePerSecond: number;
  maxParticles?: number;
};
```

MVP emitters are continuous and may omit `maxParticles`. If max limits are added later, they should be level-authored.

## Buckets

```ts
type BucketDefinition = {
  id: string;
  target: ElementType;
  required: number;
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  intake: "top" | "full-rect";
};
```

MVP buckets only accept pure matching elements. Wrong elements do not count. Buckets behave as open-top containers: their left, right, and bottom borders block material, only the top opening accepts material, and fill progress is measured from matching material currently settled inside the bucket interior.

## Obstacles

```ts
type ObstacleDefinition = {
  id: string;
  kind: "solid-rect" | "solid-line" | "filter" | "heat-zone" | "cold-zone";
  rect?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  line?: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    thickness: number;
  };
  accepts?: ElementType[];
};
```

Only solid obstacles are required for MVP. Filters and temperature zones are reserved for later levels.

## Backgrounds

Backgrounds should use soft solid colors, not busy illustrations. The color is level-authored so levels can feel distinct while preserving readability.

## Tutorial Hints

Hints are optional and should be short. They are allowed in early levels but should not explain every solution. The game should teach primarily through level structure.

## Initial Level Catalog

### 001-first-flow

- Teaches line drawing and water flow.
- One water emitter.
- One water bucket.
- No obstacles.

### 002-piles

- Teaches sand piling.
- One sand emitter.
- One offset sand bucket.
- One simple obstacle ledge.

### 003-two-streams

- Teaches separating elements.
- Water emitter and sand emitter.
- Water bucket and sand bucket.
- Buckets positioned so direct paths cross unless the player manages flow.

### 004-make-it-rise

- Teaches water + fire -> steam.
- Water emitter.
- Fire emitter or fixed fire source.
- Steam bucket near upper area.
- Obstacles encourage routing water into fire first.

### 005-crossing-paths

- Teaches multi-goal routing.
- Water bucket and steam bucket.
- Water and fire sources.
- Central obstacle layout encourages multiple line strategies.

## Level Validation

A level should be considered valid if:

- All ids are unique.
- Grid dimensions are positive.
- Emitters spawn inside or adjacent to the declared edge.
- Buckets fit inside the grid.
- Obstacles fit inside the grid.
- Required bucket counts are positive.
- Target elements exist in the element registry.

Validation should run in tests once the level catalog exists.
