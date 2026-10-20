# PreactPress Audit & Cursor Prompts

Generated from a standard, read-only audit on 2026-10-20 at commit `40acbed`.
The numbered files are self-contained prompts for Cursor. Open one file, paste its
entire contents into a fresh Cursor Agent chat, and let the agent execute only that
plan. Execute in the order below unless dependencies say otherwise.

## Executive recommendation

PreactPress already has unusually broad functionality, a strong core test suite
(225/225 root tests passed), strict TypeScript, formatting, linting, browser tests,
and benchmark infrastructure. The highest-value work is not another broad feature:
it is making the workspace and release pipeline reliably validate the six official
plugins it publishes.

## Must-haves

| Plan                                               | Finding                                                                                                              | Evidence                                                                                          | Impact                                                                              | Effort | Risk | Status |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------ | ---- | ------ |
| [001](./001-fix-component-reference-extraction.md) | Component-reference extraction is broken under the installed TypeScript 6 toolchain                                  | `packages/plugin-component-reference/src/extract/typescript.ts:152-171`; 4/5 package tests failed | A published flagship plugin emits empty/incomplete prop tables                      | M      | MED  | DONE   |
| [002](./002-enforce-workspace-quality-gates.md)    | CI and `release:check` validate core but skip plugin builds/tests                                                    | `package.json:72-90`; `.github/workflows/ci.yml:43-67`; `pnpm-workspace.yaml:1-4`                 | Regressions in publishable packages can ship green                                  | M      | LOW  | DONE   |
| [003](./003-harden-publish-pipeline.md)            | Every `v*` tag publishes every plugin and the privileged reusable action is referenced by mutable `@main`            | `scripts/publish-all.mjs:44-49`; `.github/workflows/publish.yml:3-24`                             | Duplicate versions can abort releases; mutable release code has npm/OIDC privileges | M      | MED  | DONE   |
| [004](./004-repair-maintainer-docs.md)             | README links four missing root documents; the tracked architecture audit still describes v2.2.1/Preact 10/no plugins | `README.md:212-228`; `.gitignore:27-29`; `docs/internal/feature-roadmap.md:1-31`                  | Broken onboarding and contradictory project status                                  | S      | LOW  | DONE   |

## Nice-to-haves / optimizations

| Plan                                           | Recommendation                                                                | Evidence                                                                             | Value                                                                               | Effort    | Risk | Status |
| ---------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | --------- | ---- | ------ |
| [005](./005-expand-client-browser-coverage.md) | Cover client runtime and add desktop/WebKit browser smoke coverage            | `vitest.config.ts:7-17`; `playwright.config.ts:18-25`                                | Catches navigation, hydration, focus, and browser-specific regressions              | M         | LOW  | DONE   |
| [006](./006-schedule-large-site-benchmarks.md) | Add scheduled 1k-page warm-build and memory regression checks                 | `.github/workflows/benchmark.yml:28-57`; `benchmarks/README.md:19-45`                | Verifies the roadmap promise for large documentation sites without slowing every PR | M         | LOW  | DONE   |
| [007](./007-design-pattern-rewrites.md)        | Run a bounded design spike for parameterized route rewrites                   | `src/node/redirects.ts:41-178`; public roadmap intent in README and internal roadmap | High-value routing feature, but API semantics need agreement before implementation  | S (spike) | LOW  | DONE   |
| [008](./008-design-changelog-providers.md)     | Design GitLab/Gitea providers around the existing changelog provider contract | `packages/plugin-changelog/src/providers/github.ts:10-150`; stated roadmap           | Expands the plugin to self-hosted/open-source forges with little core impact        | S (spike) | LOW  | DONE   |

## Dependency graph

- `001` must land before `002`, otherwise the new workspace gate will intentionally fail.
- `002` must land before `003`, so publishing cannot proceed without plugin validation.
- `004`, `005`, and `006` are independent after `002`.
- `007` and `008` are design spikes and can run independently; do not implement their full features in the spike PR.

## Verified baseline

- `pnpm exec tsc -p tsconfig.json --noEmit` — passed.
- `pnpm test` — passed: 38 files, 225 tests.
- `pnpm -r --if-present test` — failed only in `@preactpress/plugin-component-reference`: 4 failed, 1 passed; all other plugin suites passed.
- Per-package `tsc --noEmit` — passed for all six plugins.
- `pnpm run fmt:check` — passed.
- `pnpm run lint` — exit 0 with existing warnings.
- `pnpm audit --audit-level high` — no high/critical issues; reported one moderate transitive `sprintf-js` advisory with no patched release and one low transitive KaTeX advisory.

## Direction recommendations

1. **Do reliability work before adding features.** The workspace currently has a real plugin regression that normal CI cannot see.
2. **Prefer optional-package growth over core growth.** The existing plugin architecture and six official plugins are a strong differentiator; GitLab/Gitea support fits that boundary.
3. **Treat parameterized rewrites as an API-design problem first.** Matching precedence, encoding, redirects vs rewrites, checker behavior, and static output all need explicit semantics.
4. **Use scheduled large fixtures rather than making every PR expensive.** Keep the 100-page PR gate and add scheduled/manual 1k runs.

## Findings considered and rejected

- `dangerouslySetInnerHTML` for rendered Markdown: expected for an SSG whose authored Markdown/MDX and config are trusted; not reported as a vulnerability without an untrusted-content boundary.
- Arbitrary relative snippet/include paths: docs config and MDX already execute repository code at build time, so constraining only snippet reads would not create a meaningful sandbox.
- Custom social SVG injection: values come from executable site config; same trusted-author boundary.
- Splitting large files solely by line count: no evidenced correctness or maintainability failure; avoid churn-only refactors.
- Immediate work on the moderate `sprintf-js` advisory: it is transitive through `gray-matter`, has no patched release, and no evidenced attacker-controlled format-string call in PreactPress. Track upstream rather than adding a risky override.

## Audit boundaries

Audited: root/core source hotspots, all package manifests and test topology, CI,
release scripts, browser/benchmark configuration, docs consistency, dependency
audit, and roadmap direction. Not exhaustively audited: every template page, every
CSS rule, generated `dist/` output, visual design, external GitHub issues, npm
registry state, or live hosting configuration.
