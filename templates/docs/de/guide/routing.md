---
title: Routing
description: Verstehe, wie PreactPress Dateien auf URLs abbildet
---

# Routing

PreactPress nutzt dateibasiertes Routing. Jede `.md`- und `.mdx`-Datei unter `srcDir` wird zu einer Route, und Produktionsbuilds schreiben jede Route als statisches HTML.

## Dateibasiertes Routing

Bei dieser Struktur:

```text
.
├── index.md
├── about.md
├── guide/
│   ├── index.md
│   └── getting-started.md
└── interactive.mdx
```

erzeugt PreactPress diese Routen:

```text
index.md                  -> /
about.md                  -> /about
guide/index.md            -> /guide
guide/getting-started.md  -> /guide/getting-started
interactive.mdx           -> /interactive
```

Beim Produktionsbuild werden Routen als Verzeichnis-Indizes geschrieben:

```text
/                      -> dist/index.html
/about                 -> dist/about/index.html
/guide/getting-started -> dist/guide/getting-started/index.html
```

So entstehen Clean URLs ohne eigene `cleanUrls`-Option.

## Projektroot und Quellverzeichnis

Der Projektroot ist der Ort, an dem PreactPress `.preactpress/config.ts` sucht.

Standardmäßig liegen die Quelldateien ebenfalls im Projektroot:

```text
.
├── .preactpress/
│   └── config.ts
├── index.md
└── guide/
    └── getting-started.md
```

Mit `srcDir` kannst du Inhalte in ein verschachteltes Quellverzeichnis legen:

```ts
export default {
  srcDir: 'docs'
}
```

Dann sieht die Struktur so aus:

```text
.
├── .preactpress/
│   └── config.ts
└── docs/
    ├── index.md
    └── guide/
        └── getting-started.md
```

Die resultierenden Routen bleiben gleich:

```text
docs/index.md                  -> /
docs/guide/getting-started.md  -> /guide/getting-started
```

## Zwischen Seiten verlinken

Du kannst absolute oder relative Links verwenden. Empfohlen ist, Dateiendungen wegzulassen:

```md
[Getting Started](/de/guide/getting-started)
[Routing](./routing)
[Start](../)
```

Vermeide direkte Links auf generiertes HTML oder Markdown-Quelldateien:

```md
<!-- Vermeiden -->
[Getting Started](/de/guide/getting-started.md)
[Getting Started](/de/guide/getting-started.html)
```

`preactpress check` validiert lokale Markdown-Links mit `.md`-, `.mdx`- oder `.html`-Endung und meldet fehlende Seiten.

## Locale-Routen

PreactPress unterstützt Locale-Ordner im VitePress-Stil. Die Standardsprache liegt im Root, Übersetzungen liegen in Locale-Ordnern:

```text
index.md                       -> /
guide/getting-started.md       -> /guide/getting-started
de/index.md                    -> /de
de/guide/getting-started.md    -> /de/guide/getting-started
```

Labels, Sprachcodes und lokale Navigation konfigurierst du in `.preactpress/config.ts`:

```ts
export default {
  locales: {
    root: {
      label: 'English',
      lang: 'en'
    },
    de: {
      label: 'Deutsch',
      lang: 'de',
      link: '/de/'
    }
  }
}
```

Das Standard-Theme zeigt einen Sprachumschalter, wenn mehrere Locales konfiguriert sind.

## Tag-Routen

Seiten können Tags im Frontmatter definieren:

```md
---
title: Release Notes
tags: [release, changelog]
---
```

Jeder Tag erhält eine Index-Seite:

```text
release   -> /tags/release
changelog -> /tags/changelog
```

Bei lokalisierten Inhalten werden Tag-Seiten pro Locale erzeugt:

```text
de/guide/intro.md mit Tag "Markdown" -> /de/tags/markdown
```

Wenn eine echte Markdown- oder MDX-Seite dieselbe Route wie ein generierter Tag-Index belegt, gewinnt die echte Seite.

## Base Path

Nutze `site.base`, wenn die Site unter einem Unterpfad ausgeliefert wird, zum Beispiel bei GitHub-Pages-Projektseiten:

```ts
export default {
  site: {
    base: '/my-repo/'
  }
}
```

Du kannst den Base Path auch für einen einzelnen Build überschreiben:

```bash
pnpm exec preactpress build --base /my-repo/
```

## Aktuelle Grenzen

PreactPress hält Routing bewusst klein. Im Vergleich zu VitePress enthält es aktuell nicht:

| Feature | Status |
| --- | --- |
| Route Rewrites | Nicht unterstützt |
| Dynamische Routen wie `[pkg].paths.ts` | Nicht unterstützt |
| Ein `cleanUrls`-Config-Flag | Nicht nötig; Builds schreiben bereits Verzeichnis-Indizes |

Wenn deine Site viele Seiten aus externen Daten erzeugen muss, generiere Markdown- oder MDX-Dateien vor `preactpress build`.
