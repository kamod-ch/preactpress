---
title: Deploy
description: Eine PreactPress-Site bauen und veröffentlichen
---

# Deploy

PreactPress erzeugt statische Dateien. Produktion bedeutet: Build ausführen und das Ausgabeverzeichnis, normalerweise `dist/`, auf einen Static Host hochladen.

In Produktion ist kein Node-Server nötig.

## Lokal bauen und testen

Führe Release-Checks und Produktionsbuild im Site-Verzeichnis aus:

```bash
pnpm run check
pnpm run build
```

Sieh dir den Build lokal an:

```bash
pnpm run preview
```

Der Preview-Server stellt den gebauten Output standardmäßig unter **http://localhost:4173** bereit.

## Produktionsmetadaten konfigurieren

Setze `site.url` vor der Veröffentlichung. PreactPress nutzt diese URL für Canonical URLs, Open-Graph-Metadaten, `sitemap.xml` und `robots.txt`.

```ts
export default {
  site: {
    title: "Meine Site",
    description: "Kurze Beschreibung für Suche und Social Previews",
    url: "https://example.com",
    base: "/",
  },
  build: {
    sitemap: true,
    robots: true,
  },
};
```

## Public Base Path

Standardmäßig nimmt PreactPress an, dass deine Site am Domain-Root ausgeliefert wird:

```text
https://example.com/
```

Wenn die Site unter einem Unterpfad liegt, setze `site.base`:

```ts
export default {
  site: {
    url: "https://user.github.io",
    base: "/my-repo/",
  },
};
```

Du kannst den Base Path auch nur für einen einzelnen Build überschreiben:

```bash
pnpm exec preactpress build --base /my-repo/
```

## Build-Output

Das Standard-Ausgabeverzeichnis ist `dist/`:

| Ausgabe                      | Beschreibung                                          |
| ---------------------------- | ----------------------------------------------------- |
| `index.html`, `*/index.html` | Statisches HTML für jede Route                        |
| `assets/*`                   | Gehashtes JavaScript und CSS von Vite                 |
| `404.html`                   | Fehlerseite                                           |
| `preactpress-search.json`    | Suchindex für das Standard-Theme                      |
| `preactpress-content/*.json` | Lazy geladene Markdown-Payloads für Client-Navigation |
| `sitemap.xml`, `robots.txt`  | Erzeugt, wenn `site.url` und Build-Flags gesetzt sind |
| `feed.xml`                   | Erzeugt, wenn `build.feed` konfiguriert ist           |

Deploye nur das Ausgabeverzeichnis. Deploye nicht `node_modules`, `.preactpress` oder den Build-Cache.

## Plattform-Einstellungen

Für die meisten Static Hosts reichen diese Einstellungen:

| Host               | Build-Befehl     | Output-Verzeichnis |
| ------------------ | ---------------- | ------------------ |
| Netlify            | `pnpm run build` | `dist`             |
| Vercel             | `pnpm run build` | `dist`             |
| Cloudflare Pages   | `pnpm run build` | `dist`             |
| Render Static Site | `pnpm run build` | `dist`             |

Install-Befehl:

```bash
pnpm install
```

Node-Version: **20 oder höher**.

## GitHub Pages

Für eine Projektseite unter `https://user.github.io/my-repo/` konfigurierst du:

```ts
export default {
  site: {
    url: "https://user.github.io",
    base: "/my-repo/",
  },
};
```

Danach deployest du das Verzeichnis `dist/`.

Ein minimales GitHub-Actions-Workflow kann so aussehen:

```yaml
name: Deploy PreactPress site to Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - uses: actions/configure-pages@v5
      - run: pnpm install
      - run: pnpm run check
      - run: pnpm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Setze in den Repository-Einstellungen die Pages-Quelle auf **GitHub Actions**.

## Monorepos

In einem Monorepo führst du die Befehle aus dem Site-Paket aus:

```bash
cd packages/docs
pnpm run check
pnpm run build
```

Oder du übergibst der CLI den Site-Pfad:

```bash
pnpm exec preactpress build ./packages/docs
```

## Cache-Headers

Dateien unter `assets/` enthalten Content-Hashes in ihren Dateinamen. Wenn dein Host HTTP-Header setzen kann, cache diese Dateien aggressiv:

```text
Cache-Control: public, max-age=31536000, immutable
```

Wende immutable Caching nicht auf HTML-Dateien oder JSON-Payloads wie `preactpress-search.json` und `preactpress-content/*.json` an, weil diese URLs bei Inhaltsänderungen gleich bleiben können.
