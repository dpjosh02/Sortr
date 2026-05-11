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

## Snapshot 8: Campaign User-Test Readiness

Goal: Make the current five-level campaign easier to test end-to-end before adding the first new chemistry family.

Deliverables:

- Player-facing level lesson text shown outside the canvas.
- Linear completion messaging that distinguishes "next puzzle" from "campaign complete."
- No new elements, reactions, tools, or level-select behavior.
- Focused UI text tests for campaign progression messaging.

Exit criteria:

- A user can understand each level's lesson without opening dev tools.
- Completing a non-final level clearly points to the next puzzle.
- Completing the final available level clearly marks the end of the current campaign pack.
- `npm run verify` passes.

User test:

- Play through the current campaign and report where a lesson, target, or completion state feels unclear before chemistry expansion begins.

## Snapshot 9: First Chemistry Chain

Goal: Add the first small chemistry family without introducing a large catalog or new player tools.

Deliverables:

- `dirt` and `mud` element registry entries using existing powder movement.
- Dirt + water -> mud reaction rule in the registry.
- One hand-authored campaign level that teaches mixing dirt and water before routing mud.
- Tests for element registration, reaction behavior, reaction priority, and level validation.

Exit criteria:

- Existing five levels still work.
- The new level teaches one reaction chain and remains solvable with black-line drawing only.
- No tool-like mechanics, level editor, persistence, or unrestricted level select are added.
- `npm run verify` passes.

User test:

- Confirm the first chemistry expansion reads as an alchemy chain, not as a sandbox brush exercise.

## Snapshot 10: Heat The First Chain

Goal: Extend the dirt and mud chemistry family by using heat without adding another element family.

Deliverables:

- Fire + mud -> steam + dirt reaction rule.
- One hand-authored campaign level that teaches heating mud near a hearth.
- Tests for reaction behavior, reaction priority, and level validation.
- Documentation updated to describe the current dirt/mud heat chain.

Exit criteria:

- Existing campaign levels still work.
- The new level teaches one idea: heat mud to release steam.
- No new player tools, tool-like mechanics, persistence, or unrestricted level select are added.
- `npm run verify` passes.

User test:

- Confirm heating mud feels like a natural continuation of the prior dirt + water level.

## Snapshot 11: Combustion Pair

Goal: Add the smoke and ash chemistry family with one reaction and one authored level.

Deliverables:

- `smoke` and `ash` element registry entries using existing gas and powder movement.
- Fire + dirt -> smoke + ash reaction rule.
- One hand-authored campaign level that teaches rising smoke and falling ash.
- Tests for element registration, reaction behavior, reaction priority, and level validation.
- Documentation updated to describe the current combustion chain.

Exit criteria:

- Existing campaign levels still work.
- The new level teaches one idea: burning dirt produces one rising output and one falling output.
- No new player tools, tool-like mechanics, persistence, or unrestricted level select are added.
- `npm run verify` passes.

User test:

- Confirm the smoke/ash level reads as a chemistry chain and not as a precision-routing challenge.

## Snapshot 12: Readable Spawner Fixtures

Goal: Make element sources visually self-explanatory without changing simulation behavior.

Deliverables:

- Renderer-owned fixture art for each current emitter element.
- Optional emitter fixture metadata in the level format.
- Default fixture mapping so existing levels get readable spawners without data churn.
- Tests for fixture defaults and authored overrides.

Exit criteria:

- Each emitted element has a distinct source silhouette and material cue.
- Simulation spawning behavior remains unchanged.
- `npm run verify` passes.

User test:

- Confirm players can infer what each source emits before watching the first particles spawn.

## Snapshot 13: Branching Reaction Routes

Goal: Add a campaign review level that asks players to split one source into two existing chemistry paths.

Deliverables:

- One hand-authored campaign level that uses the current dirt, water, mud, hearth, smoke, and ash rules.
- Catalog validation covering the new level and its lesson.
- Level-format documentation updated with the new campaign entry.

Exit criteria:

- Existing campaign levels still work.
- The new level teaches one idea: branch a dirt stream between wet and hot reactions.
- No new elements, mechanics, player tools, persistence, or unrestricted level select are added.
- `npm run verify` passes.

User test:

- Confirm the branching level feels like a flexible chemistry puzzle rather than a precision drawing test.

## Later Milestones

- Continue chemistry chain expansion: oil and fire, ice and melt/freeze, salt and brine, or similar reaction families.
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
