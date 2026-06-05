---
title: Seiten erstellen
description: Neue Markdown- und MDX-Seiten anlegen, URLs verstehen und in die Navigation einbinden
---

# Seiten erstellen

In PreactPress entstehen Seiten aus Dateien — es gibt keinen separaten Seiten-Editor oder CMS. Jede `.md`- oder `.mdx`-Datei unter dem Quellverzeichnis (`srcDir`, standardmäßig das Projektroot) wird automatisch zu einer öffentlichen URL.

## Kurzüberblick

1. Eine neue Datei anlegen (z. B. `kontakt.md` oder `guide/neue-seite.md`).
2. Optional Frontmatter mit `title`, `description` und `layout` ergänzen.
3. Inhalt in Markdown oder MDX schreiben.
4. Dev-Server lädt die Seite automatisch nach — kein Neustart nötig.
5. Optional Eintrag in `nav` und `sidebar` in `.preactpress/config.ts` setzen.

## Schritt für Schritt: eine einfache Seite

Lege im Projektroot (oder unter `srcDir`) eine Markdown-Datei an, z. B. `kontakt.md`:

```md
---
title: Kontakt
description: So erreichst du uns
layout: page
---

# Kontakt

Schreib uns an **hello@example.com**.
```

Speichern — unter `pnpm run dev` ist die Seite sofort unter **/kontakt** erreichbar.

> **Hinweis**
> Der Dateiname (ohne Endung) bestimmt den URL-Pfad. `kontakt.md` → `/kontakt`, nicht `/kontakt.md`.

## Wo die Datei liegt → welche URL

PreactPress nutzt **dateibasiertes Routing**. Der Pfad relativ zu `srcDir` wird zur Route:

| Datei | URL |
| --- | --- |
| `index.md` | `/` |
| `about.md` | `/about` |
| `guide/einfuehrung.md` | `/guide/einfuehrung` |
| `guide/index.md` | `/guide` |
| `news/2025/intro.md` | `/news/2025/intro` |
| `interactive.mdx` | `/interactive` |

Produktionsbuilds schreiben Verzeichnis-Indexe (`dist/about/index.html`), damit URLs ohne `.html` funktionieren.

Ausführliche Details: [Routing](/de/guide/routing).

## Quellverzeichnis (`srcDir`)

Standardmäßig liegen Markdown-Dateien im Projektroot neben `.preactpress/`. Du kannst Inhalte in einen Unterordner legen:

```ts
// .preactpress/config.ts
export default {
  srcDir: 'docs'
}
```

Dann gehören alle Seiten nach `docs/` — z. B. `docs/index.md` → `/`, `docs/guide/foo.md` → `/guide/foo`. Die URLs bleiben gleich; nur der Speicherort der Dateien ändert sich.

## Frontmatter (optional, aber empfohlen)

YAML am Dateianfang steuert Metadaten und Darstellung:

```md
---
title: Meine Seite
description: Kurztext für Suche, SEO und Social Previews
layout: doc
---
```

| Feld | Zweck |
| --- | --- |
| `title` | Seitentitel (Navigation, `<title>`, Suche) |
| `description` | Zusammenfassung für SEO und Suche |
| `layout: doc` | Doku-Layout mit Sidebar, Gliederung und Vor/Zurück-Links |
| `layout: page` | Inhaltsseite ohne Sidebar und ohne Doku-Gliederung |
| `layout: home` | Startseiten-Layout mit optional `hero` und `features` |
| `draft: true` | Seite wird aus Build, Sitemap und Suche ausgeschlossen |

Weitere Felder (`tags`, `sidebar: false`, `navbar: false`, …) stehen im README des npm-Pakets bzw. in der Referenz des Starters.

## MDX-Seiten mit Komponenten

Brauchst du interaktive UI, nutze `.mdx` statt `.md`:

```mdx
---
title: Demo
description: Interaktive Komponente
---

import Counter from './components/Counter.tsx'

## Zähler

<Counter initial={3} />
```

Komponenten importierst du relativ zur MDX-Datei. Überschriften `##` und `###` erscheinen in der Seitengliederung (bei `layout: doc`).

Beispiel im Starter: [Interaktives MDX](/de/interactive).

## In die Navigation einbinden

Neue Seiten erscheinen **nicht automatisch** in der Kopfzeile oder Sidebar. Trage sie in `.preactpress/config.ts` ein:

```ts
export default {
  themeConfig: {
    nav: [
      { text: 'Start', link: '/' },
      { text: 'Kontakt', link: '/kontakt' }
    ],
    sidebar: [
      {
        text: 'Anleitung',
        items: [
          { text: 'Seiten erstellen', link: '/de/guide/seiten-erstellen' },
          { text: 'Kontakt', link: '/kontakt' }
        ]
      }
    ]
  }
}
```

Bei mehrsprachigen Sites (`locales`) gehören `nav` und `sidebar` in die jeweilige Locale-Konfiguration — siehe [Getting Started](/de/guide/getting-started).

## Übersetzte Seite (Locale)

Mit konfigurierten Locales legst du Übersetzungen in Sprachordnern ab:

```text
kontakt.md          → /kontakt
de/kontakt.md       → /de/kontakt
```

Die deutsche Version ist eine **eigene Datei**, kein Alias der englischen Seite.

## Entwürfe und Prüfung

- **`draft: true`** im Frontmatter: Seite nur lokal sichtbar im Dev-Modus, nicht im Produktionsbuild.
- **`pnpm run check`**: prüft fehlende Links, unbekannte Layouts, Route-Kollisionen und warnt bei Entwürfen ohne Beschreibung.

## Typische Fehler

| Problem | Lösung |
| --- | --- |
| Seite 404 | Dateiendung `.md` / `.mdx`? Liegt die Datei unter `srcDir`? Dev-Server läuft? |
| Link in Markdown funktioniert nicht | Extension weglassen: `/guide/foo`, nicht `/guide/foo.md` |
| Doppelte URL | Zwei Dateien dürfen nicht dieselbe Route erzeugen (z. B. `foo.md` und `foo/index.md`) |
| Seite fehlt in der Navigation | `nav` / `sidebar` in der Config ergänzen |

## Nächste Schritte

| Thema | Link |
| --- | --- |
| Erste Änderungen in 5 Minuten | [Die ersten 5 Minuten](/de/guide/first-five-minutes) |
| Routing, `srcDir`, Tags | [Routing](/de/guide/routing) |
| Markdown-Syntax | [Markdown-Beispiele](/de/markdown-examples) |
| Produktion bauen | [Deploy](/de/guide/deploy) |
