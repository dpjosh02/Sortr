# Sortr PRD

## Working Title

Sortr

## Product Summary

Sortr is a soft cozy alchemy puzzle campaign about guiding pixel-grain elements into matching buckets by drawing permanent black lines across a falling-sand playfield. Elements enter continuously from authored sources, interact with one another, and can transform into new elements needed to solve later goals.

The MVP should feel closer to classic falling-sand and Sugar, Sugar style browser games than to an open-ended sandbox or modern physics toy. Player creativity is central, but it should happen inside short authored puzzle levels that support several valid emergent solutions, not a single exact path.

## Player Fantasy

The player is a clever sorter and amateur alchemist. They study the flow of materials, sketch ramps and barriers, combine elements at useful points, and watch a satisfying cascade of particles produce the exact materials each bucket needs.

## Primary Verbs

- Draw permanent black lines.
- Reset drawn lines and simulation state.
- Observe particle flow and element reactions.
- Redirect particles into buckets.
- Combine elements to produce target elements.
- Advance through a linear sequence of quick puzzle levels.

Normal player input in MVP is black-line drawing only. Element-spawning sandbox brushes may remain visible while the game is being tuned, but they are dev/playtesting tools and are not part of the core player toolset.

## Design Pillars

1. **Readable falling-sand behavior**  
   Particles should move in simple, legible ways. Water flows, sand piles, steam rises, fire flickers, and reactions should make visual sense.

2. **Creative puzzle solving**  
   Levels should leave room for experimentation. A solution can be messy if it satisfies the bucket goals.

3. **Small rules, rich outcomes**  
   Each element should have a compact behavior model, but interactions should combine into interesting chemistry chains. Future expansion should prioritize chemistry chains before tool-like mechanics such as erasers, acid line erosion, filters, or special player tools.

4. **Soft cozy alchemy identity**
   Visuals should be simple, soft, readable, and gently alchemical. Backgrounds use solid soft-tone colors. Elements use 2-3 related colors. Drawn lines are black and exactly follow pointer movement.

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
- Buckets that track matching target elements.
- Wrong elements may enter or settle inside buckets, but they do not count toward progress and do not cause contamination, failure, or reset behavior in MVP.
- Level completion when all buckets reach their fill targets.
- Linear next-level progression through the MVP campaign.
- Initial elements:
  - Water
  - Sand
  - Fire
  - Steam
- Initial reactions:
  - Water + fire -> steam.
  - Sand can pile and redirect flow.
  - Steam rises and can be routed to upper buckets.
- 3-5 hand-authored tutorial/puzzle levels designed as quick 1-3 minute solves.
- Debug overlay toggle for FPS, particle counts, and active level state.
- Temporary dev/playtesting sandbox brushes for spawning elements may exist behind debug UI, but normal player-facing gameplay remains black-line drawing only.
- Robust linting, formatting, typechecking, and test scripts.

## Explicit Non-Goals For MVP

- Level editor.
- Failure states.
- Ink limits.
- Erasable lines.
- Mobile-first touch refinement beyond basic pointer compatibility.
- Audio.
- Save slots.
- Unrestricted level select.
- Acid line erosion.
- Large element catalog.
- Procedural level generation.
- Core-player sandbox element brushes.
- Contamination, failure, or penalty behavior for wrong bucket contents.

## Later Scope

- Additional chemistry chains after dirt and mud: smoke, ash, oil, lava, ice, moss, salt, brine, charcoal, crystal, and related transformations.
- Level select for replaying beaten or otherwise unlocked levels.
- Bucket purity thresholds or contamination rules.
- Acid that erodes drawn lines or specific obstacles.
- Tool-like mechanics such as erasers, filters, temperature zones, or special player tools.
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
   - First post-MVP chemistry chain: water turns dirt into mud, then heat can release steam and leave dirt behind. Later tuning may add clumping or filtration puzzles.

6. **Smoke and ash**
   - Later family for combustion chains.

7. **Acid**
   - Later family for altering player-drawn lines and obstacles.

## Level Design Principles

- Introduce one major idea at a time.
- MVP levels should be quick solves, roughly 1-3 minutes for a player who understands the current lesson.
- Every new element needs a level where its behavior is obvious.
- Every new reaction needs a level where it is necessary or strongly useful.
- Levels should allow several valid player-drawn structures.
- Buckets should be positioned to encourage interaction chains, not just direct routing.
- Obstacles should create interesting constraints without making solutions pixel-perfect.
- No failure states initially; the player can reset when they dislike the result.
- Wrong elements inside a bucket do not count, but also do not fail or contaminate the bucket in MVP.

## Candidate Level Arc

1. **First Flow**
   - Water emitter from top-left, water bucket bottom-right.
   - Goal: learn drawing ramps.

2. **Piles**
   - Sand emitter from top, sand bucket below an offset opening.
   - Goal: learn powder piling and angled lines.

3. **Make It Rise**
   - Water must reach a hearth to produce steam, with steam bucket near top.
   - Goal: introduce reaction chain.

4. **Two Streams**
   - Water and sand emitters, two matching buckets.
   - Goal: split and isolate flows.

5. **Crossing Paths**
   - Water bucket and steam bucket require routing materials through the same central region.
   - Goal: encourage creative line structures and timing.

## UX Requirements

- Particles flow immediately when a level starts.
- Pointer down begins drawing a line.
- Pointer movement stamps collision cells along the exact pointer path.
- Pointer up stops drawing.
- Reset clears all drawn lines and restarts level simulation.
- Completing all bucket goals advances through a linear next-level flow in MVP.
- Level select is later scope and should only allow replaying beaten or otherwise unlocked levels.
- The UI should be quiet and functional, with the canvas as the focus.
- DOM should handle menus, buttons, debug toggles, and completion state.
- Dev/playtesting sandbox brushes may be exposed temporarily for tuning, but they should be visually and architecturally treated as debug tools rather than player-facing puzzle tools.

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
- Bucket progress increases only from matching target elements.
- Wrong bucket contents do not count and do not cause failure or contamination.
- Completing all buckets advances or presents the next level action.
- Reset returns the level to a clean initial state.
- `npm run verify` passes.
