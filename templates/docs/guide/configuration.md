---
title: Configuration reference
description: Complete reference for PreactPress site, theme, Markdown, build, and hook options.
---

Configuration lives in `.preactpress/config.ts`. A plain object works without imports; `defineConfig` adds type inference once PreactPress is installed.

```ts
import { defineConfig } from "@kamod-ch/preactpress/config";

export default defineConfig({
  site: { title: "My docs", description: "Product documentation" },
});
```

## Top-level options

| Option            | Purpose                                                            |
| ----------------- | ------------------------------------------------------------------ |
| `srcDir`          | Content root, default `.`                                          |
| `srcExclude`      | Glob patterns that must not become pages                           |
| `outDir`          | Static output directory, default `dist`                            |
| `cacheDir`        | Incremental build cache directory                                  |
| `cleanUrls`       | Emit `path/index.html` when true                                   |
| `rewrites`        | Map public routes to existing content routes                       |
| `ignoreDeadLinks` | Boolean, glob list, or callback used by `check`                    |
| `mpa`             | Remove client navigation from regular Markdown pages               |
| `lastUpdatedGit`  | Prefer git commit times for last-updated metadata                  |
| `theme`           | Custom Preact layout module relative to `.preactpress`             |
| `site`            | Global title, description, language, URL, base, and title template |
| `locales`         | Locale metadata and locale-specific theme settings                 |
| `themeConfig`     | Default-theme navigation and page chrome                           |
| `markdown`        | Markdown parser features                                           |
| `head`            | Global meta, link, and script tuples                               |
| `vite`            | User Vite configuration merged into the internal config            |
| `build`           | Sitemap, robots, and feed output                                   |
| `pageReady`       | Built-in loading overlay while CSS becomes ready; `false` disables |

## Page-ready preloader

PreactPress injects a small inline preloader into every HTML document so the first paint does not flash unstyled content. Customize or disable it in config instead of editing HTML with `transformHtml`.

```ts
export default defineConfig({
  // Disable the built-in preloader entirely
  pageReady: false,

  // Or customize the overlay
  pageReady: {
    preloader: '<img src="/brand-mark.svg" alt="" width="48" height="48" />',
    fallbackMs: 3000,
    probe: "--pp-bg", // CSS variable that must be set before reveal
  },
});
```

`preloader` accepts either a full element with `id="pp-preloader"` or inner HTML only (wrapped automatically). The built-in spinner follows the default theme: it reacts to `data-theme`, the `dark` class, and `prefers-color-scheme`. Custom markup needs its own light/dark styles unless you reuse the `pp-preloader-spinner` class.

`probe: false` skips the CSS-variable check and waits for stylesheet links only.

## Site metadata

```ts
site: {
  title: 'My docs',
  description: 'Short summary for search and social previews',
  lang: 'en',
  url: 'https://example.com',
  base: '/',
  titleTemplate: ':title | :siteTitle'
}
```

Set `site.url` for canonical URLs, Open Graph, sitemap, robots, feeds, and locale alternates. Use `site.base` for subpath hosting.

## Theme options

| Option        | Purpose                                   |
| ------------- | ----------------------------------------- |
| `logo`        | URL or `{ light, dark }` image pair       |
| `labels`      | Override localized UI labels              |
| `nav`         | Header links and nested dropdowns         |
| `sidebar`     | Global groups or path-prefix map          |
| `outline`     | Enable or choose heading levels           |
| `search`      | Local search or Algolia DocSearch         |
| `socialLinks` | Built-in or custom SVG social icons       |
| `tags`        | Show or hide page tag chips               |
| `footer`      | Site footer text                          |
| `editLink`    | Repository edit URL pattern using `:path` |
| `lastUpdated` | Show page timestamps                      |

Available label keys are `skip`, `navigation`, `menu`, `closeMenu`, `search`, `filterPages`, `searchResults`, `previous`, `next`, `lastUpdated`, `onThisPage`, and `language`.

## Markdown options

