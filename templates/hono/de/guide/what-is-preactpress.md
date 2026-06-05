---
title: Was ist PreactPress?
description: Erfahre, was PreactPress ist und wann du es einsetzen kannst
---

# Was ist PreactPress?

PreactPress ist ein Static-Site-Generator für schnelle, inhaltsorientierte Websites. Du schreibst Seiten in Markdown oder MDX, konfigurierst Navigation und Theme-Optionen in `.preactpress/config.ts`, und PreactPress erzeugt statisches HTML für beliebige Static Hosts.

Es basiert auf [Vite](https://vite.dev/) und [Preact](https://preactjs.com/). Der Workflow ist von VitePress inspiriert, aber das Komponentenmodell ist Preact statt Vue.

## Einsatzbereiche

### Dokumentation

PreactPress bringt ein kleines Standard-Theme für technische Dokumentation mit. Es enthält Navigation, Sidebar-Gruppen, Outline-Links, Suche, Last-Updated-Metadaten und Markdown-Rendering.

Es passt besonders gut, wenn deine Dokumentation natürlich als Dateien wächst:

```text
index.md
guide/getting-started.md
guide/routing.md
reference/api.md
```

Jede Markdown- oder MDX-Datei wird zu einer Seite. Neue Dokumentation entsteht also durch neue Dateien und Einträge in der Sidebar.

### Blogs, Portfolios und Marketing-Seiten

PreactPress kann auch Blogs, Portfolios und kleine Marketing-Seiten erzeugen. Markdown trägt den Inhalt, MDX bringt interaktive Preact-Komponenten hinein, und eigene Themes ersetzen bei Bedarf das Standard-Doku-Layout.

Im separaten Projekt `preactpress-examples` gibt es ein Custom-Theme-Beispiel mit Magazin-Layout, Artikel-Teasern und Tag-Seiten.

## Developer Experience

PreactPress soll Content-Arbeit einfach halten:

| Feature | Nutzen |
| --- | --- |
| Vite Dev-Server | Schneller Start und Hot Updates beim Bearbeiten |
| Markdown-Frontmatter | Titel, Beschreibungen, Tags, Draft-Status und Social-Metadaten |
| MDX | Preact-Komponenten direkt in Inhaltsseiten |
| Standard-Theme | Nav, Sidebar, Outline, Suche, Footer, Sprachumschalter |
| `preactpress check` | Validierung von Config, Routen und Links vor dem Release |

Für normale Inhalte nimmst du `.md`. Wenn eine Seite Interaktivität braucht, nimmst du `.mdx` und importierst eine Preact-Komponente:

```mdx
import Counter from './components/Counter.tsx'

## Demo

<Counter initial={3} />
```

## Performance

PreactPress erzeugt beim Produktionsbuild statisches HTML für jede Route. Der erste Besuch erhält also HTML, das den Seiteninhalt bereits enthält. Das ist gut für Ladezeit und SEO.

Nach der Hydration übernimmt die Client-Navigation. Markdown-Seiten werden als kleine JSON-Payloads aus `preactpress-content/*.json` geladen, sodass große Sites nicht jeden Markdown-Body im ersten JavaScript-Bundle ausliefern müssen.

Der Produktionsbuild besteht nur aus statischen Dateien:

| Ausgabe | Zweck |
| --- | --- |
| `index.html`, `*/index.html` | Eine HTML-Datei pro Route |
| `assets/*` | Gehashtes JavaScript und CSS von Vite |
| `preactpress-search.json` | Suchdaten für das Standard-Theme |
| `preactpress-content/*.json` | Lazy geladene Markdown-Payloads |
| `404.html` | Fehlerseite |

## Was ist mit VitePress?

Wenn du VitePress kennst, wird sich PreactPress vertraut anfühlen: Beide nutzen Vite, dateibasierte Markdown-Routen, ein Standard-Doku-Theme und statischen Output.

Der wichtigste Unterschied ist der UI-Stack. VitePress nutzt Vue. PreactPress nutzt Preact und MDX, daher werden interaktive Inhalte und eigene Themes als Preact-Komponenten geschrieben.

PreactPress ist in Produktion außerdem static-only. Du baust die Site einmal, lädst das Ausgabeverzeichnis hoch und hostest es auf Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3, Nginx oder einem anderen Static Host.

## Nächste Schritte

| Seite | Warum |
| --- | --- |
| [Getting Started](/de/guide/getting-started) | PreactPress installieren und die Starter-Struktur verstehen |
| [Routing](/de/guide/routing) | Lernen, wie Dateien zu URLs werden |
| [Deploy](/de/guide/deploy) | Eine statische Site bauen und veröffentlichen |
