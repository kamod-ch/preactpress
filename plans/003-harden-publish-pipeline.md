# Cursor Prompt 003: Make publishing deterministic, version-aware, and supply-chain pinned

> Treat this as release-critical code. Add tests around selection logic before changing publish behavior. Never perform a real publish.
>
> **Drift check:** `git diff --stat 40acbed..HEAD -- .github/workflows/publish.yml scripts/publish-all.mjs package.json release.config.mjs`

## Status

- **Priority:** P0 / must-have
- **Effort:** M
- **Risk:** MED
- **Depends on:** `plans/002-enforce-workspace-quality-gates.md`
- **Category:** correctness / security
- **Planned at:** commit `40acbed`, 2026-10-20

## Why this matters

A core `v*` tag calls `scripts/publish-all.mjs`, which publishes core and then every plugin regardless of whether each plugin version is new. An already-published plugin version can abort an otherwise valid core release. The same workflow executes a reusable action from mutable `@main` while granting npm token and OIDC permissions. Both issues belong at the release trust boundary.

## Current state

- `.github/workflows/publish.yml:3-24` triggers for every `v*` tag and uses `kamod-ch/.github/.github/actions/npm-publish-on-tag@main` with `id-token: write` and `NPM_TOKEN`.
- `scripts/publish-all.mjs:44-49` unconditionally publishes core, discovers all plugin directories, and publishes every one.
- Plugin releases can be versioned separately via `scripts/release-plugins.mjs`, so unchanged versions are expected.
- No real registry mutation is allowed during this task.

## Scope

**In scope:** `.github/workflows/publish.yml`, `scripts/publish-all.mjs`, a new unit-testable publish-selection helper/script, tests for that helper, and related package scripts/docs.

**Out of scope:** real npm publishing, changing package names, coordinated-version monorepo migration, rotating npm credentials, changing core semver.

## Steps

1. Extract package discovery and publish-selection into pure/testable functions. Given local package metadata and mocked registry results, classify packages as `publish`, `skip-existing`, or `error`.
   - Fail closed on registry/network/auth errors; do not treat an unknown state as safe to publish.
   - Preserve dependency order (`typedoc` before dependents).
2. Make `publish-all` publish only versions confirmed absent from npm and print an explicit summary before mutation. A tag whose core version already exists must fail; unchanged plugin versions should be logged and skipped.
   - Add a `--dry-run` mode that performs discovery/selection and pack checks but never invokes `pnpm publish`.
3. Add tests covering new core + unchanged plugins, new dependent plugin ordering, all versions existing, registry failure, malformed package metadata, and dry-run no-mutation behavior. Mock process execution and registry access.
4. Pin the reusable publish action to a reviewed full commit SHA, adding a comment with the human-readable upstream revision/tag. Do not use `@main`, a floating tag, or a short SHA.
5. Ensure Prompt 002's workspace QA runs before selection/publishing. Keep permissions minimal and document why both OIDC and token are needed; remove `npm-token` if the pinned action and registry support trusted publishing without it, otherwise retain it explicitly.

## Verification

- `node scripts/publish-all.mjs --dry-run` → prints deterministic plan and performs no publish.
- Focused unit tests for publish selection → all pass.
- `pnpm run verify:workspace` → all pass.
- `rg '@main|@master' .github/workflows/publish.yml` → no matches.
- `git diff --check` → exit 0.

## Done criteria

- [ ] Existing plugin versions do not abort a core release.
- [ ] Registry uncertainty aborts before publishing anything.
- [ ] Publish order remains dependency-safe.
- [ ] Dry-run behavior is tested and non-mutating.
- [ ] Privileged external action is pinned to a full commit SHA.
- [ ] No credentials or secret values are logged.
- [ ] Update `plans/README.md` status.

## STOP conditions

- The reusable action's exact reviewed commit cannot be established; report the required upstream SHA rather than guessing.
- npm registry checks require embedding credentials in source/tests.
- A safe solution requires publishing some packages before discovering that later packages are invalid; redesign preflight instead.
- Real publish is about to run.

## Maintenance notes

Dependabot/Renovate should update pinned action SHAs through reviewed PRs. Review output should clearly separate preflight from mutation so future maintainers cannot accidentally weaken fail-closed behavior.
