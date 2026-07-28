# Upgrade guide

This guide covers upgrading `@kamod-ch/preactpress` between major and minor releases. For migrating from VitePress, see the [VitePress migration guide](https://kamod-ch.github.io/preactpress/guide/migration/vitepress/).

## Before you upgrade

1. Run `preactpress check` on your current site and fix existing issues.
2. Read [CHANGELOG.md](./CHANGELOG.md) for breaking changes in your target version.
3. Pin the new version in `package.json` and reinstall dependencies.

```bash
pnpm add -D @kamod-ch/preactpress@^2.3.0
pnpm install
pnpm check
pnpm build
```

## Upgrade to 2.3.x (from 2.2.x)

No breaking API changes. This is a documentation and ecosystem release.

**Recommended steps:**

1. Update official plugins to the latest `@preactpress/*` versions if you use them.
2. Replace deprecated aliases in config and custom scripts:

| Deprecated | Replacement |
| ---------- | ----------- |
| `llmsTxtPlugin()` | `aiExportsPlugin()` |
| `printCheckResult()` | `printDocumentationCheckResult()` |
| `SiteConfig` type | `ResolvedConfig` |

3. Add `preactpress check` to CI if not already present — see [GitHub Actions check example](https://kamod-ch.github.io/preactpress/examples/github-actions-check/).
4. Enable AI exports if you use coding agents:

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

## Upgrade to 2.x (from 1.x)

Version 2.x introduces the plugin system, documentation versioning, redirects, AI exports, and an expanded `preactpress check` command.

### Config changes

**Plugins** — register extensions explicitly instead of relying on legacy config hooks alone:

```ts
import { defineConfig } from "@kamod-ch/preactpress/config";
import { mermaidPlugin } from "@preactpress/plugin-mermaid";

export default defineConfig({
  plugins: [mermaidPlugin()],
});
```

Legacy hooks (`transformHead`, `transformPageData`, `buildEnd`) still work and are merged into the plugin pipeline as `preactpress:config-hooks`. Prefer plugins for new code.

**Redirects** — use the top-level `redirects` option instead of manual HTML redirects:

```ts
redirects: {
  "/old-page": "/guide/new-page",
}
```

**Versioning** — adopt the `current/` + `versions/` content layout and configure `versions` in config. See [Versioning guide](https://kamod-ch.github.io/preactpress/guide/versioning/).

**Type alias** — replace `SiteConfig` imports with `ResolvedConfig`:

```ts
import type { ResolvedConfig } from "@kamod-ch/preactpress";
```

### CLI changes

| 1.x | 2.x |
| --- | --- |
| `preactpress build` | unchanged |
| Manual link checking | `preactpress check` with structured output |
| — | `preactpress version <value>` for doc snapshots |
| — | `preactpress migrate vitepress` |

### Template updates

Re-scaffold is not required. Compare your project with the current template in the PreactPress repository:

- [`templates/docs`](./templates/docs) — canonical documentation starter
- [`templates/versions`](./templates/versions) — versioning example
- [`examples/showcase`](./examples/showcase) — feature showcase

Update `.preactpress/config.ts` to match new options documented in the [configuration reference](https://kamod-ch.github.io/preactpress/guide/configuration/).

### Node.js

Node.js **20+** is required. Node 20, 22, and 24 are tested in CI.

## Verify after upgrade

```bash
pnpm check          # or: preactpress check
pnpm build
pnpm preview        # smoke-test locally
```

For strict CI gates:

```bash
preactpress check --strict
```

## Getting help

- [Known limitations](https://kamod-ch.github.io/preactpress/guide/limitations/)
- [GitHub Issues](https://github.com/kamod-ch/preactpress/issues)
- [Release report](./RELEASE-REPORT.md)
