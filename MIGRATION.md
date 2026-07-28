# Migration guides

Index of migration paths for PreactPress documentation sites.

## From other documentation tools

| Source | Guide |
| ------ | ----- |
| VitePress | [Migrate from VitePress](https://kamod-ch.github.io/preactpress/guide/migration/vitepress/) |
| VitePress (CLI) | `preactpress migrate vitepress [root]` |

The VitePress migration copies Markdown content, frontmatter, and navigation structure. Vue components must be rewritten as Preact MDX components.

## Between PreactPress versions

| Path | Guide |
| ---- | ----- |
| 1.x → 2.x | [UPGRADE.md](./UPGRADE.md) |
| 2.2.x → 2.3.x | [UPGRADE.md](./UPGRADE.md) — no breaking changes |
| Any version | [Upgrading PreactPress](https://kamod-ch.github.io/preactpress/guide/migration/upgrading/) |

## Common migration tasks

### Replace deprecated APIs

```ts
// Before
import { llmsTxtPlugin, type SiteConfig } from "@kamod-ch/preactpress";

// After
import { aiExportsPlugin, type ResolvedConfig } from "@kamod-ch/preactpress";
```

### Move redirects from hosting config to PreactPress

Instead of maintaining redirects only in Netlify or Cloudflare dashboards, declare them in config so `preactpress check` validates targets:

```ts
export default defineConfig({
  redirects: {
    "/v1/docs": "/guide/getting-started",
  },
});
```

Build output includes `_redirects` when `generateRedirectsFile: true`.

### Adopt documentation versioning

1. Scaffold with `pnpm dlx @kamod-ch/preactpress init my-docs --template versions`, or
2. Restructure existing content into `current/` and snapshot with `preactpress version 1.0.0`.

See [Versioning guide](https://kamod-ch.github.io/preactpress/guide/versioning/).

### Add AI exports for coding agents

```ts
export default defineConfig({
  ai: {
    llmsTxt: true,
    llmsFullTxt: true,
    copyMarkdown: true,
    contextIndex: true,
  },
});
```

After build, serve `/llms.txt` and `/llms-full.txt` from your static host. See [AI-ready documentation](https://kamod-ch.github.io/preactpress/guide/ai-coding-tools/).

### Split monorepo docs

Use the `monorepo` init template or configure `workspaces` in config. See [Monorepo guide](https://kamod-ch.github.io/preactpress/guide/monorepo/).

## Validation checklist

After any migration:

```bash
preactpress check --strict
preactpress build
```

Fix all errors before deploying. Warnings about drafts, SEO, or external links can be tuned via `check` and `ignoreDeadLinks` options.
