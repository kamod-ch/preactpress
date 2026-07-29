# @preactpress/plugin-openapi

Official OpenAPI 3.x integration for [PreactPress](https://github.com/kamod-ch/preactpress). Generates searchable REST API reference pages from local JSON/YAML specs or explicitly configured remote URLs.

## Installation

```bash
pnpm add -D @preactpress/plugin-openapi
```

Peer dependency: `@kamod-ch/preactpress` >= 2.2.0

## Usage

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

Remote specs must be configured explicitly:

```ts
openapiPlugin({
  input: {
    url: "https://example.com/openapi.yaml",
    headers: { Authorization: "Bearer TOKEN" },
  },
  route: "/api",
});
```

## Generated documentation

| Page               | Contents                                                                                                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **API overview**   | Title, version, servers, tags, endpoint index                                                                                                                                  |
| **Tag pages**      | Grouped endpoints per OpenAPI tag                                                                                                                                              |
| **Endpoint pages** | HTTP method, path, description, authentication, path/query/header parameters, request body, responses, error responses, example values, cURL / JavaScript / TypeScript samples |
| **Schema pages**   | Component schemas with property tables and JSON examples                                                                                                                       |
| **Schema index**   | Browse all `#/components/schemas` entries                                                                                                                                      |

Features included in the MVP:

- OpenAPI **3.x** (JSON and YAML)
- Local files and **explicit remote URLs**
- **`$ref` resolution** via `@apidevtools/swagger-parser`
- **Stable slugs** and deep-linkable headings
- Automatic **navigation** and **local search** (via generated markdown)
- **Copy buttons** on fenced code blocks (PreactPress default theme)
- **Dark mode** and responsive markdown tables (default theme)
- Shared sidebar utilities with `@preactpress/plugin-typedoc`

Interactive API execution is **not** included in the MVP. The plugin exports an `OpenApiExplorerAdapter` interface for a future explorer UI.

## Architecture

| Layer            | Responsibility                                                |
| ---------------- | ------------------------------------------------------------- |
| **Load**         | Local files, explicit remote fetch                            |
| **Parse**        | JSON/YAML parsing, OpenAPI 3.x validation, reference bundling |
| **Data model**   | `OpenApiManifest` (`@preactpress/plugin-openapi/types`)       |
| **Presentation** | Markdown pages, sidebar, code examples                        |

Generated markdown is written under `{srcDir}/{output}/` before PreactPress scans content.

Structured manifests are also written to:

- `{srcDir}/{output}/.openapi-manifest.json`
- `.preactpress/openapi-manifest.json`

## Options

| Option     | Type                          | Default                   | Description                               |
| ---------- | ----------------------------- | ------------------------- | ----------------------------------------- |
| `input`    | `string \| { url, headers? }` | required                  | Local spec path or explicit remote URL    |
| `route`    | `string`                      | `/api`                    | Route prefix for generated pages          |
| `output`   | `string`                      | route without leading `/` | Output directory relative to `srcDir`     |
| `cache`    | `boolean`                     | `true`                    | Incremental cache in `{cacheDir}/openapi` |
| `explorer` | `OpenApiExplorerAdapter`      | disabled                  | Reserved hook for a future API explorer   |

## Future API explorer

```ts
import { disabledExplorerAdapter, openapiPlugin } from "@preactpress/plugin-openapi";

export default defineConfig({
  plugins: [
    openapiPlugin({
      input: "./openapi.yaml",
      route: "/api",
      explorer: {
        ...disabledExplorerAdapter,
        enabled: false,
        resolveOperation(manifest, operationId) {
          return manifest.operations[operationId];
        },
      },
    }),
  ],
});
```

## Testing

```bash
pnpm --filter @preactpress/plugin-openapi test
```

Tests use `fixtures/kamod-tasks/openapi.yaml` — a realistic spec with bearer auth, pagination, shared parameters, component schemas, and error responses.

## License

MIT
