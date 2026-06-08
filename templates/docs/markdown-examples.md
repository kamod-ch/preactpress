---
title: Markdown examples
description: Rendered examples of PreactPress Markdown extensions.
tags:
  - markdown
---

## Code highlighting

```ts{2}
export function greet(name: string) {
  return `Hello, ${name}!`
}
```

Inline code such as `themeConfig.outline` uses the theme's code tokens.

## Snippet import

<<< @/snippets/greet.ts{2}

## Containers and alerts

::: tip
Custom containers support `tip`, `warning`, `danger`, `info`, and `details`.
:::

> [!NOTE]
> GFM alert syntax is supported too.

## Table

| Source | Result |
| --- | --- |
| `# Title` | Heading |
| YAML frontmatter | Page metadata |

## Stable heading {#stable-heading}

Use `{#id}` to control a heading fragment.

## Inline table of contents

[[toc]]

### Nested section

The generated table of contents includes level-three headings.

## Code group

::: code-group

```bash [pnpm]
pnpm add -D preactpress
```

```bash [npm]
npm install --save-dev preactpress
```

:::

## Included content

<!--@include: @/partials/shared-note.md-->

## Emoji and math

This starter enables both options: :rocket:

Inline math: $E = mc^2$
