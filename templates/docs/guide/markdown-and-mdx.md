---
title: Markdown and MDX
description: Author static Markdown pages and interactive MDX pages.
---

Use `.md` for content that does not need browser-side components. Use `.mdx` when a page imports and renders Preact components.

## Markdown

Markdown pages support frontmatter, heading anchors, syntax highlighting, tables, containers, GFM alerts, code groups, file includes, snippet imports, emoji, optional MathJax, and `[[toc]]`.

```md
---
title: API guide
description: Integrate the API
---

## Authentication

::: warning
Never commit production credentials.
:::
```

Raw HTML is disabled by default. Enable `markdown.html` only when every author is trusted.

## MDX

```mdx
---
title: Counter demo
---

import Counter from "./components/Counter.tsx";

## Demo

<Counter initial={3} />
```

MDX pages hydrate in the browser. Regular Markdown payloads are loaded as HTML, which keeps larger documentation sites from bundling every page body into JavaScript.

## Reusing content

Import a source snippet relative to `srcDir`:

```md
<<< @/snippets/example.ts{2,4}
```

Include a Markdown fragment:

```md
<!--@include: @/partials/shared-note.md-->
```

Exclude fragments from routing with `srcExclude`.

See [Markdown examples](/markdown-examples) for rendered examples.
