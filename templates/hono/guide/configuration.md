---
title: Configuration
description: Site config, theme options, and common frontmatter fields
---

Configuration lives in `.preactpress/config.ts` at your site root.

## Site metadata

```ts
export default {
  site: {
    title: 'My docs',
    description: 'Short site summary for SEO',
    base: '/',
    url: 'https://example.com',
    titleTemplate: ':title | :siteTitle'
  }
}
```

Set `site.url` before production so canonical URLs, `sitemap.xml`, Open Graph, and `hreflang` alternates resolve correctly.

## Content directory

| Option | Purpose |
| --- | --- |
| `srcDir` | Folder with `.md` / `.mdx` pages (default `.`) |
| `srcExclude` | Glob patterns for non-page Markdown, e.g. `['**/README.md']` |
| `lastUpdatedGit` | Use git commit time for “last updated” (falls back to file mtime) |

## Theme without custom code

`themeConfig` drives the default layout:

- `nav` — top links; supports nested dropdowns via `items`
- `sidebar` — flat array **or** path map: `{ '/guide/': [...], '/reference/': [...] }`; groups and items support `collapsed` and nested `items`
- `outline`, `search`, `socialLinks`, `footer`, `lastUpdated`, `editLink`, `logo`, `labels`
- `logo` — string URL or `{ light, dark }` for theme-aware images
- `search` — `true` or `{ provider: 'local' }` for sidebar search; `{ provider: 'algolia', options }` for Algolia DocSearch in the nav bar
- `socialLinks` — `{ icon, link, ariaLabel? }[]` with built-in icons (`github`, `discord`, `x`, …) or custom `{ svg }`

Per-locale overrides go under `locales.<key>.themeConfig`.

Example nested nav and sidebar:

```ts
themeConfig: {
  logo: { light: '/logo-light.svg', dark: '/logo-dark.svg' },
  labels: { search: 'Find pages' },
  nav: [
    { text: 'Guide', items: [{ text: 'Intro', link: '/guide/intro' }] },
    { text: 'Blog', link: '/blog' }
  ],
  sidebar: [
    {
      text: 'Guide',
      collapsed: false,
      items: [
        { text: 'Intro', link: '/guide/intro' },
        {
          text: 'Advanced',
          collapsed: true,
          items: [{ text: 'API', link: '/guide/api' }]
        }
      ]
    }
  ]
}
```

### Search providers

Local search (default when `search: true`) filters the sidebar and loads `preactpress-search.json` at build time.

Algolia DocSearch mounts a search button in the nav bar:

```ts
themeConfig: {
  search: {
    provider: 'algolia',
    options: {
      appId: 'YOUR_APP_ID',
      apiKey: 'YOUR_SEARCH_API_KEY',
      indexName: 'YOUR_INDEX_NAME',
      locales: {
        de: { indexName: 'YOUR_DE_INDEX' }
      }
    }
  }
}
```

### Social links

```ts
themeConfig: {
  socialLinks: [
    { icon: 'github', link: 'https://github.com/your-org/your-repo' },
    { icon: { svg: '<svg ...></svg>' }, link: 'https://example.com', ariaLabel: 'Company site' }
  ]
}
```

## Global head tags

```ts
head: [
  ['meta', { name: 'theme-color', content: '#0f766e' }]
],
async transformHead({ route, title, tags, site }) {
  return [['meta', { name: 'pp-route', content: route }]]
}
```

## Build hooks

Hooks run during `dev` and `build` unless noted otherwise.

```ts
async transformPageData(page, { route, site }) {
  if (page.kind !== 'markdown') return page
  return {
    ...page,
    meta: { ...page.meta, sourceRoute: route }
  }
},

async transformHtml(html, { route }) {
  return html.replace('</body>', `<!-- built:${route} --></body>`)
},

async buildEnd({ site, pages }) {
  console.log(`Built ${pages.length} pages to ${site.outDir}`)
}
```

### Async config

Export a factory to load nav or sidebar from an API at config time:

```ts
import { defineConfig } from '@kamod-ch/preactpress/config'

export default defineConfig(async () => ({
  site: { title: 'My docs', description: 'Docs from CMS' },
  themeConfig: {
    nav: await fetchNav(),
    sidebar: await fetchSidebar()
  }
}))
```

## Page frontmatter

| Field | Purpose |
| --- | --- |
| `title` / `description` | Page title and SEO summary |
| `titleTemplate` | Override site template; `false` uses the raw page title |
| `head` | Extra `<meta>` / `<link>` / `<script>` tags for this page only |
| `draft: true` | Excluded from routes, search, and sitemap |

Example per-page head:

```yaml
---
title: About
head:
  - - meta
    - name: author
      content: Your Name
---
```

::: warning
Enable `markdown.html` only for trusted authors — it allows raw HTML in Markdown.
:::
