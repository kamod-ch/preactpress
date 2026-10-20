# Cursor Prompt 004: Repair broken maintainer documentation and remove stale architecture claims

> Keep this a docs/repository-hygiene change. Verify every relative link mechanically.
>
> **Drift check:** `git diff --stat 40acbed..HEAD -- README.md .gitignore docs CHANGELOG.md`

## Status

- **Priority:** P1 / must-have
- **Effort:** S
- **Risk:** LOW
- **Depends on:** none
- **Category:** docs / DX
- **Planned at:** commit `40acbed`, 2026-10-20

## Why this matters

The public README sends contributors to four files that do not exist in the repository root. `/docs` is globally ignored, while a previously tracked internal audit remains visible and says v2.2.1, Preact 10, single-package, and no formal plugin system—contradicting v3.0.1 and six official plugins.

## Current state

- `README.md:212-228` links `./ROADMAP.md`, `./RELEASE-REPORT.md`, `./CONTRIBUTING.md`, and `./UPGRADE.md`; all four targets are missing.
- `.gitignore:27-29` ignores `TODO.md` and all `/docs` content, making selective maintainer docs easy to lose.
- `docs/internal/feature-roadmap.md:1-31` is tracked despite the ignore rule and contains obsolete architecture statements.
- Canonical user docs live in `templates/docs/`; do not duplicate that full site at root.

## Scope

**In scope:** `README.md`, `.gitignore`, the four maintainer docs currently referenced, `docs/internal/feature-roadmap.md`, and a small link-check script/test if needed.

**Out of scope:** rewriting user guides in `templates/docs`, feature implementation, changelog history, marketing redesign.

## Steps

1. Decide one canonical tracked location for maintainer documents. Recommended: place concise `CONTRIBUTING.md`, `ROADMAP.md`, `UPGRADE.md`, and `RELEASE-REPORT.md` at repo root because README already links them. Reuse accurate content from local ignored docs only after checking it against current package scripts and v3.0.1 behavior.
2. Change `.gitignore` so intentional maintainer docs cannot silently remain ignored. Do not unignore generated build artifacts or all miscellaneous docs without a reason.
3. Replace or clearly archive `docs/internal/feature-roadmap.md`. If retained, add a prominent historical/superseded banner and correct claims that could mislead current contributors; preferred outcome is a short current architecture note linked to canonical roadmap rather than maintaining two roadmaps.
4. Add a lightweight repository-relative Markdown link check for README/maintainer docs, or extend an existing check if one already supports repository Markdown. It must fail on missing local targets.
5. Correct README wording if `pnpm run verify` changed under Prompt 002.

## Verification

- Run a script/test that checks local links in `README.md`, `CONTRIBUTING.md`, `ROADMAP.md`, `UPGRADE.md`, and `RELEASE-REPORT.md`; expected zero missing targets.
- `git check-ignore ROADMAP.md CONTRIBUTING.md UPGRADE.md RELEASE-REPORT.md` → no output.
- `rg -n 'Preact 10|v2\.2\.1|no formal plugin system|single-package' README.md ROADMAP.md CONTRIBUTING.md docs/internal` → no unqualified stale claims (historical text must be explicitly labeled).
- `pnpm run fmt:check` → exit 0.

## Done criteria

- [ ] Every README relative link resolves in a clean clone.
- [ ] Current version/architecture is described consistently.
- [ ] There is one clearly canonical roadmap.
- [ ] Link regression has an automated check.
- [ ] User docs are not duplicated wholesale.
- [ ] Update `plans/README.md` status.

## STOP conditions

- Accurate release/upgrade policy cannot be inferred from scripts and changelog; ask the maintainer rather than inventing policy.
- Fix would require checking in generated site output.
- Existing external tooling owns these root docs and would overwrite them.

## Maintenance notes

The canonical product documentation remains `templates/docs`. Root files should stay concise and contributor-oriented; link into the canonical site for detailed user-facing material.
