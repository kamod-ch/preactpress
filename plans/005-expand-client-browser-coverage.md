# Cursor Prompt 005: Add risk-based client and cross-browser coverage

> Add focused coverage, not a large snapshot suite. Keep Playwright cost controlled.
>
> **Drift check:** `git diff --stat 40acbed..HEAD -- vitest.config.ts playwright.config.ts tests/browser src/client .github/workflows/ci.yml package.json`

## Status

- **Priority:** P2 / nice-to-have
- **Effort:** M
- **Risk:** LOW
- **Depends on:** `plans/002-enforce-workspace-quality-gates.md`
- **Category:** tests
- **Planned at:** commit `40acbed`, 2026-10-20

## Why this matters

Coverage thresholds exclude all `src/client/**`, while Playwright has only a mobile Chromium project even though tests exercise desktop search, navigation, focus, hydration, and interactive playground behavior. A small desktop Chromium + WebKit smoke layer gives better regression detection without tripling every test.

## Current state

- `vitest.config.ts:7-17` includes only `src/node/**/*.ts` and `src/shared/**/*.ts` in coverage.
- `playwright.config.ts:18-25` defines only `mobile-chromium` using Pixel 7.
- Existing browser specs cover mobile drawer/focus, desktop search, page readiness, and playground.
- CI installs Chromium only on Node 22.

## Scope

**In scope:** client unit-test configuration/tests, `playwright.config.ts`, selected `tests/browser/*.spec.ts`, CI browser installation and commands.

**Out of scope:** pixel-perfect visual regression, all browser/device permutations, CSS redesign, arbitrary coverage-percentage chasing.

## Steps

1. Identify pure/high-risk client helpers and hooks that can be tested in a lightweight DOM environment without duplicating Playwright. Add targeted tests for route loading failure/recovery, search scoring/filtering, head updates, and cleanup of listeners/timers where practical.
2. Include only the newly tested client modules in coverage initially and set evidence-based thresholds. Do not include all of `src/client` and then exclude failures ad hoc.
3. Add a desktop Chromium project for all browser tests. Add a WebKit smoke project restricted to navigation, page-ready, theme toggle, and mobile drawer/focus tests; avoid running heavy playground editing tests on every browser unless they reveal a real compatibility requirement.
4. Update CI browser installation and execution on Node 22 only. Keep Node 20/24 unit/build matrix unchanged.
5. Document local commands and expected browser prerequisites.

## Verification

- `pnpm test` → all root tests pass.
- `pnpm run test:coverage` → thresholds pass and reports selected client modules.
- `pnpm exec playwright test --project=mobile-chromium --project=desktop-chromium` → all pass.
- `pnpm exec playwright test --project=webkit-smoke` → smoke suite passes.
- `pnpm run lint && pnpm run fmt:check` → exit 0.

## Done criteria

- [ ] Desktop behavior is tested in a desktop project.
- [ ] WebKit runs a bounded smoke suite.
- [ ] Key client behavior has unit coverage.
- [ ] CI runtime remains bounded and browser tests still run only once per matrix.
- [ ] No broad snapshots or arbitrary threshold lowering.
- [ ] Update `plans/README.md` status.

## STOP conditions

- WebKit failures are caused only by unsupported CI system dependencies and cannot be reproduced after correct Playwright install.
- Tests require refactoring public behavior rather than adding seams.
- Browser suite runtime more than doubles; report timings and propose a smaller tagged smoke suite.

## Maintenance notes

Review flake rate after several CI runs. Browser retries must not conceal deterministic failures; keep traces on first retry for diagnosis.
