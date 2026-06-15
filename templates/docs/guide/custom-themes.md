---
title: Custom themes
description: Replace the default shell with a Preact layout.
---

Set `theme` to a TSX module relative to `.preactpress`:

```ts
export default {
  theme: "./theme/Layout.tsx",
};
```

The module default-exports a Preact component receiving `LayoutProps` from `@kamod-ch/preactpress/client`.

```tsx
import type { FunctionalComponent } from "preact";
import type { LayoutProps } from "@kamod-ch/preactpress/client";
import "./theme.css";

const Layout: FunctionalComponent<LayoutProps> = ({ site, page }) => (
  <div>
    <header>{site.title}</header>
    <main id="content">
      {page?.kind === "markdown" ? (
        <article dangerouslySetInnerHTML={{ __html: page.html }} />
      ) : page?.kind === "mdx" ? (
        <page.Component />
      ) : null}
    </main>
  </div>
);

export default Layout;
```

Theme authors are responsible for navigation, responsive behavior, focus management, search UI, and rendering Markdown versus MDX pages. Helpers for routes, page head data, tags, slugs, and theme state are exported from `@kamod-ch/preactpress/client` and `@kamod-ch/preactpress/shared`.

The `magazine` and `hono` init templates are complete custom-theme examples.
