# Cursor Prompt 007: Design parameterized route rewrites before implementation

> This is a design spike. Produce a decision document and executable test matrix only; do not implement the feature.
>
> **Drift check:** `git diff --stat 40acbed..HEAD -- src/node/redirects.ts src/node/siteConfig.ts src/node/validateUserConfig.ts src/shared/rewrites.ts tests/redirects.test.ts tests/rewrites.test.ts templates/docs/guide`

## Status

- **Priority:** P3 / nice-to-have direction
- **Effort:** S (spike)
- **Risk:** LOW
- **Depends on:** none
- **Category:** direction
- **Planned at:** commit `40acbed`, 2026-10-20

## Why this matters

Pattern rewrites with parameters are explicitly listed as a next ecosystem priority. Current redirects normalize exact `from`/`to` routes and validate collisions/loops; adding patterns without defined precedence and encoding rules could make builds nondeterministic or create incorrect static output.

## Current state

- `src/node/redirects.ts:41-178` accepts exact route maps/rules, rejects duplicates/content collisions, resolves chains, and detects loops.
- Rewrites and redirects are separate concepts; inspect `src/shared/rewrites.ts`, config types, validation, output generation, and existing tests before proposing unification.
- Static generation means every pattern must resolve against a finite route set or have host-specific semantics; there is no production Node router.

## Deliverable

Create one tracked design document in the canonical maintainer-doc location established by Prompt 004. It must include:

1. User stories with concrete examples such as `/docs/:version/* -> /:version/*` and named segment substitution.
2. Explicit syntax decision (colon params, brackets, glob rules, escaping) and rejected alternatives.
3. Deterministic precedence: exact vs pattern, specificity ordering, declaration order, and duplicate ambiguity errors.
4. Semantics for rewrites versus HTTP redirects, query strings, percent encoding, trailing slashes, base paths, locales/versions, and clean URLs.
5. Build/check behavior: expansion against known content routes, collision/loop detection, `_redirects` output compatibility, and HTML fallback implications.
6. Backward compatibility for existing exact route maps.
7. Proposed TypeScript API/types and concise pseudocode—not production implementation.
8. A table-driven test matrix naming target test files and expected input/output/errors.
9. Complexity and performance bound for matching thousands of routes.
10. Open questions with recommended defaults.

## Verification

- Every claim cites current source paths/symbols.
- `rg` confirms all redirect/rewrite consumers were considered.
- Design includes at least: exact-over-pattern, two ambiguous patterns, encoded segment, wildcard remainder, loop after substitution, nonexistent target, locale/base path, and 1k-route performance cases.
- `pnpm run fmt:check` passes for the document.

## Done criteria

- [ ] No production source changed.
- [ ] API and precedence are unambiguous enough for a separate executor.
- [ ] Static-host constraints are explicit.
- [ ] Test matrix is machine-translatable.
- [ ] Rejected alternatives and migration impact are recorded.
- [ ] Update `plans/README.md` status to DONE (spike complete), not feature complete.

## STOP conditions

- Product owner input is required to choose between incompatible public syntaxes; present options and a recommendation rather than choosing silently.
- Current exact rewrite behavior differs from docs/tests; record the discrepancy as a prerequisite bug.

## Maintenance notes

After approval, create a separate implementation plan. Do not let the spike PR include opportunistic routing refactors.
