# Milestones

## Development Philosophy

Sortr should be built in small playable snapshots. Each snapshot should introduce a focused feature set, pass verification, and stop for user testing before the next major feature group.

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

## Snapshot 4: Buckets And Level Completion

Goal: Turn the simulation into a puzzle loop.

Deliverables:

- Bucket definitions.
- Pure element intake logic.
- Completion state.
- Next-level transition placeholder.
- Tests for matching, wrong-element rejection, and completion.

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

## Snapshot 6: First Level Pack

Goal: Build the first cohesive playable slice.

Deliverables:

- 3-5 hand-authored levels.
- Basic level select or next-level flow.
- Debug overlay.
- Browser smoke test if Playwright has been added.

Exit criteria:

- The MVP loop is playable from first level through final available level.
- Performance is acceptable on desktop.
- User can test and give design feedback.

## Later Milestones

- Dirt and mud.
- Smoke and ash.
- Acid and line erosion.
- Filters and temperature zones.
- Level editor.
- Save/progression state.
- Audio and polish.

## Review Checklist For Every Snapshot

- Does the feature match the PRD?
- Did simulation behavior get tests?
- Did lint, typecheck, and tests pass?
- Is the simulation still separate from rendering?
- Is the user prompted to test before moving on?

