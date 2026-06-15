---
title: Content loader example
description: A runnable createContentLoader example that collects guide metadata at build time.
tags:
  - examples
  - data
---

# Content loader example

This page has a matching `examples/content-loader.data.ts` module. During `preactpress build`, it collects guide pages and attaches the transformed result to this route's page data.

The default theme does not render `contentData` automatically, but custom themes can read it from `page.meta.contentData` just like the magazine starter does.

```ts
import { createContentLoader } from "@kamod-ch/preactpress/config";

export default createContentLoader(["guide/*.md"], {
  transform(items) {
    return items.map((item) => ({
      title: item.title,
      route: item.route,
      description: item.description,
    }));
  },
});
```

Build this starter and inspect `dist/preactpress-content/examples/content-loader.json` to see the generated data payload.
