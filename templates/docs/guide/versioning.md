---
title: Documentation versioning
description: Multi-version docs with version switcher, archived snapshots, and scoped search
---

# Documentation versioning

PreactPress supports multiple documentation versions from a single project. Readers switch versions in the theme; archived versions show a banner and canonical URLs point to the current docs when an equivalent page exists.

## When to use versioning

Use versioning when you maintain docs for more than one major or minor release of a library or product — for example `/` for 2.x and `/versions/1.0/` for the 1.x archive.

For a single living docs site, skip versioning and use regular file-based routes.

## Content layout

Recommended directory structure:

```text
current/              # current version (unprefixed routes)
  index.md
  guide/
  de/                 # locale folders inside each version tree
versions/
  1.0/                # archived snapshot at /versions/1.0/...
  1.1/
```

The `versions` init template scaffolds this layout:

```bash
pnpm dlx @kamod-ch/preactpress init my-docs --template versions
```

## Configuration

```ts
import { defineConfig } from "@kamod-ch/preactpress/config";

export default defineConfig({
  versions: {
    current: "2.0",
    aliases: { latest: "2.0" },
    items: [
      { value: "2.0", label: "2.x", status: "current" },
      { value: "1.0", label: "1.x", status: "archived" },
    ],
    labels: {
      switcher: "Version",
      archivedBanner:
        "You are viewing docs for {label}. See the {currentLabel} docs for the latest version.",
    },
  },
});
```

| Option | Purpose |
| ------ | ------- |
| `current` | Value of the active version (matches `current/` content) |
| `items` | List shown in the version switcher |
| `aliases` | Extra labels mapped to a version value (e.g. `latest`) |
| `labels` | UI strings for switcher and archived banner |

## Snapshot a version

When you release a new major version, snapshot the current tree:

```bash
preactpress version 1.2.0 --label "1.2"
preactpress version 1.2.0 --dry-run   # preview without writing files
```

This copies `current/` into `versions/1.2.0/` and updates config metadata.

## Page-level version scope

Limit a page to specific versions with frontmatter:

```yaml
---
title: New API
versions: ["2.0"]
---
```

## URLs and locales

| Pattern | Example |
| ------- | ------- |
| Current version | `/guide/page` |
| Archived version | `/versions/1.0/guide/page` |
| Locale + version | `/de/versions/1.0/guide/page` |

Canonical URLs for archived pages point to the equivalent current-version route when it exists.

## Search and sitemap

Search index and sitemap entries are partitioned by version. The version switcher filters results to the active version context.

## Validation

`preactpress check` validates version config, orphaned version routes, and missing targets in version-scoped navigation.

## Integration with changelog plugin

`@preactpress/plugin-changelog` supports `versionIntegration: true` to duplicate changelog routes under `/versions/{value}/changelog`. See [Changelog plugin](/guide/plugin-changelog/).

## Next steps

| Page | Why |
| ---- | --- |
| [Configuration](/guide/configuration) | Full `versions` option reference |
| [Routing and i18n](/guide/routing) | Locale + version URL patterns |
| [Starter templates](/guide/templates) | Compare `versions` and `docs` templates |
