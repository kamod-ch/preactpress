# Cursor Prompt 008: Design GitLab and Gitea changelog providers

> This is a design/API spike. Do not add production providers yet.
>
> **Drift check:** `git diff --stat 40acbed..HEAD -- packages/plugin-changelog`

## Status

- **Priority:** P3 / nice-to-have direction
- **Effort:** S (spike)
- **Risk:** LOW
- **Depends on:** none
- **Category:** direction
- **Planned at:** commit `40acbed`, 2026-10-20

## Why this matters

The public roadmap names GitLab and Gitea as the next changelog providers. The GitHub provider already has token resolution, ETag caching, offline fallback, normalization, and typed provider boundaries. A short design pass can maximize reuse and avoid baking forge-specific assumptions into shared types.

## Current state

- `packages/plugin-changelog/src/providers/github.ts:10-150` implements GitHub API access, tokens, conditional requests, rate-limit handling, cache fallback, and release normalization.
- Inspect `providers/types.ts`, `src/types/index.ts`, cache/generate/normalize modules, current tests, README, and package exports before drafting.
- Existing tests may write fixture cache files; new tests must use temp directories and must not mutate tracked fixtures.

## Deliverable

Create a design document under the plugin or canonical maintainer docs with:

1. Provider capability matrix for GitHub, GitLab, and Gitea: API endpoint shape, self-hosted base URL, pagination, auth headers/env vars, ETag/Last-Modified support, drafts/prereleases, rate-limit headers, source URLs.
2. Proposed config examples for `provider: "gitlab"` and `provider: "gitea"`, including self-hosted instances and project identifiers.
3. Shared adapter boundaries: what belongs in generic HTTP/cache/pagination helpers versus each provider mapper.
4. Error model and offline/cache semantics consistent with current behavior.
5. Security rules: never persist/log tokens, validate base URLs, no implicit credential forwarding across hosts, bounded pagination/response size.
6. Test matrix using mocked fetch and temporary cache directories: pagination, 304, 401/403, rate limit, stale cache fallback, offline miss/hit, malformed payload, self-hosted URL, prerelease/draft mapping.
7. Packaging/docs impact and an implementation order (shared extraction first, then GitLab, then Gitea).
8. Open questions and recommended defaults.

## Verification

- Current provider tests still pass: `pnpm --filter @preactpress/plugin-changelog test`.
- `git status --short` shows no modified tracked cache fixtures after tests.
- Design references exact current interfaces and does not invent incompatible manifest fields without migration notes.
- `pnpm run fmt:check` passes.

## Done criteria

- [ ] No production provider implementation in this spike.
- [ ] Self-hosted and SaaS cases are both addressed.
- [ ] Pagination and cache semantics are explicit.
- [ ] Token handling and SSRF/credential-forwarding boundaries are explicit.
- [ ] Test matrix is ready for a separate implementation prompt.
- [ ] Update `plans/README.md` status to DONE (spike complete).

## STOP conditions

- GitLab/Gitea API behavior cannot be verified from authoritative docs available to the executor; mark the detail unresolved and cite what needs confirmation.
- Supporting a provider requires breaking the existing changelog manifest; propose an additive adapter instead.

## Maintenance notes

Favor a small shared HTTP/cache layer, not a universal forge abstraction. Provider payloads and rate-limit behavior differ enough that explicit mappers are easier to test and maintain.
