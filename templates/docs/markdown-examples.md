---
title: Markdown examples
description: Common authoring snippets and rendered PreactPress Markdown extensions.
tags:
  - markdown
---

## Code

```ts{2}
export function greet(name: string) {
  return `Hello, ${name}!`
}
```

Highlight a single line with fence meta (`{2}`) or inline notation:

```ts
export function greet(name: string) {
  return `Hello, ${name}!`; // [!code highlight]
}
```

Inline code like `themeConfig.outline` uses the same theme tokens as code blocks.

## Snippet import

Reuse source files instead of duplicating code:

<<< @/snippets/greet.ts{2}

The `@/` prefix resolves from the site content root (`srcDir`).

## Links

[Home](/) · [External link](https://preactjs.com)

## Tables

| Syntax            | Result        |
| ----------------- | ------------- |
| `# Title`         | Heading       |
| `---` frontmatter | Page metadata |

## Containers

:::: tip
`::: tip`, `::: warning`, `::: danger`, `::: info`, and `::: details` work like VitePress custom containers.
::::

:::: warning Optional title
You can pass a custom title after the container type.
::::

:::: details Learn more
Details blocks render as native `<details>` elements.
::::

## GFM alerts

GitHub-flavored alert syntax renders with the same styling as custom containers:

> [!NOTE]
> Useful information that readers should know.

> [!TIP]
> Optional advice for doing things more easily.

> [!WARNING]
> Critical content that needs immediate attention.

## Custom heading IDs

## Stable links {#stable-id}

Append `{#id}` to any heading to control its anchor.

## Emoji

PreactPress supports `:tada:` and `:rocket:` shortcodes out of the box.

## Inline table of contents

[[toc]]

### First section

Content below the inline TOC.

### Second section

Nested heading for the outline.

## Code groups

:::: code-group

```bash [pnpm]
pnpm add -D @kamod-ch/preactpress
```

```bash [npm]
npm install --save-dev @kamod-ch/preactpress
```

::::

## Markdown inclusion

Use includes for shared fragments or selected line ranges:

<!--@include: @/parts/include-body.md{5,6}-->

## Markdown includes

Reuse shared fragments with HTML comments:

<!--@include: @/partials/shared-note.md-->

## Emoji and math

This starter enables both options: :rocket:

Inline math: $E = mc^2$
