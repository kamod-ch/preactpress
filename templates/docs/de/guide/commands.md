---
title: Befehle
description: PreactPress-CLI für Entwicklung und Produktions-Builds
---

Die PreactPress-CLI wird im Site-Root ausgeführt (Ordner mit `.preactpress/config.ts`).

## Entwicklung

```bash
pnpm exec preactpress dev
```

Startet Vite mit SSR, Hot Reload und dem gleichen HTML-Head wie in Production.

## Production

```bash
pnpm exec preactpress build
pnpm exec preactpress preview
```

`build` schreibt statisches HTML nach `outDir` (Standard: `dist/`). `preview` dient nur zur lokalen Vorschau.

## Projekt anlegen

```bash
pnpm exec preactpress init
pnpm exec preactpress init --template docs
```

Das `docs`-Template enthält diese Anleitung, i18n-Beispiele und Referenzseiten.

## Validierung

```bash
pnpm exec preactpress check
```

Prüft Config, Routen-Kollisionen, Nav-/Sidebar-Links, interne Markdown-Links und Draft-Seiten.

::: tip
`check` in CI einbinden, damit kaputte Sidebar-Links vor dem Merge auffallen.
:::
