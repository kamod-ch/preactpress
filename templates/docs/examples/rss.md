---
title: RSS / Atom feed
description: Generate a static feed.xml for blogs, changelogs, and magazine-style sites.
tags:
  - examples
  - deploy
---

PreactPress can generate a static `feed.xml` during production builds. The feed uses the Atom XML format and is suitable for RSS readers.

## Enable the feed

Set `site.url` and enable `build.feed` in `.preactpress/config.ts`:

```ts [.preactpress/config.ts]
import { defineConfig } from "@kamod-ch/preactpress/config";

export default defineConfig({
  site: {
    title: "Acme Blog",
    description: "Product updates and engineering notes",
    url: "https://example.com",
  },

  build: {
    feed: { limit: 20 },
  },
});
```

After running a production build, PreactPress writes:

```txt
dist/feed.xml
```

## Add page metadata

Feed entries use each page's title, description, route, and `lastUpdated` value.

```md [posts/launch.md]
---
title: Launch notes
description: What shipped in our first public release.
lastUpdated: 2026-07-01T10:00:00.000Z
tags:
  - changelog
---

We shipped the first public version today.
```

## Build and inspect

```sh
pnpm run build
```

Then open or publish:

```txt
https://example.com/feed.xml
```

## Link the feed from your HTML head

You can expose the feed to browsers and feed readers with `transformHead`:

```ts [.preactpress/config.ts]
import { defineConfig } from "@kamod-ch/preactpress/config";

export default defineConfig({
  site: {
    title: "Acme Blog",
    description: "Product updates and engineering notes",
    url: "https://example.com",
  },

  build: {
    feed: { limit: 20 },
  },

  transformHead() {
    return [
      [
        "link",
        {
          rel: "alternate",
          type: "application/atom+xml",
          title: "Acme Blog feed",
          href: "/feed.xml",
        },
      ],
    ];
  },
});
```

## Notes

- Feed generation requires `site.url`.
- Draft pages are excluded from production output and therefore from the feed.
- `build.feed: true` includes all pages.
- `build.feed: { limit: 20 }` keeps only the newest entries.
