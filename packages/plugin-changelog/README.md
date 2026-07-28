# @preactpress/plugin-changelog

Official changelog integration for [PreactPress](https://github.com/kamod-ch/preactpress). Generates searchable release pages from **local Keep a Changelog files**, **GitHub Releases**, and optional **Changesets**.

## Installation

```bash
pnpm add -D @preactpress/plugin-changelog
```

Peer dependency: `@kamod-ch/preactpress` >= 2.2.0

## Usage

### GitHub Releases

```ts
import { defineConfig } from "@kamod-ch/preactpress/config";
import { changelogPlugin } from "@preactpress/plugin-changelog";

export default defineConfig({
  site: {
    title: "PreactPress",
    url: "https://preactpress.dev",
  },
  plugins: [
    changelogPlugin({
      provider: "github",
      repository: "kamod-ch/preactpress",
      route: "/changelog",
    }),
  ],
});
```

### Local CHANGELOG.md

```ts
changelogPlugin({
  provider: "local",
  local: "./CHANGELOG.md",
  route: "/changelog",
});
```

### Changesets (optional merge)

Merge unpublished `.changeset/*.md` entries as an **Unreleased** section on top of your primary source:

```ts
changelogPlugin({
  provider: "local",
  local: "./CHANGELOG.md",
  changesets: true,
});
```

## Generated documentation

| Page | Contents |
| ---- | -------- |
| **Changelog overview** | Release table, recent highlights |
| **Release pages** | Version, date, breaking changes, features, fixes |
| **Contributors** | Parsed from `@mentions` and GitHub release authors |
| **Source link** | GitHub release URL or local file reference |
| **Migration guides** | Detected `[Migration guide](url)` links in release bodies |

## Features

- **Provider interface** — extensible for GitLab, Forgejo, Gitea (`ChangelogProvider`)
- **Reproducible builds** — deterministic slugs and structured manifests
- **Remote caching** — GitHub responses cached under `node_modules/.preactpress/changelog`
- **Offline builds** — `offline: true` uses cached remote data
- **Optional GitHub token** — `GITHUB_TOKEN` / `GH_TOKEN` or `token` option
- **Rate-limit errors** — `ChangelogRateLimitError` with reset time and guidance
- **RSS feed** — Atom feed at `{route}/feed.xml` (requires `site.url`)
- **Local search** — generated markdown is indexed like regular docs
- **Version integration** — optional version-scoped changelog routes

## Options

| Option | Default | Description |
| ------ | ------- | ----------- |
| `provider` | — | `local`, `github`, or `changesets` |
| `repository` | — | GitHub `owner/name` (required for `github`) |
| `local` | `CHANGELOG.md` | Path to Keep a Changelog file |
| `route` | `/changelog` | URL prefix for generated pages |
| `output` | route without `/` | Output directory relative to `srcDir` |
| `cache` | `true` | Cache manifests and remote payloads |
| `offline` | `false` | Use cache only, no network |
| `token` | env | GitHub token for authenticated API calls |
| `changesets` | `false` | Merge pending Changesets |
| `versionIntegration` | `false` | Duplicate routes under `/versions/{value}/changelog` |
| `feed` | `true` | Emit Atom RSS feed at `{route}/feed.xml` |

## Provider architecture

| Layer | Responsibility |
| ----- | -------------- |
| **Providers** | Fetch raw releases (`local`, `github`, `changesets`) |
| **Normalize** | Parse Keep a Changelog / GitHub bodies into sections |
| **Manifest** | `ChangelogManifest` (`@preactpress/plugin-changelog/types`) |
| **Presentation** | Markdown pages, sidebar, RSS |

Future providers (GitLab, Gitea, Forgejo) implement `ChangelogProvider`:

```ts
import type { ChangelogProvider } from "@preactpress/plugin-changelog/providers";

export const gitlabChangelogProvider: ChangelogProvider = {
  id: "gitlab",
  async computeSourceHash(context) { /* … */ },
  async fetchRawReleases(context) { /* … */ },
};
```

## Caching and CI

1. **Online build** fetches GitHub Releases and writes cache to `node_modules/.preactpress/changelog/`.
2. **Offline build** (`offline: true`) reuses cached remote payloads — ideal for reproducible CI when cache is restored.
3. Manifest cache is keyed by source fingerprint (repository + auth state, file mtime, changeset files).

Commit `.preactpress/changelog-manifest.json` only if you intentionally want a checked-in snapshot; by default the plugin regenerates from cache/sources at build time.

## Testing

Fixtures under `fixtures/` avoid live API calls. Run:

```bash
pnpm --filter @preactpress/plugin-changelog test
```

## License

MIT
