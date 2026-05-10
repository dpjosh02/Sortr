# Simulation Model

## Purpose

The simulation model defines how Sortr's falling-sand world behaves independently from rendering. It must be deterministic, testable, and readable enough that new element behavior can be added without rewriting the engine.

## World Representation

The world is a fixed-size 2D grid. Each cell can contain one primary occupant:

- Empty space.
- A particle.
- A static obstacle.
- A player-drawn line cell.
- A bucket intake cell.
- An emitter cell.

Some systems may keep metadata outside the cell grid, such as bucket fill counts, emitter timers, or particle age.

## Coordinate System

- Origin: top-left of the simulation grid.
- `x` increases to the right.
- `y` increases downward.
- Gravity-driven particles generally prefer increasing `y`.
- Rising gases generally prefer decreasing `y`.

## Simulation Tick

Each tick should:

1. Spawn particles from emitters according to emitter rules.
2. Process reactions between neighboring particles.
3. Move particles according to element behavior.
4. Process bucket intake.
5. Update bucket completion state.
6. Publish a read-only state view for rendering.

The exact ordering can be revised if tests prove another order gives better gameplay, but the order must remain explicit and documented.

## Determinism

The simulation must be deterministic for a given:

- Level definition.
- Initial seed.
- Sequence of player draw actions.
- Number of ticks.

Random choices must use a seeded random generator owned by the simulation layer. Tests must not depend on `Math.random()`.

## Particle Identity

MVP particles do not need long-lived object identity unless required by debugging. A cell-based representation is preferred for performance and simplicity.

Each particle should minimally track:

- Element type.
- Variant or color index.
- Age or lifetime when needed.
- Temperature or state flags only when a mechanic requires them.

## Cell Types

### Empty

Available for particles to enter.

### Particle

Dynamic element cell.

### Drawn Line

Permanent collision cell created by player drawing. It blocks most particles. It is cleared by reset. Later, acid may dissolve line cells.

### Static Obstacle

Level-authored collision geometry. It is not cleared by reset except through full level restart.

### Bucket Intake

Goal region that accepts only a configured target element for MVP. Wrong elements do not count and should be blocked, ignored, or visibly rejected based on later tuning.

### Emitter

Level-authored source that continuously introduces particles from a border or defined cell range.

## Movement Families

### Liquids

Examples: water.

Default preference:

1. Down.
2. Down-left or down-right.
3. Left or right.

Liquids should spread and settle into low areas.

### Powders

Examples: sand.

Default preference:

1. Down.
2. Down-left or down-right.

Powders should pile naturally and should not spread horizontally like liquids.

### Gases

Examples: steam.

Default preference:

1. Up.
2. Up-left or up-right.
3. Left or right.

Gases should rise and drift without feeling perfectly uniform.

### Energy / Fire

Examples: fire.

Fire is a dynamic element with flicker-like movement and reaction behavior. It may rise slightly or remain near its source depending on tuning.

## MVP Elements

### Water

- Type: liquid.
- Direction: gravity-driven.
- Bucket target: yes.
- Reaction: creates steam when contacting fire.

### Sand

- Type: powder.
- Direction: gravity-driven.
- Bucket target: yes.
- Reaction: none in MVP.

### Fire

- Type: energy/dynamic.
- Direction: slight upward flicker or source-bound movement.
- Bucket target: possibly later, not required for MVP.
- Reaction: creates steam when contacting water.

### Steam

- Type: gas.
- Direction: rises.
- Bucket target: yes.
- Reaction: none in MVP.

## MVP Reaction Rules

### Water + Fire -> Steam

When water contacts fire in an orthogonal or diagonal neighboring cell:

- At least one of the two cells should become steam.
- The other cell may become empty or steam depending on tuning.
- The behavior must be deterministic and test-covered.

Initial recommendation:

- Water cell becomes steam.
- Fire cell has a chance-like deterministic lifetime reduction or is consumed in simple MVP form.

For the first implementation, prefer the simpler rule:

- Water cell becomes steam.
- Fire cell becomes empty.

If that makes levels too easy or fire too fragile, revise after playtesting.

## Reaction Priority

Reaction priority should be explicit. MVP priority:

1. Bucket intake.
2. Water + fire.
3. Movement.

This keeps target collection predictable. If reactions need to happen before buckets for better gameplay, change the order deliberately and update tests.

## Drawn Line Collision

Player drawing stamps line cells along the pointer path using grid-space interpolation. Lines:

- Block water, sand, fire, and steam in MVP.
- Persist until reset.
- Are not individually erasable.
- Have no ink limit.
- May be dissolved by acid later.

## Bucket Logic

Buckets track:

- Target element.
- Required count.
- Current accepted count.
- Intake cells.
- Completion state.

For MVP:

- Only matching pure elements count.
- Wrong elements do not count.
- Filled buckets can either continue accepting matching elements or become blocked after completion. This should be tuned during playtesting.

Initial recommendation:

- Continue accepting matching elements after completion.
- Ignore wrong elements for now.

## Performance Targets

Initial targets:

- 60 FPS on a normal desktop browser for tutorial levels.
- Simulation grid target around 240 x 160 cells or similar.
- Particle count target around 10,000 active cells before optimization work.

Performance tuning should prioritize:

- Active region scanning.
- Typed arrays for cell data.
- Avoiding per-particle object allocation in hot loops.
- Rendering via `ImageData` or batched rect drawing after measurement.

## Testing Targets

Core tests should cover:

- Movement for water, sand, and steam.
- Collision against drawn lines.
- Emitter spawning.
- Water + fire reaction.
- Bucket matching and wrong-element rejection.
- Reset behavior.
- Determinism with a fixed seed and input sequence.
