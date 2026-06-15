# Remotion YouTube Starter Plan

## Ziel

Ein einfacher, sofort nutzbarer **Remotion-Starter für YouTube-Videos** soll direkt im Repository liegen und im Haupt-README sichtbar verlinkt werden.

## Scope

- eigenständiges Beispiel unter `examples/remotion-youtube-starter`
- Remotion-Komposition im **YouTube-Format 1920x1080**
- kurze Starter-Animation mit:
  - Intro / Brand-Hero
  - 3 Feature-Highlights
  - CTA / Outro
- lokale Anleitung zum Starten, Previewen und Rendern
- README-Ergänzung mit Verweis auf den Starter
- einfache Preview-Grafik für GitHub

## Deliverables

1. `examples/remotion-youtube-starter/package.json`
2. `examples/remotion-youtube-starter/tsconfig.json`
3. `examples/remotion-youtube-starter/remotion.config.ts`
4. `examples/remotion-youtube-starter/src/index.ts`
5. `examples/remotion-youtube-starter/src/Root.tsx`
6. `examples/remotion-youtube-starter/src/YouTubeStarter.tsx`
7. `examples/remotion-youtube-starter/README.md`
8. `README.md`-Abschnitt zum Starter
9. `.github/assets/remotion-youtube-starter.svg`

## Umsetzungsplan

### 1. Beispielstruktur anlegen
- separaten Beispielordner erstellen
- eigenes `package.json`, damit keine Root-Dependencies aufgebläht werden
- TypeScript-Setup für Remotion definieren

### 2. Starter-Komposition bauen
- `Composition` mit 30 fps und ca. 15 Sekunden Länge
- klare Szenenstruktur aufbauen
- einfache Motion mit `spring()`, `interpolate()`, `Sequence()`
- visuell neutrales, produktnahes Layout verwenden

### 3. Developer Experience
- Skripte für `dev`, `studio` und `render`
- kurze Beispielbefehle dokumentieren
- Props so anlegen, dass Titel/Subtitle leicht angepasst werden können

### 4. README-Integration
- neuen Abschnitt im Root-README ergänzen
- auf Beispielordner und Plan-Datei verlinken
- Preview-Grafik einbinden

## Status

- [x] Ordnerstruktur anlegen
- [x] Plan dokumentieren
- [x] Remotion-Starter implementieren
- [x] README ergänzen
- [x] Preview-Asset ergänzen

## Hinweise

- Das Beispiel ist bewusst **isoliert** gehalten.
- Root-Build und Tests des Hauptprojekts bleiben dadurch unverändert.
- Für echtes Exportieren muss im Beispielordner einmal `pnpm install` ausgeführt werden.