```ts
markdown: {
  html: false,
  linkify: true,
  typographer: true,
  emoji: true,
  math: false
}
```

Math is opt-in because it adds MathJax processing. Raw HTML should remain disabled for untrusted content.

## Build output

```ts
build: {
  sitemap: true,
  robots: true,
  feed: { limit: 20 }
}
```

Feed, sitemap, and robots output require `site.url`.

## Hooks

`transformHead`, `transformPageData`, and `transformHtml` run in development and production builds. `buildEnd` runs once after a successful production build. See [Advanced APIs](/guide/advanced).

## Page frontmatter

Common fields include `title`, `description`, `tags`, `image`, `type`, `draft`, `layout`, `hero`, `features`, `navbar`, `sidebar`, `aside`, `outline`, `footer`, `editLink`, `lastUpdated`, `titleTemplate`, `head`, `pageClass`, `isHome`, and `markdownStyles`.

## TypeScript types

Import `defineConfig` from `@kamod-ch/preactpress/config` for typed site configuration with autocomplete on every supported option. The loader accepts a plain object or an async factory:

```ts
import { defineConfig } from "@kamod-ch/preactpress/config";

export default defineConfig(async () => ({
  site: { title: "My docs", description: "Product documentation" },
}));
```

At build time PreactPress validates your config and resolves defaults into an internal `ResolvedConfig` object. User-facing options stay on `UserConfig`; internal modules consume the resolved shape only.

### Core types

| Type             | Import                         | Purpose                                     |
| ---------------- | ------------------------------ | ------------------------------------------- |
| `UserConfig`     | `@kamod-ch/preactpress/config` | Authoring shape in `.preactpress/config.ts` |
| `ResolvedConfig` | `@kamod-ch/preactpress`        | Fully resolved internal configuration       |
| `defineConfig`   | `@kamod-ch/preactpress/config` | Preserve literal types and async factories  |

`SiteConfig` remains available as a backward-compatible alias for `ResolvedConfig`.

Invalid or unknown options throw `ConfigError` with the option path, for example `preactpress config: plugins[0].name: expected a non-empty string`.

### Extension options

Most extension options are typed and validated today. Some are reserved for upcoming releases. **`versions`**, **`redirects`**, and **`check`** are active today.

| Option      | Purpose                                                                                     | Build output |
| ----------- | ------------------------------------------------------------------------------------------- | ------------ |
| `versions`  | Multi-version docs with version switcher, archived banners, and search/sitemap partitioning | Active       |
| `plugins`   | Typed plugin runtime with deterministic hook ordering                                       | Active       |
| `apiDocs`   | TypeDoc integration settings; set `false` to disable                                        | Reserved     |
| `openapi`   | OpenAPI integration settings; set `false` to disable                                        | Reserved     |
| `ai`        | AI export settings (`llmsTxt`, `llmsFullTxt`, `copyMarkdown`, `contextIndex`)               | Active       |
| `redirects` | HTTP redirects with validation, static HTML fallbacks, and `_redirects` export              | Active       |
| `check`     | `preactpress check` behavior (`failOnWarnings`, `plugins`)                                  | Active       |

Use `rewrites` for in-site route aliases that share one page. Use `redirects` for HTTP redirects emitted at build time.

```ts
export default defineConfig({
  site: { title: "My docs", description: "Product documentation", url: "https://example.com" },
  redirects: {
    "/old-guide": "/guide/new-guide",
    "/api/button": "/components/button",
  },
});
```

Array syntax supports explicit status codes:

```ts
redirects: [
  { from: "/old-guide", to: "/guide/new-guide", status: 301 },
  { from: "/temporary", to: "/guide/new-guide", status: 302 },
];
```

Advanced options control build outputs:

```ts
redirects: {
  entries: {
    "/old-guide": "/guide/new-guide",
  },
  generateHtmlFallbacks: true,
  generateRedirectsFile: true,
}
```

