---
title: GitHub Actions documentation check
description: Run preactpress check in CI with JSON reports, strict mode, and optional external link verification.
---

PreactPress ships a documentation quality gate that runs without changing build output. Use it in CI before `build` to catch broken links, missing metadata, orphan pages, and invalid redirects early.

## Official workflow template

Copy the maintained template from the PreactPress repository:

[`examples/github-actions/check.yml`](https://github.com/kamod-ch/preactpress/blob/main/examples/github-actions/check.yml)

Or use the composite action:

```yaml
- uses: kamod-ch/preactpress/action@v2
  with:
    command: all
    node-version: 22
```

See [GitHub Actions](/examples/github-actions) for Pages deployment, Node.js matrices, and all action inputs.

## Minimal workflow

```yaml
name: Docs check

on:
  pull_request:
  push:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec preactpress check
      - run: pnpm exec preactpress build
```

The check command exits with code `0` when no errors are found and a non-zero code when errors remain.

## JSON report artifact

Write a stable JSON report for dashboards or PR comments:

```yaml
      - run: pnpm exec preactpress check --format json --output reports/docs-check.json
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: docs-check
          path: reports/docs-check.json
```

Example JSON shape:

```json
{
  "score": 86,
  "errors": [],
  "warnings": [],
  "stats": {
    "errors": 0,
    "warnings": 8,
    "brokenLinks": 1,
    "orphanPages": 3,
    "missingMetadata": 4
  },
  "routes": ["/", "/guide/getting-started"]
}
```

## Strict mode

Treat warnings as CI failures when you want zero tolerance for missing descriptions, orphan pages, or unknown code languages:

```yaml
      - run: pnpm exec preactpress check --strict
```

Combine with site config:

```ts
export default defineConfig({
  check: { failOnWarnings: true },
});
```

The CLI `--strict` flag applies the same behavior for one-off runs.

## External links (optional)

By default, `preactpress check` does not perform network requests. Enable external verification only when you explicitly want it:

```yaml
      - run: pnpm exec preactpress check --external
```

Use this sparingly in CI to avoid flaky third-party endpoints and unnecessary network access.

## Monorepo sites

Run the check against a package path:

```yaml
      - run: pnpm exec preactpress check ./packages/docs --format json --output reports/docs-check.json
```

Or from the site package:

```yaml
      - working-directory: packages/docs
        run: pnpm run check
```

## Recommended release pipeline

```yaml
      - run: pnpm exec preactpress check --strict --format json --output reports/docs-check.json
      - run: pnpm exec preactpress build
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: docs-check
          path: reports/docs-check.json
```

See also [GitHub Actions](/examples/github-actions), [Deploy](/guide/deploy), and [CLI and validation](/guide/commands).
