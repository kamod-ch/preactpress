---
title: Your first 5 minutes
description: Change the site title, add a page, and update navigation
---

# Your first 5 minutes

This hands-on tutorial follows the setup overview in [Getting Started](/guide/getting-started). Follow the steps below in **your** project — this site is the result.

## 1. Change the site title

Edit `.preactpress/config.ts`:

```ts
export default {
  site: {
    title: 'My Docs',
    description: 'Short summary for search and social previews'
  }
}
```

Save the file. The dev server picks up config changes on the next request.

## 2. Add a page

Create `about.md`:

```md
---
title: About
description: About this site
---

# About us

Your content here.
```

PreactPress serves it at `/about`. Every `.md` or `.mdx` file under `srcDir` (default: project root) becomes a URL automatically.

Example: `news/2025/intro.md` → `/news/2025/intro`.

This starter already includes [About](/about) so you can see the finished page.

## 3. Add it to the navigation

In `.preactpress/config.ts`:

```ts
export default {
  site: { title: 'My Docs' },
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'About', link: '/about' }
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Home', link: '/' },
          { text: 'About', link: '/about' }
        ]
      }
    ]
  }
}
```

Save — the dev server hot-reloads your changes.

## Next steps

| Command | Purpose |
| --- | --- |
| `pnpm run dev` | Dev server with SSR and hot reload |
| `pnpm run check` | Validate config, links, and routes |
| `pnpm run build` | Static production build → `dist/` |
| `pnpm run preview` | Local preview of the build |

Before deploying, set `site.url` in config for canonical URLs, Open Graph tags, and `sitemap.xml`. Continue with [Routing](/guide/routing) to understand file-based routes, then [Deploy](/guide/deploy) for production build steps.
