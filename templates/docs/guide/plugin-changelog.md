---
title: Changelog plugin
description: Generate searchable release pages from GitHub Releases, local CHANGELOG files, or Changesets
---

# Changelog plugin

`@preactpress/plugin-changelog` turns release notes into documentation pages with search, sidebar integration, and optional RSS feeds.

## Installation

```bash
pnpm add -D @preactpress/plugin-changelog
```

Peer dependency: `@kamod-ch/preactpress` >= 2.2.0

## GitHub Releases

```ts
import { defineConfig } from "@kamod-ch/preactpress/config";
import { changelogPlugin } from "@preactpress/plugin-changelog";

export default defineConfig({
  site: {
    title: "My library",
    url: "https://docs.example.com",
  },
  plugins: [
    changelogPlugin({
      provider: "github",
      repository: "owner/repo",
      route: "/changelog",
    }),
  ],
});
```

Set `GITHUB_TOKEN` or `GH_TOKEN` for higher API rate limits in CI.

## Local CHANGELOG.md

```ts
changelogPlugin({
  provider: "local",
  local: "./CHANGELOG.md",
  route: "/changelog",
});
```

The plugin parses [Keep a Changelog](https://keepachangelog.com/) format.

## Changesets (optional)

Merge unpublished `.changeset/*.md` entries as an **Unreleased** section:

```ts
changelogPlugin({
  provider: "local",
  local: "./CHANGELOG.md",
  changesets: true,
});
```

## Generated pages

| Page               | Contents                                                             |
| ------------------ | -------------------------------------------------------------------- |
| Changelog overview | Release table, recent highlights                                     |
| Release pages      | Version, date, breaking changes, features, fixes                     |
| Contributors       | Parsed from `@mentions` and GitHub release authors                   |
| Migration links    | Parsed from release bodies when authors include migration guide URLs |

## Options

| Option               | Default        | Description                                     |
| -------------------- | -------------- | ----------------------------------------------- |
| `provider`           | —              | `local`, `github`, or `changesets`              |
| `repository`         | —              | GitHub `owner/name` (required for `github`)     |
| `local`              | `CHANGELOG.md` | Path to Keep a Changelog file                   |
| `route`              | `/changelog`   | URL prefix for generated pages                  |
| `cache`              | `true`         | Cache manifests and remote payloads             |
| `offline`            | `false`        | Use cache only, no network (CI reproducibility) |
| `changesets`         | `false`        | Merge pending Changesets                        |
| `versionIntegration` | `false`        | Routes under `/versions/{value}/changelog`      |
| `feed`               | `true`         | Atom feed at `{route}/feed.xml`                 |

## Version integration

Enable version-scoped changelog routes when using [documentation versioning](/guide/versioning):

```ts
changelogPlugin({
  provider: "local",
  local: "./CHANGELOG.md",
  versionIntegration: true,
});
```

## Caching and CI

1. Online builds fetch GitHub Releases and cache to `node_modules/.preactpress/changelog/`.
2. Offline builds (`offline: true`) reuse cached payloads — ideal for reproducible CI when cache is restored.

## Provider architecture

Future providers (GitLab, Gitea, Forgejo) implement the `ChangelogProvider` interface. Only `local`, `github`, and `changesets` ship today. See [Known limitations](/guide/limitations).

## Next steps

| Page                                       | Why                    |
| ------------------------------------------ | ---------------------- |
| [Plugins](/guide/plugins)                  | Plugin system overview |
| [Versioning](/guide/versioning)            | Multi-version docs     |
| [GitHub Actions](/examples/github-actions) | CI deployment patterns |
