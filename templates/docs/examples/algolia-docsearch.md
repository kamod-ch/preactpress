---
title: Algolia DocSearch example
description: Configure the default theme to mount Algolia DocSearch instead of local search.
tags:
  - examples
  - search
---

# Algolia DocSearch example

The default theme can use local search (`search: true`) or Algolia DocSearch. Keep local search enabled until you have real DocSearch credentials; placeholder credentials intentionally fail `preactpress check`.

```ts
import { defineConfig } from "@kamod-ch/preactpress/config";

export default defineConfig({
  themeConfig: {
    search: {
      provider: "algolia",
      options: {
        appId: "YOUR_APP_ID",
        apiKey: "YOUR_SEARCH_API_KEY",
        indexName: "YOUR_INDEX_NAME",
        locales: {
          de: { indexName: "YOUR_DE_INDEX_NAME" },
        },
      },
    },
  },
});
```

When credentials are complete, the default theme renders the DocSearch button in the header and maps selected results back to PreactPress routes.
