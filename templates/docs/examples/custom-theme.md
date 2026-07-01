---
title: Custom theme example
description: A minimal copy-pasteable PreactPress theme with navigation, Markdown, MDX, and styling.
---

This example shows a small custom theme you can copy into your project. For a larger production-style example, scaffold the bundled magazine template:

```sh
pnpm exec preactpress init my-magazine --template magazine
```

## File structure

```txt
.preactpress/
  config.ts
  theme/
    Layout.tsx
    theme.css
index.md
about.md
```

## Configure the theme

```ts [.preactpress/config.ts]
import { defineConfig } from "@kamod-ch/preactpress/config";

export default defineConfig({
  site: {
    title: "Acme Docs",
    description: "A custom themed PreactPress site",
  },

  // Relative to .preactpress/
  theme: "./theme/Layout.tsx",

  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "About", link: "/about" },
    ],
    footer: "Built with PreactPress",
  },
});
```

## Layout component

```tsx [.preactpress/theme/Layout.tsx]
import type { FunctionalComponent } from "preact";
import {
  createMdxHeadingComponents,
  isActive,
  withBase,
  type LayoutProps,
} from "@kamod-ch/preactpress/client";
import "./theme.css";

const Layout: FunctionalComponent<LayoutProps> = ({ site, themeConfig, routePath, page }) => {
  const MdxComponent = page?.kind === "mdx" ? page.Component : undefined;
  const mdxComponents = createMdxHeadingComponents({
    headingClass: "ct-heading",
    anchorClass: "ct-heading-anchor",
    anchorLabel: "Link to this section",
  });

  return (
    <div class="ct-layout">
      <a class="ct-skip" href="#content">
        Skip to content
      </a>

      <header class="ct-header">
        <a class="ct-brand" href={withBase(site.base, "/")}>
          {site.title}
        </a>
        <nav class="ct-nav" aria-label="Main navigation">
          {(themeConfig.nav ?? []).map((item) => {
            const active = isActive(routePath, item.link);
            return (
              <a
                key={item.link}
                href={withBase(site.base, item.link)}
                class={active ? "active" : ""}
                aria-current={active ? "page" : undefined}
              >
                {item.text}
              </a>
            );
          })}
        </nav>
      </header>

      <main id="content" class="ct-main" tabIndex={-1}>
        <article class="ct-article">
          <h1>{page?.title ?? site.title}</h1>
          {page?.description ? <p class="ct-lead">{page.description}</p> : null}

          {MdxComponent ? (
            <div class="ct-content">
              <MdxComponent components={mdxComponents} />
            </div>
          ) : (
            <div
              class="ct-content"
              dangerouslySetInnerHTML={{ __html: page?.kind === "markdown" ? page.html : "" }}
            />
          )}
        </article>
      </main>

      {themeConfig.footer ? <footer class="ct-footer">{themeConfig.footer}</footer> : null}
    </div>
  );
};

export default Layout;
```

## Styling

```css [.preactpress/theme/theme.css]
:root {
  color-scheme: light dark;
  --ct-bg: #f7f3ea;
  --ct-panel: #fffaf0;
  --ct-text: #1f2937;
  --ct-muted: #6b7280;
  --ct-border: #eadfca;
  --ct-accent: #b45309;
}

@media (prefers-color-scheme: dark) {
  :root {
    --ct-bg: #15110b;
    --ct-panel: #1f1a12;
    --ct-text: #f8ecd5;
    --ct-muted: #c5bba9;
    --ct-border: #3b3022;
    --ct-accent: #fbbf24;
  }
}

body {
  margin: 0;
  background: var(--ct-bg);
  color: var(--ct-text);
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
}

.ct-skip {
  position: absolute;
  left: 1rem;
  top: -4rem;
  z-index: 10;
  background: var(--ct-accent);
  color: #111827;
  padding: 0.5rem 0.75rem;
  border-radius: 999px;
}

.ct-skip:focus {
  top: 1rem;
}

.ct-header {
  max-width: 1040px;
  margin: 0 auto;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.ct-brand {
  color: inherit;
  font-weight: 800;
  text-decoration: none;
  letter-spacing: -0.04em;
}

.ct-nav {
  display: flex;
  gap: 0.35rem;
}

.ct-nav a {
  color: var(--ct-muted);
  text-decoration: none;
  padding: 0.45rem 0.7rem;
  border-radius: 999px;
}

.ct-nav a:hover,
.ct-nav a.active {
  background: color-mix(in srgb, var(--ct-accent) 16%, transparent);
  color: var(--ct-text);
}

.ct-main {
  max-width: 1040px;
  margin: 0 auto;
  padding: 1.25rem;
}

.ct-article {
  background: var(--ct-panel);
  border: 1px solid var(--ct-border);
  border-radius: 28px;
  padding: clamp(1.5rem, 4vw, 3rem);
  box-shadow: 0 24px 70px rgb(0 0 0 / 0.08);
}

.ct-article h1 {
  margin: 0;
  font-size: clamp(2.4rem, 8vw, 5rem);
  letter-spacing: -0.07em;
  line-height: 0.95;
}

.ct-lead {
  color: var(--ct-muted);
  font-size: 1.2rem;
}

.ct-content {
  line-height: 1.75;
}

.ct-content a {
  color: var(--ct-accent);
}

.ct-content pre {
  overflow: auto;
  padding: 1rem;
  border-radius: 16px;
  background: #111827;
  color: #f9fafb;
}

.ct-heading-anchor {
  opacity: 0;
  margin-left: 0.4rem;
  color: var(--ct-muted);
  text-decoration: none;
}

.ct-heading:hover .ct-heading-anchor,
.ct-heading-anchor:focus-visible {
  opacity: 1;
}

.ct-footer {
  max-width: 1040px;
  margin: 0 auto;
  padding: 2rem 1.25rem;
  color: var(--ct-muted);
}
```

## Notes

A custom theme receives the same `LayoutProps` as the default theme. Your layout is responsible for rendering Markdown versus MDX pages, navigation, responsive behavior, search UI, focus management, and any theme-specific styling.
