# Cursor Prompt 006: Add scheduled large-site performance regression gates

> Preserve the fast 100-page pull-request gate. Add large fixtures on schedule/manual dispatch only.
>
> **Drift check:** `git diff --stat 40acbed..HEAD -- .github/workflows/benchmark.yml benchmarks package.json`

## Status

- **Priority:** P2 / nice-to-have
- **Effort:** M
- **Risk:** LOW
- **Depends on:** `plans/002-enforce-workspace-quality-gates.md`
- **Category:** performance / tooling
- **Planned at:** commit `40acbed`, 2026-10-20

## Why this matters

Benchmark tooling claims a 100/1k/5k/10k matrix and measures cold/warm builds and memory, but CI gates only 100 pages with `--skip-dev`. The roadmap specifically calls for 1,000+ page warm-build profiling. Scheduled 1k checks provide useful trend protection without taxing every PR.

## Current state

- `.github/workflows/benchmark.yml:28-57` runs a 100-page benchmark on pushes/PRs.
- `benchmarks/README.md:19-45` documents 100, 1k, 5k, and 10k sizes and distinguishes CI mode.
- `benchmarks/thresholds.json` already defines cold/warm/memory and per-page scaling allowances.
- Benchmark outputs and baselines are size-sensitive; never compare different fixture sizes.

## Scope

**In scope:** benchmark workflow, benchmark CLI options/metadata if needed, size-specific baseline files/threshold documentation, and tests of comparison logic.

**Out of scope:** making 5k/10k mandatory on every PR, changing production build behavior, claiming cross-machine absolute comparability, browser Lighthouse.

## Steps

1. Keep the current 100-page PR/push job unchanged in purpose.
2. Add scheduled (for example weekly) and `workflow_dispatch` execution for a 1,000-page cold + warm build with peak memory and output-size metrics. Use a separate job/name/artifact and explicit timeout.
3. Store or select a size-specific CI baseline. Ensure comparison code rejects mismatched page counts instead of silently comparing them.
4. Add assertions/tests for baseline-size mismatch and missing metrics. Do not auto-update baselines from untrusted PRs.
5. Document baseline refresh procedure, expected runner variance, and which thresholds are blocking versus informational. Consider making 5k/10k manual informational artifacts only.

## Verification

- Local 100-page command from `benchmarks/README.md` exits 0.
- Run the 1k command once where resources allow; otherwise validate command construction and comparison tests, and state that CI execution is pending.
- Comparison tests reject 100-vs-1000 page inputs.
- Workflow YAML parses and scheduled/manual triggers are present.
- `pnpm run lint && pnpm run fmt:check` → exit 0.

## Done criteria

- [ ] PR benchmark remains fast and 100-page scoped.
- [ ] Scheduled/manual 1k benchmark measures warm build and memory.
- [ ] Baselines cannot be compared across fixture sizes.
- [ ] Baseline updates require reviewed commits.
- [ ] Artifacts retain raw JSON and human-readable summary.
- [ ] Update `plans/README.md` status.

## STOP conditions

- 1k fixture exceeds the configured runner timeout/memory; report measured limits and switch the scheduled job to informational before choosing a smaller size.
- Existing benchmark output lacks stable environment/page-count metadata needed for safe comparison.
- Proposed workflow would write baseline changes from pull requests.

## Maintenance notes

GitHub-hosted runner timing is noisy. Prefer relative regression thresholds, repeated measurements/medians if available, and size/output metrics as the most stable blocking signals.
