# Cursor Prompt 001: Restore TypeScript component prop extraction

> Execute this plan step by step. Do not broaden the refactor. Run every verification command. If a STOP condition occurs, stop and report instead of improvising.
>
> **Drift check:** `git diff --stat 40acbed..HEAD -- packages/plugin-component-reference`

## Status

- **Priority:** P0 / must-have
- **Effort:** M
- **Risk:** MED
- **Depends on:** none
- **Category:** bug
- **Planned at:** commit `40acbed`, 2026-10-20

## Why this matters

The component-reference package promises union props, inherited DOM attributes, defaults, and deep links, but its installed TypeScript 6 test suite currently fails four of five tests. Core CI does not expose this. Fix the extractor itself; do not weaken expectations to make tests green.

## Current state

- `packages/plugin-component-reference/src/extract/typescript.ts:152-171` returns `checker.getTypeAtLocation(param)` early for arrow/function expressions. With destructured typed parameters this currently leads to an empty/incomplete property set.
- `extractComponentEntry()` builds a TypeScript program and calls `collectProps()` at lines 198-220.
- `packages/plugin-component-reference/tests/component-reference.test.ts:14-67` expects `variant`, inherited `disabled`/`children`/`href`, `@default`, compound component props, and rendered `#prop-variant` anchors.
- Reproduction: `pnpm --filter @preactpress/plugin-component-reference test` currently reports 4 failed and 1 passed.

## Scope

**In scope:**

- `packages/plugin-component-reference/src/extract/typescript.ts`
- `packages/plugin-component-reference/tests/component-reference.test.ts`
- fixture files under `packages/plugin-component-reference/fixtures/ui-kit/` only if a new syntax case is needed

**Out of scope:**

- Public manifest shape or exports
- Renderer redesign
- TypeScript downgrade/pinning
- Other plugins
- Generated `dist/` unless repository policy explicitly requires it after source changes

## Steps

1. Add focused characterization tests for a typed destructured arrow component, a named function component, and a component typed through a callable variable annotation. Preserve all current assertions.
   - Verify: `pnpm --filter @preactpress/plugin-component-reference test` must still reproduce the existing failures before the source fix and the new tests must identify the failing syntax path.
2. Change `propsTypeFromExport()` so it resolves the callable parameter symbol/type from the export's call signature or the parameter's explicit type annotation rather than treating a binding pattern's location type as authoritative. Support current arrow/function forms and retain a safe fallback.
   - Do not special-case fixture component names or hardcode Preact prop names.
   - Verify: `pnpm --filter @preactpress/plugin-component-reference test` → all tests pass.
3. Confirm union/intersection deduplication still reports optionality, docs, defaults, and inherited metadata correctly. Add regression assertions where missing.
   - Verify: `pnpm --filter @preactpress/plugin-component-reference exec tsc -p tsconfig.json --noEmit` → exit 0.
4. Run repository checks relevant to the package.
   - Verify: `pnpm run lint && pnpm run fmt:check` → exit 0 (pre-existing lint warnings are acceptable; add none).

## Test plan

Use `packages/plugin-component-reference/tests/component-reference.test.ts` as the existing pattern. Required cases: destructured arrow with explicit props type, function declaration, callable variable/component type, union/intersection inherited attributes, JSDoc/default retention, and HTML rendering with non-empty prop anchors.

## Done criteria

- [ ] All component-reference tests pass without deleting or weakening existing assertions.
- [ ] TypeScript no-emit check passes.
- [ ] No hardcoded fixture/component names in production code.
- [ ] Public output shape remains backward compatible.
- [ ] No files outside scope changed.
- [ ] Update this plan's row in `plans/README.md` to DONE.

## STOP conditions

- Fix requires downgrading TypeScript or Preact.
- Correct behavior requires changing the public manifest schema.
- TypeScript API behavior differs by supported Node version in a way not covered by the current compiler dependency.
- In-scope code drifted substantially from the cited functions.

## Maintenance notes

Prefer stable checker APIs and call signatures over AST-shape-only assumptions. Reviewer should test both destructured and identifier parameters because TypeScript compiler upgrades commonly alter inferred types at binding-pattern locations.
