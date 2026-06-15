---
title: Advanced APIs
description: Build hooks, data loaders, dynamic routes, MPA mode, and incremental builds.
---

## Async configuration

Export an async factory when navigation or metadata comes from another system.

```ts
import { defineConfig } from "@kamod-ch/preactpress/config";

export default defineConfig(async () => ({
  site: { title: "CMS docs", description: "Generated navigation" },
  themeConfig: { sidebar: await loadSidebar() },
}));
```

## Build hooks

- `transformHead(ctx)` returns additional head tags.
- `transformPageData(page, ctx)` changes page data before rendering.
- `transformHtml(html, ctx)` changes the final HTML document.
- `buildEnd(ctx)` runs after production output is complete.

Hooks may be asynchronous. Keep output deterministic so incremental builds and CI remain reproducible.

## Content loaders

Import `createContentLoader` from `@kamod-ch/preactpress/config` in a `*.data.ts` module to collect and transform content metadata at build time. Loader results are available to the associated page module.

## Dynamic routes

A route such as `products/[slug].mdx` can provide `products/[slug].paths.ts`. The paths module returns the parameter values that PreactPress must render during the static build.

Every dynamic path must be known at build time; PreactPress does not add a production server.

## MPA mode

Set `mpa: true` to omit the client bundle from regular Markdown pages and use full-page navigation. MDX pages still hydrate when they contain interactive components.

## Incremental builds

Build metadata is stored under `cacheDir`. Deploy `outDir` only and keep cache data out of the public artifact.
