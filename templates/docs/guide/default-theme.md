---
title: Default theme
description: Configure navigation, sidebars, search, locales, and responsive behavior.
---

The bundled theme provides a responsive header, mobile drawer, sidebar, page outline, local or Algolia search, dark mode, tags, previous/next links, edit links, and last-updated metadata.

## Navigation

`themeConfig.nav` accepts links and nested dropdowns. `themeConfig.sidebar` accepts one global array or a path-prefix map.

```ts
themeConfig: {
  nav: [
    { text: 'Guide', link: '/guide/getting-started' },
    { text: 'Resources', items: [{ text: 'Preact', link: 'https://preactjs.com' }] }
  ],
  sidebar: {
    '/guide/': [{ text: 'Guide', items: [{ text: 'Start', link: '/guide/getting-started' }] }],
    '/reference/': [{ text: 'Reference', items: [{ text: 'API', link: '/reference/api' }] }]
  }
}
```

Groups and nested items support `collapsed: true`.

## Mobile behavior

Below 900px, the header exposes an off-canvas menu. It contains the main navigation, locale links, social links, local search, and the active documentation sidebar. The drawer traps focus, closes with Escape or the backdrop, and restores focus to its trigger.

## Search

- `search: true` enables the generated local search index.
- `{ provider: 'local' }` is the explicit equivalent.
- `{ provider: 'algolia', options: ... }` mounts Algolia DocSearch.

## Page chrome

Frontmatter can select `layout: doc`, `home`, or `page` and override `navbar`, `sidebar`, `aside`, `outline`, `footer`, `editLink`, and `lastUpdated`.

See [Configuration](/guide/configuration) for every option.
