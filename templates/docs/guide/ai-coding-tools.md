---
title: AI-ready documentation
description: Export llms.txt, consolidated markdown, and context.json for AI coding tools.
---

# AI-ready documentation

PreactPress can emit static artifacts optimized for LLM retrieval and AI coding assistants such as Cursor, Claude Code, and Codex.

Enable exports in `.preactpress/config.ts`:

```ts
import { defineConfig } from "@kamod-ch/preactpress/config";

export default defineConfig({
  site: {
    title: "My docs",
    description: "Product documentation",
    url: "https://docs.example.com",
  },
  ai: {
    llmsTxt: true,
    llmsFullTxt: true,
    copyMarkdown: true,
    contextIndex: true,
  },
});
```

When `ai` is set, PreactPress registers the AI export plugin automatically. You do not need to add `aiExportsPlugin()` manually unless you want explicit control over plugin ordering.

## Build outputs

| Output        | Path                | Purpose                                                             |
| ------------- | ------------------- | ------------------------------------------------------------------- |
| LLM index     | `/llms.txt`         | Project summary, documentation areas, entry points, markdown links  |
| Full docs     | `/llms-full.txt`    | Consolidated markdown for all pages (split into bundles when large) |
| Context index | `/api/context.json` | Structured page, symbol, and locale metadata for tooling            |
| Page markdown | `/{route}.md`       | Plain markdown per page, linked from `llms.txt`                     |

All exports require `site.url` so canonical links resolve correctly.

## llms.txt

`llms.txt` includes:

- Project name and description
- Documentation areas from the sidebar
- Important entry points from the top navigation
- Links to HTML pages and matching markdown representations
- API reference routes (paths under `/api/` or pages tagged by TypeDoc/OpenAPI plugins)
- Version and locale lists when configured
- Links to `llms-full.txt` and `context.json`

## llms-full.txt

The consolidated export contains clean markdown only — no navigation chrome or rendered HTML. Each page block includes:

- Source URL
- Title and description
- Locale and version (when applicable)
- Headings and code examples from the processed markdown source

Pages marked `draft: true`, tag index pages, `/404`, and routes matched by `ai.exclude` are omitted.

### Large sites

When the combined output exceeds `ai.maxBundleBytes` (default `1_500_000`), PreactPress splits the export into numbered bundles such as `llms-full-1.txt` and `llms-full-2.txt`. A warning is logged during build, and `llms.txt` links to each bundle.

## context.json

The context index uses this shape:

```json
{
  "version": 1,
  "project": {},
  "pages": [],
  "symbols": [],
  "components": [],
  "versions": [],
  "locales": []
}
```

`pages` lists every exported route with titles, descriptions, canonical URLs, optional markdown URLs, and heading outlines. Plugins can attach `symbols` or `components` arrays to page frontmatter; those entries are merged into the top-level lists.

## Copy page as Markdown

When `ai.copyMarkdown` is enabled, the default theme shows a **Copy page as Markdown** button in the page footer. The button copies the processed markdown body (after includes and snippets), not the rendered HTML.

Custom themes can reuse `pageMarkdownForCopy()` from `@kamod-ch/preactpress/shared` or read `page.markdown` on markdown pages loaded from content chunks.

## Configuration reference

| Option           | Default when `ai` is set | Description                                                   |
| ---------------- | ------------------------ | ------------------------------------------------------------- |
| `llmsTxt`        | `true`                   | Write `/llms.txt`                                             |
| `llmsFullTxt`    | `true`                   | Write consolidated markdown                                   |
| `copyMarkdown`   | `true`                   | Enable the copy button and include markdown in content chunks |
| `contextIndex`   | `true`                   | Write `/api/context.json`                                     |
| `pageMarkdown`   | `true`                   | Write per-page `*.md` files                                   |
| `exclude`        | `["/404", "/tags/**"]`   | Route globs omitted from exports                              |
| `maxBundleBytes` | `1500000`                | Split threshold for `llms-full`                               |
| `chunks`         | `false`                  | Reserved for JSONL chunk exports                              |

Set `ai: false` to disable all AI exports.

## Using exports with AI tools

- Point agents at `https://your-site/llms.txt` as the canonical documentation entry.
- Fetch `llms-full.txt` (or numbered bundles) for offline or RAG ingestion.
- Load `api/context.json` when you need structured routing metadata without parsing markdown.
- Paste a single page quickly with **Copy page as Markdown** during interactive sessions.

## Related

- [Configuration](/guide/configuration) — full `ai` option reference
- [Plugins](/guide/plugins) — `aiExportsPlugin()` hook details
- [Deploy](/guide/deploy) — cache `llms.txt` and `api/context.json` like other JSON artifacts
