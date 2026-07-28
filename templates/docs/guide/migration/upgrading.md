---
title: Upgrading PreactPress
description: Step-by-step upgrade paths between PreactPress versions
---

# Upgrading PreactPress

This page summarizes upgrade paths. The full guide lives in the repository at [UPGRADE.md](https://github.com/kamod-ch/preactpress/blob/main/UPGRADE.md).

## Quick upgrade (2.2 → 2.3)

No breaking changes. Update the package and replace deprecated aliases:

```bash
pnpm add -D @kamod-ch/preactpress@^2.3.0
pnpm check
pnpm build
```

| Deprecated | Use instead |
| ---------- | ----------- |
| `llmsTxtPlugin()` | `aiExportsPlugin()` |
| `printCheckResult()` | `printDocumentationCheckResult()` |
| `SiteConfig` | `ResolvedConfig` |

## Upgrade from 1.x to 2.x

Version 2.x adds plugins, versioning, redirects, AI exports, and `preactpress check`.

### 1. Update dependencies

```bash
pnpm add -D @kamod-ch/preactpress@^2.0.0
```

Add official plugins as needed:

```bash
pnpm add -D @preactpress/plugin-mermaid @preactpress/plugin-playground
```

### 2. Adopt plugin registration

```ts
import { defineConfig } from "@kamod-ch/preactpress/config";
import { mermaidPlugin } from "@preactpress/plugin-mermaid";

export default defineConfig({
  plugins: [mermaidPlugin()],
});
```

Legacy config hooks (`transformHead`, `transformPageData`, `buildEnd`) still work.

### 3. Add validation to CI

```yaml
- run: pnpm check
```

See [GitHub Actions check example](/examples/github-actions-check).

### 4. Enable new features (optional)

**Redirects:**

```ts
redirects: { "/old": "/guide/new" },
```

**AI exports:**

```ts
ai: { llmsTxt: true, llmsFullTxt: true, copyMarkdown: true, contextIndex: true },
```

**Versioning:** see [Documentation versioning](/guide/versioning).

### 5. Verify

```bash
preactpress check --strict
preactpress build
```

## Node.js requirements

Node.js **20+** is required. Tested on 20, 22, and 24.

## Other migration paths

| From | Guide |
| ---- | ----- |
| VitePress | [Migrate from VitePress](/guide/migration/vitepress) |
| All paths index | [MIGRATION.md](https://github.com/kamod-ch/preactpress/blob/main/MIGRATION.md) |
| Breaking changes | [CHANGELOG](https://github.com/kamod-ch/preactpress/blob/main/CHANGELOG.md) |
| Known constraints | [Limitations](/guide/limitations) |

## Getting help

Open a [GitHub Issue](https://github.com/kamod-ch/preactpress/issues) with your PreactPress version, config snippet, and `preactpress check` output.
