---
title: Plugins
description: Extend PreactPress with typed plugins and deterministic hook ordering
---

# Plugins

PreactPress ships a small plugin runtime for config, routing, markdown, page data, head tags, and build lifecycle hooks.

Browse the [plugin & theme gallery](/guide/ecosystem) for install commands, compatible versions, and community submissions.

```ts
import { defineConfig } from "@kamod-ch/preactpress/config";
import {
  aiExportsPlugin,
  examplePlugin,
  llmsTxtPlugin,
  redirectsPlugin,
} from "@kamod-ch/preactpress/plugins";
import { mermaidPlugin } from "@preactpress/plugin-mermaid";
import { typedocPlugin } from "@preactpress/plugin-typedoc";
import { openapiPlugin } from "@preactpress/plugin-openapi";

export default defineConfig({
  site: {
    title: "My docs",
    description: "Documentation",
    url: "https://example.com",
  },
  ai: {
    llmsTxt: true,
    llmsFullTxt: true,
    copyMarkdown: true,
    contextIndex: true,
  },
  plugins: [
    redirectsPlugin(),
    mermaidPlugin(),
    typedocPlugin({ entries: ["src/index.ts"], output: "reference/api" }),
    aiExportsPlugin(),
    examplePlugin(),
  ],
});
```

## Hook order

Plugins run in a deterministic order:

1. `enforce: "pre"`
2. default plugins (stable name order)
3. `enforce: "post"`

Legacy config hooks (`transformHead`, `transformPageData`, `buildEnd`) are registered automatically as a post plugin named `preactpress:config-hooks`.

## Plugin API

```ts
export interface PreactPressPlugin {
  name: string;
  enforce?: "pre" | "post";
  config?(config: UserConfig): UserConfig | void | Promise<UserConfig | void>;
  configResolved?(config: ResolvedConfig): void | Promise<void>;
  buildStart?(context: PluginContext): void | Promise<void>;
  extendRoutes?(routes: RouteDefinition[], context: PluginContext): RouteDefinition[] | void;
  transformMarkdown?(source: string, context: MarkdownTransformContext): string | void;
  transformFence?(
    lang: string,
    code: string,
    meta: string,
    context: FenceTransformContext,
  ): string | void;
  client?: string;
  transformPageData?(page: PageData, context: PluginContext & { route: string }): PageData | void;
  extendHead?(page: PageData, context: PluginContext & { route: string }): HeadEntry[] | void;
  buildEnd?(result: BuildResult, context: PluginContext): void | Promise<void>;
}
```

Import the types from `@kamod-ch/preactpress/config` or `@kamod-ch/preactpress/plugin-testkit`.

## PluginContext

Each hook receives a frozen context object:

- `config` — resolved site configuration
- `root` — project root
- `outDir` — build output directory
- `logger` — Vite logger
- `command` — `serve` or `build`
- `mode` — Vite mode

Treat hook inputs as read-only unless the hook returns a replacement value.

## Built-in plugins

| Plugin                                    | Purpose                                                                                                          |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `redirectsPlugin()`                       | Validates redirect rules during `buildStart`                                                                     |
| `@preactpress/plugin-mermaid`             | Renders Mermaid diagram fences (official reference plugin)                                                       |
| `@preactpress/plugin-typedoc`             | Generates TypeScript API reference pages from TypeDoc                                                            |
| `@preactpress/plugin-component-reference` | Documents Preact component props with static extraction                                                          |
| `aiExportsPlugin()`                       | Writes `llms.txt`, `llms-full.txt`, page markdown, and `api/context.json` when `ai` is enabled (auto-registered) |
| `llmsTxtPlugin()`                         | Alias for `aiExportsPlugin()`                                                                                    |
| `examplePlugin()`                         | Minimal reference plugin for authors and tests                                                                   |

## Authoring plugins

Return new objects instead of mutating shared plugin state:

```ts
import type { PreactPressPlugin } from "@kamod-ch/preactpress/config";

export function titleSuffixPlugin(suffix: string): PreactPressPlugin {
  return {
    name: "title-suffix",
    transformPageData(page) {
      if (!page.title) return page;
      return { ...page, title: `${page.title}${suffix}` };
    },
  };
}
```

Duplicate plugin names are rejected during config validation.

Hook failures throw `PluginError` with the plugin name and hook id, for example:

```text
preactpress plugin "title-suffix": transformPageData failed: ...
```

## Testing plugins

Use `@kamod-ch/preactpress/plugin-testkit`:

```ts
import { runTransformPageData } from "@kamod-ch/preactpress/plugin-testkit";
import { examplePlugin } from "@kamod-ch/preactpress/plugins";

const page = await runTransformPageData(
  [examplePlugin()],
  {
    kind: "markdown",
    html: '<p data-example-plugin="true">Hello</p>',
    meta: {},
    headings: [],
  },
  "/example",
);
```

## Legacy config hooks

These config fields still work and are merged into the plugin pipeline:

- `transformHead` → `extendHead`
- `transformPageData`
- `buildEnd`
- `transformHtml` (config-only, not part of the plugin interface)

Prefer plugins for new extensions so ordering stays explicit and testable.
