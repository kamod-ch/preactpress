---
title: CLI and validation
description: Commands for scaffolding, development, validation, builds, and previews.
---

Run commands from the site root or pass a root path as the final argument.

| Command                                      | Purpose                                            |
| -------------------------------------------- | -------------------------------------------------- |
| `preactpress init [dir]`                     | Scaffold the minimal starter                       |
| `preactpress init [dir] --template docs`     | Scaffold the full documentation starter            |
| `preactpress init [dir] --template magazine` | Scaffold a custom editorial theme                  |
| `preactpress init [dir] --template hono`     | Scaffold a product/docs custom theme               |
| `preactpress dev [root]`                     | Start Vite SSR and hot reload                      |
| `preactpress check [root]`                   | Documentation quality gate (links, metadata, i18n) |
| `preactpress build [root]`                   | Emit static production files                       |
| `preactpress preview [root]`                 | Serve `outDir` locally                             |
| `preactpress migrate vitepress [options]`    | Migrate a VitePress site to PreactPress output     |

See [Starter templates](/guide/templates) for a comparison of the four official init starters.

## Recommended workflow

```bash
pnpm run dev
pnpm run check
pnpm run build
pnpm run preview
```

Add `check` and `build` to CI. `preview` is a local smoke-test server, not a production runtime.

## Documentation check

`preactpress check` validates site quality without changing build output.

```bash
preactpress check
preactpress check --format json
preactpress check --strict
preactpress check --external
preactpress check --output reports/docs-check.json
```

Human output includes a score and summary counts:

```text
PreactPress Documentation Check

Score: 86/100

Errors: 2
Warnings: 8
Broken links: 1
Orphan pages: 3
Missing metadata: 4
```

Exit codes:

| Code | Meaning                                         |
| ---- | ----------------------------------------------- |
| `0`  | No errors (warnings allowed unless `--strict`)  |
| `1`  | One or more errors, or warnings with `--strict` |

JSON output is stable and CI-friendly. When `--output` is set, the JSON report is written to that path regardless of stdout format.

External http(s) links are verified only when `--external` is passed. The command performs no network access by default.

Programmatic API:

```ts
import { check, type DocumentationCheckResult } from "@kamod-ch/preactpress";

const result: DocumentationCheckResult = await check("./");
console.log(result.score, result.stats.brokenLinks);
```

See [GitHub Actions](/examples/github-actions) and [documentation check in CI](/examples/github-actions-check) for official workflow templates.

## Migrate from VitePress

```bash
preactpress migrate vitepress --source ./docs
preactpress migrate vitepress --dry-run
preactpress migrate vitepress --output ./preactpress-docs --report migration-report.json
```

See [Migrate from VitePress](/guide/migration/vitepress) for details on automatic migration, Vue porting hints, and planned adapters.

## What check validates

- broken internal links and unresolvable relative links
- missing page titles and descriptions
- invalid frontmatter and duplicate heading IDs
- duplicate route slugs (collisions)
- orphan and unreachable pages
- navigation entries without targets or missing destinations
- missing image alt text and missing local image files
- unknown code block languages
- invalid redirects and redirect loops
- missing i18n translations when locales are configured
- rewrite/canonical conflicts
- configuration, locale roots, layouts, drafts, and SEO warnings
- optional external link verification with `--external`

Use `ignoreDeadLinks` only for intentional external or generated destinations.
