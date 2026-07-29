---
title: TypeDoc plugin
description: Official @preactpress/plugin-typedoc integration
---

# TypeDoc plugin

Generate searchable API reference pages from TypeScript entry points:

```ts
import { typedocPlugin } from "@preactpress/plugin-typedoc";

export default defineConfig({
  plugins: [
    typedocPlugin({
      entries: ["src/index.ts"],
      output: "reference/api",
      includePrivate: false,
      sourceLinks: true,
    }),
  ],
});
```

The plugin writes markdown under `{srcDir}/{output}/`, merges sidebar and nav entries, and stores structured manifests for tooling.

See the [package README](https://github.com/kamod-ch/preactpress/tree/main/packages/plugin-typedoc) for the full option list and architecture.
