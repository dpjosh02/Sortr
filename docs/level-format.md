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
  cellSize: number;
  lesson?: string;
  designerNotes?: string;
  tutorialHint?: string;
  unlock?: UnlockMetadata;
  world: WorldDefinition;
};

type UnlockMetadata = {
  order: number;
  requiresLevelId?: string;
  startsUnlocked?: boolean;
};

type WorldDefinition = {
  width: number;
  height: number;
  seed: number;
  emitters: EmitterDefinition[];
  buckets?: BucketDefinition[];
  hearths?: HearthDefinition[];
  obstacles?: ObstacleDefinition[];
};
```

The current implementation keeps render scale (`cellSize`) on the level and
simulation dimensions on `world`. This preserves a JSON-compatible level shape
while keeping renderer concerns out of the simulation world definition.

The first authored campaign levels should include `lesson` and `designerNotes`
even though the fields are optional in the general shape. Imported or prototype
levels may omit them, but snapshot-ready campaign levels should not.

## Emitters

```ts
type EmitterDefinition = {
  id: string;
  element: ElementType;
  edge: "top" | "right" | "bottom" | "left";
  fixture?: EmitterFixtureType;
  range: {
    start: number;
    end: number;
  };
  ratePerTick: number;
};
```

MVP emitters are continuous. `ratePerTick` may be fractional; emitter state carries the remainder deterministically across ticks. If max limits are added later, they should be level-authored.

`fixture` is optional render metadata. The simulation ignores it; the renderer uses it to draw a readable source object. When omitted, the renderer chooses a default fixture from the emitted element:

- `water`: hose.
- `sand`: sand pump.
- `fire`: charcoal bed.
- `steam`: copper vent.
- `dirt`: clay chute.
- `mud`: slurry pipe.
- `smoke`: soot vent.
- `ash`: ash sifter.

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
  intake: "top" | "bottom" | "full-rect";
};
```

MVP buckets count only matching target elements. Wrong elements may enter or settle inside the bucket, but they do not count toward progress and do not cause contamination, failure, or reset behavior. Buckets behave as open containers: side walls block material, the wall opposite the intake blocks material, and the intake side stays open. Falling materials usually use `top`; rising gases such as steam use `bottom`. Fill progress is measured from matching material currently settled inside the bucket interior.

## Obstacles

```ts
type ObstacleDefinition = {
  id: string;
  kind: "solid-rect" | "solid-line";
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
};

type HearthDefinition = {
  id: string;
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  heatRadius?: number;
  flameRatePerTick?: number;
};
```

Only solid obstacles are currently implemented. Filters and temperature zones are reserved for later levels and should be added to this type only when simulation support exists.

## Hearths

Hearths are static fire fixtures. They block material like a solid object, render an anchored flame, emit short-lived fire particles, and convert water in their heat zone into steam. Fire particles should have a short TTL so the hearth reads as a localized flame source instead of a permanent upward stream. Use hearths before raw fire emitters when a level introduces steam creation.

## Backgrounds

Backgrounds should use soft solid colors, not busy illustrations. The color is level-authored so levels can feel distinct while preserving readability.

## Tutorial Hints

Hints are optional and should be short. They are allowed in early levels but should not explain every solution. The game should teach primarily through level structure.

## Designer Notes

Each snapshot-ready authored campaign level should include:

- `lesson`: the single major idea the level is intended to teach.
- `designerNotes`: content-design context for reviewing the level without prescribing one exact solution.

Notes should explain why the layout exists, not the step-by-step solution.

## Unlock Metadata

MVP progression is linear next-level flow. Unlock metadata is optional in the
level format so the campaign order can be serialized explicitly once progression
persistence exists.

- `order` defines the linear campaign order.
- `requiresLevelId` can point to the previous level required for unlock.
- `startsUnlocked` should be true only for the first campaign level or explicit test content.

Level select is later scope. When added, it should allow replaying beaten or
otherwise unlocked levels, not skipping ahead through the campaign by default.

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

### 003-make-it-rise

- Teaches steam creation through a fixed hearth.
- Water emitter.
- Upside-down steam bucket.

### 004-two-streams

- Teaches separating elements.
- Water emitter and sand emitter.
- Water bucket and sand bucket.
- Buckets positioned so direct paths cross unless the player manages flow.

### 005-crossing-paths

- Teaches multi-goal routing.
- Water bucket and steam bucket.
- Water and fire sources.
- Central obstacle layout encourages multiple line strategies.

### 006-mix-the-earth

- Teaches the first post-MVP chemistry chain.
- Dirt emitter and water emitter.
- Mud bucket.
- Open space lets players choose where to mix before routing the result.

### 007-warm-the-mud

- Teaches heat as a continuation of the dirt and mud chain.
- Mud emitter.
- Fixed hearth.
- Upside-down steam bucket.

### 008-smoke-and-ash

- Teaches combustion as a split-output chain.
- Dirt emitter.
- Fixed hearth.
- Upside-down smoke bucket and top-opening ash bucket.

### 009-branching-reactions

- Teaches branching one source into two reaction paths.
- Dirt emitter and water emitter.
- Fixed hearth.
- Mud bucket and upside-down smoke bucket.
- Open space gives players room to choose how much dirt to wet and how much to heat.

## Level Validation

A level should be considered valid if:

- All ids are unique.
- Grid dimensions are positive.
- Emitters spawn inside or adjacent to the declared edge.
- Buckets fit inside the grid.
- Obstacles fit inside the grid.
- Required bucket counts are positive.
- Target elements exist in the element registry.
- Snapshot-ready campaign levels include a lesson and designer notes.
- Unlock metadata, if present, points to an existing level id and preserves linear campaign order.

Validation should run in tests once the level catalog exists.
