---
title: OpenAPI plugin
description: Generate REST API reference pages from OpenAPI 3.x specifications
---

# OpenAPI plugin

The official `@preactpress/plugin-openapi` package turns an OpenAPI 3.x specification into searchable documentation pages inside PreactPress.

```ts
import { defineConfig } from "@kamod-ch/preactpress/config";
import { openapiPlugin } from "@preactpress/plugin-openapi";

export default defineConfig({
  plugins: [
    openapiPlugin({
      input: "./openapi.yaml",
      route: "/api",
    }),
  ],
});
```

## What gets generated

- API overview with servers, tags, and endpoint index
- Tag pages grouping related endpoints
- Endpoint pages with authentication, parameters, request/response schemas, error responses, and cURL / JavaScript / TypeScript examples
- Schema pages for `#/components/schemas` definitions

## Input sources

| Source          | Configuration                                  |
| --------------- | ---------------------------------------------- |
| Local YAML/JSON | `input: "./openapi.yaml"`                      |
| Remote URL      | `input: { url: "https://…", headers?: { … } }` |

Remote fetching is opt-in — pass a URL object explicitly. Local paths resolve from the project root.

## Shared components

The plugin reuses sidebar merge utilities from `@preactpress/plugin-typedoc` so TypeScript and REST API references share the same navigation patterns, search indexing, code-block copy buttons, and default-theme table styling.

## Interactive explorer

The MVP documents endpoints only. A future API explorer can plug in via `OpenApiExplorerAdapter` without changing the manifest schema.

## Package

See [`packages/plugin-openapi`](https://github.com/kamod-ch/preactpress/tree/main/packages/plugin-openapi) for options, architecture notes, and tests.
