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

Import `defineConfig` from `@kamod-ch/preactpress/config` for typed site configuration. Frontmatter and page metadata are described by `PageFrontmatter` from `@kamod-ch/preactpress/shared` or `@kamod-ch/preactpress/config`.

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
