# Sortr PRD

## Working Title

Sortr

## Product Summary

Sortr is a browser puzzle game about guiding pixel-grain elements into matching buckets by drawing permanent black lines across a falling-sand playfield. Elements enter continuously from the borders of the play area, interact with one another, and can transform into new elements needed to solve later goals.

The game should feel closer to classic falling-sand and Sugar, Sugar style browser games than to a modern physics toy. Player creativity is central: levels should support several valid emergent solutions, not a single exact path.

## Player Fantasy

The player is a clever sorter and amateur alchemist. They study the flow of materials, sketch ramps and barriers, combine elements at useful points, and watch a satisfying cascade of particles produce the exact materials each bucket needs.

## Primary Verbs

- Draw permanent black lines.
- Reset drawn lines and simulation state.
- Observe particle flow and element reactions.
- Redirect particles into buckets.
- Combine elements to produce target elements.
- Advance through increasingly complex puzzle levels.

## Design Pillars

1. **Readable falling-sand behavior**  
   Particles should move in simple, legible ways. Water flows, sand piles, steam rises, fire flickers, and reactions should make visual sense.

2. **Creative puzzle solving**  
   Levels should leave room for experimentation. A solution can be messy if it satisfies the bucket goals.

3. **Small rules, rich outcomes**  
   Each element should have a compact behavior model, but interactions should combine into interesting chains.

4. **Pixel-art restraint**  
   Visuals should be simple, soft, and readable. Backgrounds use solid soft-tone colors. Elements use 2-3 related colors. Drawn lines are black and exactly follow pointer movement.

5. **Trustworthy engineering**  
   Simulation rules must be deterministic under test, separated from rendering, and protected by linting, typechecking, and focused automated tests.

## MVP Scope

The first playable snapshot should include:

- Vite + TypeScript project scaffold.
- Canvas 2D playfield.
- Deterministic grid-based particle simulation.
- Pointer drawing for permanent black collision lines.
- Reset button that clears lines and restarts the level.
- Continuous emitters from playfield borders.
- Buckets that only accept pure target elements.
- Level completion when all buckets reach their fill targets.
- Initial elements:
  - Water
  - Sand
  - Fire
  - Steam
- Initial reactions:
  - Water + fire -> steam.
  - Sand can pile and redirect flow.
  - Steam rises and can be routed to upper buckets.
- 3-5 hand-authored tutorial/puzzle levels.
- Debug overlay toggle for FPS, particle counts, and active level state.
- Robust linting, formatting, typechecking, and test scripts.

## Explicit Non-Goals For MVP

- Level editor.
- Failure states.
- Ink limits.
- Erasable lines.
- Mobile-first touch refinement beyond basic pointer compatibility.
- Audio.
- Save slots.
- Acid line erosion.
- Large element catalog.
- Procedural level generation.

## Later Scope

- Acid that erodes drawn lines or specific obstacles.
- Dirt, mud, smoke, ash, oil, lava, ice, moss, salt, brine, charcoal, and crystal.
- Bucket purity thresholds or contamination rules.
- Level editor.
- Level packs.
- Optional challenge objectives.
- Visual polish passes for particle blending and reaction effects.
- Sound effects and subtle ambience.

## Initial Element Progression

1. **Water**
   - Teaches flow, ramps, and bucket filling.

2. **Sand**
   - Teaches piling, blocking, and solid powder behavior.

3. **Fire**
   - Teaches destructive or transforming reactions.

4. **Steam**
   - Teaches upward routing and element creation.

5. **Dirt and mud**
   - Later family for clumping and filtration puzzles.

6. **Smoke and ash**
   - Later family for combustion chains.

7. **Acid**
   - Later family for altering player-drawn lines and obstacles.

## Level Design Principles

- Introduce one major idea at a time.
- Every new element needs a level where its behavior is obvious.
- Every new reaction needs a level where it is necessary or strongly useful.
- Levels should allow several valid player-drawn structures.
- Buckets should be positioned to encourage interaction chains, not just direct routing.
- Obstacles should create interesting constraints without making solutions pixel-perfect.
- No failure states initially; the player can reset when they dislike the result.

## Candidate Level Arc

1. **First Flow**
   - Water emitter from top-left, water bucket bottom-right.
   - Goal: learn drawing ramps.

2. **Piles**
   - Sand emitter from top, sand bucket below an offset opening.
   - Goal: learn powder piling and angled lines.

3. **Two Streams**
   - Water and sand emitters, two matching buckets.
   - Goal: split and isolate flows.

4. **Make It Rise**
   - Water and fire must meet to produce steam, with steam bucket near top.
   - Goal: introduce reaction chain.

5. **Crossing Paths**
   - Water bucket and steam bucket require routing materials through the same central region.
   - Goal: encourage creative line structures and timing.

## UX Requirements

- Particles flow immediately when a level starts.
- Pointer down begins drawing a line.
- Pointer movement stamps collision cells along the exact pointer path.
- Pointer up stops drawing.
- Reset clears all drawn lines and restarts level simulation.
- Completing all bucket goals unlocks the next level.
- The UI should be quiet and functional, with the canvas as the focus.
- DOM should handle menus, buttons, level select, debug toggles, and completion state.

## Technical Direction

Use a custom Canvas 2D renderer with TypeScript and a deterministic simulation core. Phaser is not the preferred MVP runtime because the hardest part of this game is not sprites, scenes, or tilemaps; it is direct control over a grid-based falling-sand simulation, reactions, and testable state transitions.

Simulation state must not live inside rendering code. Rendering should consume snapshots or read-only views of simulation state.

## Quality Requirements

- TypeScript strict mode is required.
- ESLint is required for correctness and import hygiene.
- Prettier is required for formatting.
- Vitest is required for simulation and level logic tests.
- Playwright should be added when browser interaction and rendering smoke tests become useful.
- `npm run verify` must run lint, typecheck, and tests before each user-test snapshot.

## Acceptance Criteria For First Snapshot

- A user can open the app in a browser and play at least three levels.
- Lines can be drawn and persist until reset.
- Water, sand, fire, and steam have distinct visible behavior.
- Water + fire produces steam in a deterministic, test-covered way.
- Buckets fill only from matching pure elements.
- Completing all buckets advances or presents the next level action.
- Reset returns the level to a clean initial state.
- `npm run verify` passes.

