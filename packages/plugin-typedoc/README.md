# @preactpress/plugin-typedoc

Official TypeDoc integration for [PreactPress](https://github.com/kamod-ch/preactpress). Generates searchable API reference pages from TypeScript entry points.

## Installation

```bash
pnpm add -D @preactpress/plugin-typedoc
```

Peer dependency: `@kamod-ch/preactpress` >= 2.2.0

## Usage

```ts
import { defineConfig } from "@kamod-ch/preactpress/config";
import { typedocPlugin } from "@preactpress/plugin-typedoc";

export default defineConfig({
  plugins: [
    typedocPlugin({
      entries: ["src/index.ts"],
      output: "reference/api",
      includePrivate: false,
      sourceLinks: true,
      gitRemote: "https://github.com/org/repo",
      gitBranch: "main",
      groupBy: "module",
    }),
  ],
});
```

## Architecture

The plugin separates three layers so other API sources can reuse the same UI later:

| Layer | Responsibility |
| ----- | -------------- |
| **Extraction** | TypeDoc conversion, caching, validation |
| **Data model** | `ApiManifest` with structured symbols (`@preactpress/plugin-typedoc/types`) |
| **Presentation** | Markdown pages, sidebar, cross-links |

Generated markdown is written under `{srcDir}/{output}/` before PreactPress scans content, so pages appear in navigation and local search automatically.

Structured manifests are also written to:

- `{srcDir}/{output}/.api-manifest.json`
- `.preactpress/typedoc-manifest.json`

## Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `entries` | `string[]` | required | TypeScript entry points (supports monorepo paths) |
| `output` | `string` | `reference/api` | Output directory relative to `srcDir` |
| `tsconfig` | `string` | — | Path to tsconfig |
| `includePrivate` | `boolean` | `false` | Include private symbols |
| `sourceLinks` | `boolean` | `false` | Link symbols to git source URLs |
| `gitRemote` | `string` | — | Repository URL for source links |
| `gitBranch` | `string` | `main` | Branch name for source links |
| `groupBy` | `"module" \| "kind"` | `module` | Sidebar grouping strategy |
| `cache` | `boolean` | `true` | Incremental cache in `{cacheDir}/typedoc` |

## Documented symbols

Modules, functions, classes, interfaces, type aliases, enums, properties, methods, parameters, return types, generics, signatures, JSDoc descriptions, examples, `@deprecated`, `@since`, and source links.

## Testing

```bash
pnpm --filter @preactpress/plugin-typedoc test
```

Tests use `fixtures/sample-lib` as an example package with enums, classes, generics, and deprecated APIs.

## License

MIT
