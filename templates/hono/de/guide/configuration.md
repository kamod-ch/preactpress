---
title: Konfiguration
description: Site-Config, Theme-Optionen und häufige Frontmatter-Felder
---

Die Konfiguration liegt in `.preactpress/config.ts` im Site-Root.

## Site-Metadaten

```ts
export default {
  site: {
    title: "Meine Docs",
    description: "Kurzbeschreibung für SEO",
    base: "/",
    url: "https://example.com",
    titleTemplate: ":title | :siteTitle",
  },
};
```

`site.url` vor dem Go-Live setzen — für Canonical-URLs, `sitemap.xml`, Open Graph und `hreflang`.

## Inhaltsverzeichnis

| Option           | Zweck                                                        |
| ---------------- | ------------------------------------------------------------ |
| `srcDir`         | Ordner mit `.md` / `.mdx` (Standard `.`)                     |
| `srcExclude`     | Glob-Muster für Nicht-Seiten, z. B. `['**/README.md']`       |
| `lastUpdatedGit` | Git-Commit-Zeit für „Zuletzt aktualisiert“ (Fallback: mtime) |

## Theme ohne eigenen Code

`themeConfig` steuert das Standard-Layout:

- `nav` — Kopfzeilen-Links; verschachtelte Dropdowns über `items`
- `sidebar` — flaches Array **oder** Pfad-Map; Gruppen und Einträge unterstützen `collapsed` und verschachtelte `items`
- `outline`, `search`, `socialLinks`, `footer`, `lastUpdated`, `editLink`, `logo`, `labels`
- `logo` — String-URL oder `{ light, dark }` für theme-aware Bilder
- `search` — `true` oder `{ provider: 'local' }` für Sidebar-Suche; `{ provider: 'algolia', options }` für Algolia DocSearch in der Nav-Leiste
- `socialLinks` — `{ icon, link, ariaLabel? }[]` mit eingebauten Icons (`github`, `discord`, `x`, …) oder eigenem `{ svg }`

Locale-Overrides unter `locales.<key>.themeConfig`.

## Globale Head-Tags

```ts
head: [["meta", { name: "theme-color", content: "#0f766e" }]];
```

## Frontmatter pro Seite

| Feld                    | Zweck                                                            |
| ----------------------- | ---------------------------------------------------------------- |
| `title` / `description` | Seitentitel und SEO-Text                                         |
| `titleTemplate`         | Site-Template überschreiben; `false` = nur Seitentitel           |
| `head`                  | Zusätzliche `<meta>` / `<link>` / `<script>` nur für diese Seite |
| `draft: true`           | Aus Routen, Suche und Sitemap ausgeschlossen                     |

::: warning
`markdown.html` nur für vertrauenswürdige Inhalte aktivieren — erlaubt rohes HTML in Markdown.
:::
