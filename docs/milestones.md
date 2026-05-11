# Milestones

## Development Philosophy

Sortr should be built in small playable snapshots. Each snapshot should introduce a focused feature set, pass verification, and stop for user testing before the next major feature group.

The MVP direction is a soft cozy alchemy puzzle campaign, not an open-ended sandbox. Normal player input is permanent black-line drawing only. Sandbox brushes may remain during development as dev/playtesting tools, but they should not define player-facing progression or level requirements.

## Snapshot 0: Planning

Goal: Align on product, architecture, simulation model, level format, roles, and quality gates.

Deliverables:

- `PRD.md`
- `AGENTS.md`
- `docs/simulation-model.md`
- `docs/level-format.md`
- `docs/milestones.md`

Exit criteria:

- User reviews and approves planning docs.
- Open questions are resolved or explicitly deferred.

## Snapshot 1: Project Scaffold And Tooling

Goal: Establish a clean, testable TypeScript app foundation.

Deliverables:

- Vite + TypeScript scaffold.
- ESLint.
- Prettier.
- Vitest.
- Strict TypeScript config.
- Initial folder structure.
- `npm run lint`.
- `npm run format`.
- `npm run typecheck`.
- `npm run test`.
- `npm run verify`.

Exit criteria:

- `npm run verify` passes.
- Dev server runs.
- Empty canvas shell renders in browser.

User test:

- Confirm app opens and layout feels acceptable as a blank shell.

## Snapshot 2: Minimal Simulation

Goal: Prove deterministic grid particles independent from rendering.

Deliverables:

- World grid.
- Seeded random helper.
- Water movement.
- Sand movement.
- Basic emitter spawning.
- Simulation tests for movement, emitters, and determinism.

Exit criteria:

- Simulation tests pass.
- Particles can be rendered to canvas.

User test:

- Confirm water and sand movement feels readable and falling-sand-like.

## Snapshot 3: Drawing And Reset

Goal: Add the core player verb.

Deliverables:

- Pointer input mapping.
- Grid-space line stamping.
- Permanent collision lines.
- Reset behavior.
- Tests for line collision and reset.

Exit criteria:

- Player can draw ramps/barriers.
- Reset clears lines and restarts level.
- `npm run verify` passes.

User test:

- Confirm drawing feels direct and lines match pointer paths.
- Confirm particles collide with drawn lines and route around them.

## Snapshot 4: Buckets And Level Completion

Goal: Turn the simulation into a puzzle loop.

Deliverables:

- Bucket definitions.
- Pure element intake logic.
- Completion state.
- Next-level transition placeholder.
- Tests for matching, wrong-element non-counting, and completion.

Exit criteria:

- At least two levels are playable.
- Buckets visibly fill.
- Completion is clear.

User test:

- Confirm bucket goals are understandable and satisfying.

## Snapshot 5: Fire And Steam Reaction

Goal: Add the first interaction chain.

Deliverables:

- Fire behavior.
- Steam behavior.
- Water + fire -> steam reaction.
- Steam bucket level.
- Tests for reaction and rising gas movement.

Exit criteria:

- A level requires creating steam to complete.
- Reaction is readable.
- `npm run verify` passes.

User test:

- Confirm the reaction feels intuitive and creates interesting routing decisions.

## Snapshot 6: Campaign Flow And First Level Pack

Goal: Build the first cohesive campaign slice with quick 1-3 minute levels and linear next-level progression.

Deliverables:

- 3-5 hand-authored levels.
- Documented level lessons and designer notes.
- Linear next-level flow.
- Completion overlay or next-level action.
- Bucket behavior where wrong elements do not count but do not fail or contaminate the bucket.
- Debug overlay.
- Temporary dev/playtesting sandbox brushes isolated from normal player controls.
- Browser smoke test if Playwright has been added.

Exit criteria:

- The MVP loop is playable from first level through final available level.
- Each level teaches one major idea and supports multiple non-pixel-perfect solutions.
- Performance is acceptable on desktop.
- `npm run verify` passes.
- User can test and give design feedback.

User test:

- Confirm the campaign reads as soft cozy alchemy, each puzzle is understandable, and normal gameplay feels like black-line drawing rather than sandbox spawning.

## Snapshot 7: MVP Stabilization And Maintainability

Goal: Stabilize the playable foundation before expanding the chemistry catalog.

Deliverables:

- Clear boundaries between game lifecycle, UI, input, rendering, level data, and simulation.
- Registry-driven element metadata and reaction rules where they reduce future maintenance cost.
- Validation tests for levels, progression, buckets, reactions, and reset behavior.
- Dev/debug tools clearly separated from player-facing UI.
- Documentation updated to match implementation.

Exit criteria:

- `npm run verify` passes.
- Existing five levels still work.
- No new elements or puzzle mechanics are added during this stabilization slice.
- User-test feedback from Snapshot 6 is triaged before chemistry expansion.

## Later Milestones

- Chemistry chain expansion first: dirt and mud, smoke and ash, oil and fire, ice and melt/freeze, salt and brine, or similar reaction families.
- Additional campaign levels that teach one new chemistry idea at a time.
- Level select for replaying beaten or otherwise unlocked levels.
- Challenge objectives or optional mastery goals.
- Tool-like mechanics after chemistry chains: acid and line erosion, filters, temperature zones, erasers, or special player tools.
- Level editor.
- Save/progression state.
- Audio and polish.

## Review Checklist For Every Snapshot

- Does the feature match the PRD?
- Did simulation behavior get tests?
- Did lint, typecheck, and tests pass?
- Is the simulation still separate from rendering?
- Does player-facing input remain black-line drawing only unless a milestone explicitly changes it?
- Are sandbox brushes/debug controls isolated from core gameplay?
- Does the change preserve the linear campaign direction?
- Is the user prompted to test before moving on?
