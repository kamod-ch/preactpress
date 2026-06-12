---
title: Routing
description: Understand how PreactPress maps files to URLs
---

# Routing

PreactPress uses file-based routing. Every `.md` and `.mdx` file under `srcDir` becomes a route, and production builds write each route as static HTML.

## File-based routing

Given this structure:

```text
.
├── index.md
├── about.md
├── guide/
│   ├── index.md
│   └── getting-started.md
└── interactive.mdx
```

PreactPress creates these routes:

```text
index.md                  -> /
about.md                  -> /about
guide/index.md            -> /guide
guide/getting-started.md  -> /guide/getting-started
interactive.mdx           -> /interactive
```

During production builds, routes are written as directory indexes:

```text
/                      -> dist/index.html
/about                 -> dist/about/index.html
/guide/getting-started -> dist/guide/getting-started/index.html
```

By default (`cleanUrls: true`), builds emit directory indexes so hosts can serve extensionless URLs.

## Project root and source directory

The project root is where PreactPress looks for `.preactpress/config.ts`.

By default, source files also live in the project root:

```text
.
├── .preactpress/
│   └── config.ts
├── index.md
└── guide/
    └── getting-started.md
```

You can move content into a nested source directory with `srcDir`:

```ts
export default {
  srcDir: 'docs'
}
```

That produces this shape:

```text
.
├── .preactpress/
│   └── config.ts
└── docs/
    ├── index.md
    └── guide/
        └── getting-started.md
```

The resulting routes stay the same:

```text
docs/index.md                  -> /
docs/guide/getting-started.md  -> /guide/getting-started
```

## Linking between pages

Use absolute or relative links. The recommended style is to omit file extensions:

```md
[Getting Started](/guide/getting-started)
[Routing](./routing)
[Home](../)
```

Avoid linking directly to generated HTML or source Markdown:

```md
<!-- Avoid -->
[Getting Started](/guide/getting-started.md)
[Getting Started](/guide/getting-started.html)
```

`preactpress check` validates local Markdown links that use `.md`, `.mdx`, or `.html` extensions and reports missing pages.

## Locale routes

PreactPress supports VitePress-style locale folders. Keep the default language at the root and put translations in locale folders:

```text
index.md                       -> /
guide/getting-started.md       -> /guide/getting-started
de/index.md                    -> /de
de/guide/getting-started.md    -> /de/guide/getting-started
```

Configure locale labels, language codes, and locale-specific nav in `.preactpress/config.ts`:

```ts
export default {
  locales: {
    root: {
      label: 'English',
      lang: 'en'
    },
    de: {
      label: 'Deutsch',
      lang: 'de',
      link: '/de/'
    }
  }
}
```

The default theme shows a language switcher when multiple locales are configured.

## Tag routes

Pages can define tags in frontmatter:

```md
---
title: Release notes
tags: [release, changelog]
---
```

Each tag receives an index page:

```text
release   -> /tags/release
changelog -> /tags/changelog
```

For localized content, tag pages are scoped to the locale:

```text
de/guide/intro.md with tag "Markdown" -> /de/tags/markdown
```

If a real Markdown or MDX page exists at the same route as a generated tag index, the real page wins.

## Base path

Use `site.base` when the site is served from a subpath, for example GitHub Pages project sites:

```ts
export default {
  site: {
    base: '/my-repo/'
  }
}
```

You can also override it for one build:

```bash
pnpm exec preactpress build --base /my-repo/
```

## Route rewrites

Map a public URL to existing content without duplicating files:

```ts
export default {
  rewrites: {
    '/docs': '/guide',
    '/getting-started': '/guide/intro'
  }
}
```

Keys are the routes visitors use; values must point at routes that already exist from your Markdown files. `preactpress check` validates rewrite sources and collisions.

## Clean URLs and hosting

| `cleanUrls` | Output for `/about` | Typical host |
| --- | --- | --- |
| `true` (default) | `dist/about/index.html` | Netlify, Vercel, Cloudflare Pages, GitHub Pages |
| `false` | `dist/about.html` | Static buckets without directory index support |

```ts
export default {
  cleanUrls: false
}
```

Most modern static hosts work with the default. Set `cleanUrls: false` only when your host cannot resolve `/about` to `about/index.html`.

## Dynamic routes

Generate routes at build time with a bracket template and a colocated `.paths.ts` file:

```md
<!-- packages/[pkg].md -->
---
title: "{{ params.pkg }}"
---

# {{ params.pkg }}
```

```ts
// packages/[pkg].paths.ts
export default {
  paths() {
    return [
      { params: { pkg: 'preact' } },
      { params: { pkg: 'vite' }, props: { note: 'Build tool' } }
    ]
  }
}
```

This emits `/packages/preact` and `/packages/vite`. Use `{{ params.key }}` and `{{ props.key }}` in frontmatter and body.

## Data loaders

Colocate `*.data.ts` with a page to load build-time data via `createContentLoader` from `@kamod-ch/preactpress/config`. The result is exposed on `page.meta.contentData` (and in themes through the `page` prop).

```ts
// blog.data.ts
import { createContentLoader } from '@kamod-ch/preactpress/config'

export default createContentLoader('posts/*.md', {
  transform(items) {
    return items.map((item) => ({
      title: item.title,
      route: item.route
    }))
  }
})
```

Pair with `blog.md` or `blog/index.md` for route `/blog`.

## Current limitations

| Feature | Status |
| --- | --- |
| Dynamic MDX templates (`[id].mdx`) | Not supported (use `.md` templates) |
| Pattern-based rewrites with params | Not supported |
