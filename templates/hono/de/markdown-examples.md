---
title: Markdown-Beispiele
description: Häufige Authoring-Snippets
tags:
  - markdown
---

## Code

```ts{2}
export function greet(name: string) {
  return `Hallo, ${name}!`
}
```

Einzelne Zeilen kannst du per Fence-Meta (`{2}`) oder Inline-Notation markieren:

```ts
export function greet(name: string) {
  return `Hallo, ${name}!`; // [!code highlight]
}
```

Inline-Code wie `themeConfig.outline` verwendet dieselben Theme-Tokens wie Codeblöcke.

## Snippet-Import

Wiederverwende Quelldateien statt Code zu duplizieren:

<<< @/snippets/greet.ts{2}

Das `@/`-Präfix wird relativ zum Content-Root (`srcDir`) aufgelöst.

## Links

[Start](/de) · [Externer Link](https://preactjs.com)

## Tabellen

| Syntax            | Ergebnis        |
| ----------------- | --------------- |
| `# Titel`         | Überschrift     |
| `---` Frontmatter | Seitenmetadaten |

## Zitate

> Nutze Blockquotes für Callouts, Hinweise oder kurze Kontextinformationen.

## Container

::: tip
`::: tip`, `::: warning`, `::: danger`, `::: info` und `::: details` funktionieren wie bei VitePress.
:::

::: warning Eigener Titel
Optional kannst du nach dem Typ einen eigenen Titel angeben.
:::

## GFM-Alerts

GitHub-Alert-Syntax wird wie die Custom Container gerendert:

> [!NOTE]
> Nützliche Informationen für Leserinnen und Leser.

> [!TIP]
> Optionale Tipps für bessere Ergebnisse.

> [!WARNING]
> Kritische Inhalte, die sofortige Aufmerksamkeit brauchen.

## Heading-IDs

## Eigene Anker {#eigener-anker}

Mit `{#deine-id}` steuerst du die Fragment-URL.

## Inline-Inhaltsverzeichnis

[[toc]]

### Erster Abschnitt

Inhalt des ersten Abschnitts.

### Zweiter Abschnitt

Inhalt des zweiten Abschnitts.

## Code-Gruppen

::: code-group

```bash [npm]
npm install
```

```bash [pnpm]
pnpm install
```

:::

## Eigene Heading-IDs

## Stabile Links {#stabile-id}

Hänge `{#id}` an eine Überschrift, um den Anker zu steuern.

## Emoji

`:tada:` und `:rocket:` funktionieren standardmäßig.

## Inline-Inhaltsverzeichnis

[[toc]]

## Zweiter Abschnitt

Inhalt unter dem inline TOC.

### Unterabschnitt

Verschachtelte Überschrift für die Gliederung.

## Code-Gruppen

::: code-group

```js [config.js]
export default { lang: "js" };
```

```ts [config.ts]
export default { lang: "ts" };
```

:::

## Markdown-Inclusion

<!--@include: @/parts/include-body.md{5,6}-->