PreactPress validates redirect sources and targets, rejects duplicate sources and redirect loops, and warns in `preactpress check` when an internal target route does not exist. Redirect source routes are excluded from search, sitemap, and orphan detection. Static HTML fallbacks use a canonical URL pointing at the final destination.

Build output includes:

- Static HTML pages at each redirect source (meta refresh + `location.replace`, `noindex`)
- `_redirects` for Netlify and Cloudflare Pages (when `generateRedirectsFile` is enabled)
- `preactpress-redirects.json` with resolved rules and adapter metadata

### Documentation versioning

Recommended content layout:

```text
current/              # current version (unprefixed routes)
  index.md
  guide/
  de/                 # locale folders inside each version tree
versions/
  1.0/                # archived snapshot at /versions/1.0/...
  1.1/
```

```ts
export default defineConfig({
  versions: {
    current: "2.0",
    aliases: { latest: "2.0" },
    items: [
      { value: "2.0", label: "2.x", status: "current" },
      { value: "1.0", label: "1.x", status: "archived" },
    ],
    labels: {
      archivedBanner:
        "You are viewing docs for {label}. See the {currentLabel} docs for the latest version.",
    },
  },
});
```

Snapshot the current tree into `versions/<value>/` with:

```bash
preactpress version 1.2.0 --label "1.2"
preactpress version 1.2.0 --dry-run
```

Scope individual pages to specific versions with frontmatter:

```yaml
versions: ["2.0"]
```

Combined locale + version URLs use the pattern `/de/versions/1.0/guide/page`. Canonical URLs for archived pages point to the equivalent current-version route when it exists.

```ts
export default defineConfig({
  site: { title: "My docs", description: "Product documentation" },
  versions: {
    latest: { label: "Next" },
    "2.0": { label: "v2.0", link: "/2.0/" },
  },
  plugins: [{ name: "my-plugin", enforce: "pre" }],
  apiDocs: { tsconfig: "tsconfig.json", outDir: "api" },
  openapi: { spec: "openapi.yaml", base: "/api" },
  ai: {
    llmsTxt: true,
    llmsFullTxt: true,
    copyMarkdown: true,
    contextIndex: true,
  },
  check: { failOnWarnings: false, plugins: true },
});
```

Omitting an extension block keeps the resolved defaults: empty `plugins`, disabled `apiDocs` / `openapi` / `ai`, empty redirect rules, and `check: { failOnWarnings: false, plugins: true }`.

### AI exports

Set `ai` to enable static artifacts for LLM retrieval and AI coding tools. See [AI-ready documentation](/guide/ai-coding-tools) for usage with Cursor, Claude Code, and similar tools.

```ts
export default defineConfig({
  site: {
    title: "My docs",
    description: "Product documentation",
    url: "https://docs.example.com",
  },
  ai: {
    llmsTxt: true,
    llmsFullTxt: true,
    copyMarkdown: true,
    contextIndex: true,
    exclude: ["/404", "/draft/**"],
    maxBundleBytes: 1_500_000,
  },
});
```

Build output includes `/llms.txt`, `/llms-full.txt`, per-page `*.md` files, and `/api/context.json` when the corresponding flags are enabled. The default theme shows **Copy page as Markdown** when `copyMarkdown` is true.

Frontmatter and page metadata are described by `PageFrontmatter` from `@kamod-ch/preactpress/shared` or `@kamod-ch/preactpress/config`.

For blogs and magazines, optional content-model helpers are available:

```ts
import { createContentLoader } from "@kamod-ch/preactpress/config";
import { articleFromFrontmatter, type ArticlePost } from "@kamod-ch/preactpress/shared";

export default createContentLoader<ArticlePost[]>(["posts/*.md"], {
  transform(items) {
    return items.map((item) =>
      articleFromFrontmatter({
        route: item.route,
        url: item.url,
        title: item.title,
        description: item.description,
        frontmatter: item.frontmatter,
      }),
    );
  },
});
```

Loader output is exposed on `page.meta.contentData` for the matching route.
