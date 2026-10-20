# Cursor Prompt 002: Make CI and releases validate every publishable workspace package

> Execute only after Prompt 001 is green. Run every verification gate and do not suppress package failures.
>
> **Drift check:** `git diff --stat 40acbed..HEAD -- package.json pnpm-workspace.yaml .github/workflows/ci.yml packages/*/package.json`

## Status

- **Priority:** P0 / must-have
- **Effort:** M
- **Risk:** LOW
- **Depends on:** `plans/001-fix-component-reference-extraction.md`
- **Category:** tests / DX
- **Planned at:** commit `40acbed`, 2026-10-20

## Why this matters

The repository publishes core plus six official plugins, but root `build`, `test:coverage`, `verify`, and CI operate primarily on core. A real plugin regression therefore passes the advertised release gate. Add one deterministic workspace verification path used by local development, CI, and publishing.

## Current state

- `pnpm-workspace.yaml` includes `.`, `packages/*`, and `examples/showcase`.
- Root `package.json:72-90` runs root `tsc`, root Vitest, template/browser checks, and root tarball dry-run.
- `.github/workflows/ci.yml:43-67` invokes those root scripts and never runs recursive plugin tests/builds/packs.
- Every plugin has `build` and `test`; most have `test:coverage`. Coverage configuration is not uniform, so do not demand package coverage thresholds in this first gate.

## Scope

**In scope:** root `package.json`, `.github/workflows/ci.yml`, plugin `package.json` scripts only where needed for a consistent gate, and a small script under `scripts/` if shell composition becomes unclear.

**Out of scope:** source fixes, browser matrix changes, release publishing behavior, adding coverage thresholds to every plugin, testing the example showcase as a package unit suite.

## Steps

1. Define explicit root scripts for workspace package build, test, and tarball validation. Use pnpm filters so the root package and `examples/showcase` are not accidentally repeated as plugins. Avoid recursive lifecycle loops caused by root `verify` invoking itself.
   - Expected capabilities: build all `packages/*`, test all `packages/*`, and run `pnpm pack --dry-run` (or equivalent) in every publishable package.
   - Verify each new script independently; each exits 0 after Prompt 001.
2. Add a single `verify:workspace` (or clearly named equivalent) that composes plugin build/test/pack checks. Integrate it into root `verify`/`release:check` exactly once.
   - Verify: `pnpm run verify:workspace` → all six plugin builds and tests run and all pass.
3. Update CI to call the canonical script rather than duplicating package lists in YAML. Keep the Node 20/22/24 support matrix; if package packs are expensive, run packs only on Node 22 while builds/tests remain matrix-covered, and document that split in YAML comments.
   - Verify YAML syntax and inspect logs locally via the underlying scripts.
4. Add a regression guard that a newly added `packages/plugin-*` directory is automatically included. Prefer package discovery/filtering over a hardcoded list.

## Commands

- `pnpm -r --filter './packages/*' run build`
- `pnpm -r --filter './packages/*' run test`
- `pnpm run verify:workspace`
- `pnpm run lint && pnpm run fmt:check`

All must exit 0. Run `pnpm run verify` only if Playwright browsers are installed; otherwise report that browser verification remains CI-owned.

## Done criteria

- [ ] Every publishable plugin is built and tested by CI.
- [ ] `release:check` transitively runs the same plugin gate.
- [ ] Adding another `packages/plugin-*` package does not require editing a hardcoded list.
- [ ] No recursive script loop exists.
- [ ] Package tarballs are dry-run validated before publishing.
- [ ] Update the status row in `plans/README.md`.

## STOP conditions

- Prompt 001 is not green.
- pnpm filtering unexpectedly includes root `verify` and recurses.
- A plugin requires network access during tests; isolate/report it rather than allowing flaky network CI.
- Making the gate pass would require changing production source.

## Maintenance notes

Keep one canonical workspace gate. Reviewers should reject a CI-only implementation that leaves `pnpm release:check` weaker than pull-request CI.
