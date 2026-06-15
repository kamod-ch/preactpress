# Remotion YouTube Starter

Ein minimaler Remotion-Starter für ein **16:9 YouTube-Video**.

## Enthalten

- 1920x1080 Komposition
- Intro / Feature / Outro Timeline
- einfache Animationen mit `spring()`, `interpolate()` und `Sequence()`
- anpassbare Props für Titel und Subtitle

## Start

```bash
cd examples/remotion-youtube-starter
pnpm install
pnpm run dev
```

## Rendern

```bash
pnpm run render
```

Die Datei wird nach `out/preactpress-youtube-starter.mp4` geschrieben.

## Branding

- echtes PreactPress-Wordmark im Video über `public/preactpress-wordmark-light.svg`
- Storyboard-Ideen unter [`../../docs/remotion-youtube-storyboards.md`](../../docs/remotion-youtube-storyboards.md)

## Wichtige Dateien

| Pfad                                    | Zweck                                |
| --------------------------------------- | ------------------------------------ |
| `src/index.ts`                          | registriert den Remotion Root        |
| `src/Root.tsx`                          | definiert die Composition            |
| `src/YouTubeStarter.tsx`                | enthält den eigentlichen Videoaufbau |
| `public/preactpress-wordmark-light.svg` | Wordmark für das Video               |

## Anpassen

- Texte in `src/Root.tsx` unter `defaultProps` ändern
- Farben und Layout in `src/YouTubeStarter.tsx` anpassen
- Timeline über `Sequence from={...}` und `durationInFrames` erweitern
