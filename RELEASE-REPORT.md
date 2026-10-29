# Release report (maintainers)

Detailed release runbook: **[docs/releasing.md](./docs/releasing.md)**.

## Published packages

| Package                                   | Path                                  |
| ----------------------------------------- | ------------------------------------- |
| `@kamod-ch/preactpress`                   | Repository root                       |
| `@preactpress/plugin-typedoc`             | `packages/plugin-typedoc`             |
| `@preactpress/plugin-mermaid`             | `packages/plugin-mermaid`             |
| `@preactpress/plugin-playground`          | `packages/plugin-playground`          |
| `@preactpress/plugin-component-reference` | `packages/plugin-component-reference` |
| `@preactpress/plugin-openapi`             | `packages/plugin-openapi`             |
| `@preactpress/plugin-changelog`           | `packages/plugin-changelog`           |

## Pre-release checklist

1. `pnpm run release:check` (format, lint, core tests with coverage, **workspace plugin gate**, templates, browser tests, pack dry-runs).
2. Confirm changelog entries in [CHANGELOG.md](./CHANGELOG.md).
3. Tag `v*` on the commit to publish; GitHub Actions runs [publish.yml](.github/workflows/publish.yml).

## Publish behavior

`scripts/publish-all.mjs` (orchestration in `scripts/publish-execution.mjs`, planning in `scripts/publish-selection.mjs`):

- Runs `pnpm run verify:workspace` before any registry mutation.
- Builds a **full preflight plan** for every publishable workspace package (core + public plugins).
- Publishes only versions **not** already on npm; unchanged plugin versions are skipped in **strict** mode (default).
- **Fails** if the core version in root `package.json` already exists on the registry in strict mode (prevents accidental duplicate core releases).
- Uses **`npm publish --access public --provenance --tag <tag>`** (OIDC Trusted Publishing; dist-tag defaults to `latest`).
- Prerelease semver versions require an explicit dist-tag other than `latest` (for example `--tag next`).
- Writes `tmp/preactpress-release-<commitSha>.json` during a real publish run (package list, commit, published entries).
- Supports `--dry-run` (plan + `npm pack --dry-run` only; no registry writes).

### Package metadata (Trusted Publishing)

Every public plugin under `packages/plugin-*` declares:

```json
"repository": {
  "type": "git",
  "url": "git+https://github.com/kamod-ch/preactpress.git",
  "directory": "packages/plugin-<name>"
}
```

Private packages (`"private": true`) are excluded from discovery and never appear in the publish plan.

### Recovery after a partial failed release

If core published but a later plugin failed, **do not bump versions**. Check out the **same annotated tag commit**, then resume:

```bash
git checkout vX.Y.Z   # exact release tag
pnpm run release:publish:recover
# optional: pnpm run release:publish:recover -- --manifest tmp/preactpress-release-<fullCommitSha>.json
# optional: pnpm run release:publish:recover -- --tag next   # for prerelease lines only
```

**Recovery mode (`--recover`)** verifies registry versions before skipping them:

| Check                     | Source                             | Required                                            |
| ------------------------- | ---------------------------------- | --------------------------------------------------- |
| Commit identity           | `npm view <pkg>@<version> gitHead` | Must equal the release commit SHA                   |
| Repository                | `npm view … repository.url`        | Must normalize to `github.com/kamod-ch/preactpress` |
| Monorepo path             | `npm view … repository.directory`  | Must match `packages/<plugin>` (core: `.`)          |
| Provenance (when present) | `dist.attestations` URL            | Must reference `github.com/kamod-ch/preactpress`    |

Optional manifest (`tmp/preactpress-release-<sha>.json` from the failed run) must match workspace name/version/directory. If evidence is missing or conflicting, recovery **aborts** with an explicit message (no blind skips).

**Limits:** Recovery does not re-run the full `release:check` / Playwright gate (only `verify:workspace`). Tag pushes trigger a one-shot workflow; resuming usually requires a **manual workflow** or maintainer machine with npm auth — see below.

### CI note (recovery trigger)

`publish.yml` runs on `push: tags: v*` only. Resuming the **same tag commit** does not re-fire that trigger. Options:

1. Run `pnpm run release:publish:recover` locally (requires npm credentials — not OIDC).
2. Add a one-off GitHub Actions **workflow_dispatch** run that checks out the release tag and runs `node ./scripts/publish-all.mjs --recover` with OIDC (not configured in-repo yet; use org workflow or temporary dispatch job).

Always verify `git rev-parse HEAD` matches the release commit before recovery.

Plugin-only version bumps may use `pnpm run release:plugins` / `release:plugins:dry` without a core tag.
