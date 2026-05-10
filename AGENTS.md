# AGENTS.md

## Project Working Agreement

This project is a browser-based falling-sand puzzle game. Planning, architecture, tests, and user-test snapshots matter as much as feature implementation.

Do not begin runtime implementation until the planning documents have been reviewed and accepted for the current milestone.

## Role Model

Work should be evaluated through these specialties, even when one person or agent performs multiple roles.

### Product Manager

- Owns player goals, MVP scope, milestone boundaries, and acceptance criteria.
- Prevents scope creep.
- Requires a user-test checkpoint before expanding the feature set.

### Game Designer

- Owns element unlock order, level progression, puzzle constraints, and fun.
- Ensures levels support creative emergent solutions.
- Avoids pixel-perfect solutions unless deliberately introduced as a challenge later.

### Simulation Expert

- Owns particle rules, reaction priority, determinism, grid layout, and performance constraints.
- Keeps behavior simple, readable, and testable.
- Writes or requests tests before changing simulation rules.

### Architecture Specialist

- Owns boundaries between simulation, rendering, input, level data, UI, and persistence.
- Prevents gameplay rules from leaking into renderer or DOM code.
- Keeps saveable state serializable.

### Frontend / Renderer Specialist

- Owns Canvas rendering, pixel-art readability, pointer drawing, responsive layout, and HUD integration.
- Keeps the canvas focused on the playfield.
- Uses DOM for buttons, menus, debug UI, and text-heavy interfaces.

### Content Designer

- Owns hand-authored levels, bucket placement, emitter placement, obstacles, and tutorial pacing.
- Documents the intended lesson of each level without requiring a single intended solution.

### QA Reviewer / Integrator

- Owns verification, browser smoke testing, regression review, and integration quality.
- Confirms `npm run verify` passes before a snapshot is considered ready.
- Reviews whether the implementation matches the planning docs.

### Code Quality / Tooling Owner

- Owns linting, formatting, typechecking, and file organization.
- Keeps scripts fast enough to run frequently.
- Blocks snapshots when the codebase drifts into unclear module boundaries.

## Architecture Rules

- Simulation owns particles, reactions, buckets, emitters, obstacles, drawn-line collision cells, timers, level completion, and reset state.
- Renderer owns Canvas drawing and animation presentation only.
- Input mapping owns pointer and keyboard events and converts them into game actions.
- UI owns DOM controls, level selection, debug panels, and completion overlays.
- Level data must be declarative and separate from engine logic.
- Tests should target simulation behavior without requiring the browser.

## File Organization Expectations

Planned structure:

```text
src/
  app/
    main.ts
    styles.css
  game/
    loop.ts
    actions.ts
  simulation/
    world.ts
    particles.ts
    elements.ts
    reactions.ts
    buckets.ts
    emitters.ts
    lines.ts
    random.ts
  rendering/
    canvasRenderer.ts
    palette.ts
  input/
    pointer.ts
    actionMap.ts
  levels/
    levelTypes.ts
    levelCatalog.ts
  ui/
    hud.ts
    debugOverlay.ts
  tests/
    testUtils.ts
```

This structure can change if implementation proves it should, but changes must preserve the same ownership boundaries.

## Code Quality Rules

- TypeScript strict mode is required.
- Avoid `any` unless a short comment explains why it is necessary.
- Avoid large god files. Split by responsibility once a module becomes hard to scan.
- Keep functions small enough to test directly.
- Prefer pure functions for simulation rules.
- Do not add dependencies without a specific reason.
- Do not hide gameplay rules inside rendering or DOM code.
- Do not use ad hoc randomness in tests. Use seeded deterministic helpers.

## Linting And Formatting

The project should include:

- ESLint for TypeScript correctness and import hygiene.
- Prettier for formatting.
- TypeScript strict mode.
- Vitest for unit tests.
- Playwright for browser smoke tests once the first playable UI exists.

Required scripts once the project is scaffolded:

```text
npm run lint
npm run format
npm run typecheck
npm run test
npm run verify
```

`npm run verify` must run lint, typecheck, and tests.

## Test-Driven Development Expectations

- New simulation behavior starts with a failing test when practical.
- Reactions require tests for inputs, outputs, and priority.
- Bucket logic requires tests for pure element acceptance and wrong element rejection.
- Reset behavior requires tests.
- Level completion logic requires tests.
- Renderer-only visual changes may use browser smoke tests and screenshots instead of unit tests.

## Snapshot Workflow

Each development snapshot should follow this sequence:

1. State the feature goal and files expected to change.
2. Add or update tests first when the change affects simulation or progression.
3. Implement the smallest working version.
4. Run `npm run verify`.
5. Start or update the local dev server.
6. Ask the user to test the snapshot before moving to the next feature group.

## Review Gates

Before implementation begins:

- `PRD.md` reviewed.
- `docs/simulation-model.md` reviewed.
- `docs/level-format.md` reviewed.
- `docs/milestones.md` reviewed.

Before each playable snapshot:

- Relevant tests pass.
- Lint and typecheck pass.
- The game runs in browser.
- The feature is explained in plain language.
- User is prompted to test before the next snapshot.

