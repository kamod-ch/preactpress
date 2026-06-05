---
title: Getting Started
description: PreactPress installieren und eine neue Dokumentationsseite starten
---

# Getting Started

Diese Anleitung zeigt, wie du eine PreactPress-Site erstellst, die generierten Dateien verstehst und den Dev-Server startest.

## Voraussetzungen

Du brauchst:

| Voraussetzung | Version |
| --- | --- |
| Node.js | 20 oder höher |
| Package Manager | pnpm empfohlen; npm, yarn und bun funktionieren ebenfalls |
| Editor | Jeder Editor mit Markdown- und TypeScript-Unterstützung |

## Site erstellen

Starte in einem leeren Ordner:

```bash
mkdir my-site
cd my-site
pnpm dlx preactpress init
pnpm install
pnpm run dev
```

Mit npm:

```bash
mkdir my-site
cd my-site
npx preactpress init
npm install
npm run dev
```

Öffne **http://localhost:5173**, um die Starter-Site zu sehen.

> **Hinweis**
> `preactpress init` kopiert das eingebaute Starter-Template und schreibt `preactpress` in `devDependencies`. Du musst PreactPress vor dem Initialisieren nicht separat installieren.

## Dateistruktur

Nach der Initialisierung sieht das Projekt so aus:

```text
my-site/
├── README.md
├── index.html
├── index.md
├── about.md
├── guide/
│   └── first-five-minutes.md
├── markdown-examples.md
├── interactive.mdx
├── components/
│   └── Counter.tsx
└── .preactpress/
    └── config.ts
```

Der Ordner `.preactpress` enthält die Site-Konfiguration. Markdown- und MDX-Dateien außerhalb von `.preactpress` sind Quelldateien und werden zu Routen.

## Die Config-Datei

Die Starter-Config liegt unter `.preactpress/config.ts`:

```ts
export default {
  site: {
    title: 'Meine Doku',
    description: 'Kurze Beschreibung für Suche und Social Previews'
  },
  themeConfig: {
    nav: [
      { text: 'Start', link: '/de' },
      { text: 'Anleitung', link: '/de/guide/what-is-preactpress' }
    ],
    sidebar: [
      {
        text: 'Einführung',
        items: [
          { text: 'Was ist PreactPress?', link: '/de/guide/what-is-preactpress' },
          { text: 'Getting Started', link: '/de/guide/getting-started' }
        ]
      }
    ]
  }
}
```

Nutze `site` für globale Metadaten und `themeConfig` für Optionen des Standard-Themes wie Logo (`logo: '/logo.svg'`), Navigation, Sidebar, Suche, Outline, Footer und Edit-Links.

## Quelldateien

PreactPress nutzt dateibasiertes Routing. Standardmäßig ist der Projektroot auch das Quellverzeichnis:

```text
index.md                  -> /
about.md                  -> /about
guide/getting-started.md  -> /guide/getting-started
interactive.mdx           -> /interactive
```

Mit `srcDir` kannst du das Quellverzeichnis ändern:

```ts
export default {
  srcDir: 'docs'
}
```

Mit dieser Config liest PreactPress Seiten aus `docs/`, während `.preactpress/config.ts` weiterhin zum Projektroot gehört.

## Befehle

Der Starter enthält npm-Scripts:

| Befehl | Zweck |
| --- | --- |
| `pnpm run dev` | Dev-Server mit SSR und Hot Reload starten |
| `pnpm run check` | Config, Routen und Links validieren |
| `pnpm run build` | Statischen Produktionsbuild nach `dist/` schreiben |
| `pnpm run preview` | Produktionsbuild lokal ansehen |

Du kannst die CLI auch direkt aufrufen:

```bash
pnpm exec preactpress dev
pnpm exec preactpress check
pnpm exec preactpress build
pnpm exec preactpress preview
```

## Was kommt als Nächstes?

| Seite | Warum |
| --- | --- |
| [Die ersten 5 Minuten](/de/guide/first-five-minutes) | Titel ändern, Seite anlegen und Navigation verdrahten |
| [Routing](/de/guide/routing) | Lernen, wie Markdown-Dateien zu URLs werden |
| [Deploy](/de/guide/deploy) | Das erzeugte `dist/`-Verzeichnis bauen und veröffentlichen |
