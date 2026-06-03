---
title: Die ersten 5 Minuten
description: Seitentitel ändern, eine Seite hinzufügen und die Navigation aktualisieren
---

# Die ersten 5 Minuten

Dieses praktische Tutorial folgt der Setup-Übersicht in [Getting Started](/de/guide/getting-started). Folge den Schritten in **deinem** Projekt — diese Website zeigt das Ergebnis.

## 1. Seitentitel ändern

Bearbeite `.preactpress/config.ts`:

```ts
export default {
  site: {
    title: 'Meine Doku',
    description: 'Kurze Beschreibung für Suche und Social Previews'
  }
}
```

Speichere die Datei. Der Dev-Server übernimmt Config-Änderungen beim nächsten Request.

## 2. Eine Seite hinzufügen

Erstelle `about.md`:

```md
---
title: Über uns
description: Über diese Website
---

# Über uns

Hier steht dein Inhalt.
```

PreactPress stellt die Seite unter `/about` bereit. Jede `.md`- oder `.mdx`-Datei unter `srcDir` (standardmäßig: Projektroot) wird automatisch zu einer URL.

Beispiel: `news/2025/intro.md` → `/news/2025/intro`.

Dieser Starter enthält bereits [Über uns](/de/about), damit du die fertige Seite sehen kannst.

## 3. Zur Navigation hinzufügen

In `.preactpress/config.ts`:

```ts
export default {
  site: { title: 'Meine Doku' },
  themeConfig: {
    nav: [
      { text: 'Start', link: '/' },
      { text: 'Über uns', link: '/about' }
    ],
    sidebar: [
      {
        text: 'Anleitung',
        items: [
          { text: 'Start', link: '/' },
          { text: 'Über uns', link: '/about' }
        ]
      }
    ]
  }
}
```

Speichern — der Dev-Server lädt die Änderung automatisch.

## Nächste Schritte

| Befehl | Zweck |
| --- | --- |
| `pnpm run dev` | Dev-Server mit SSR und Hot Reload |
| `pnpm run check` | Config, Links und Routen prüfen |
| `pnpm run build` | Statischer Produktionsbuild → `dist/` |
| `pnpm run preview` | Lokale Vorschau des Builds |

Setze vor dem Deployment `site.url` in der Config, damit Canonical URLs, Open Graph Tags und `sitemap.xml` erzeugt werden. Lies danach [Routing](/de/guide/routing), um dateibasierte Routen zu verstehen, und [Deploy](/de/guide/deploy) für die Produktionsschritte.
