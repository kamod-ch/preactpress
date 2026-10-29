# Design-Demos ansehen

**Nicht** die `.html`-Datei im Dateimanager doppelklicken — Browser blockieren oft Pfade und iframes.

## Server (einmal starten)

```bash
cd /home/watzak/master/kamod/preactpress
python3 -m http.server 8765 --bind 127.0.0.1
```

## URLs

| Seite | Link |
|--------|------|
| **Übersicht (6 + DE)** | http://127.0.0.1:8765/packages/plugin-playground/design-demos/thumbs.html |
| Index (Redirect) | http://127.0.0.1:8765/packages/plugin-playground/design-demos/ |
| A Product | …/landing-direction-a-product.html |
| B Docs rail | …/landing-direction-b-docs-rail.html |
| C Signal | …/landing-direction-c-signal-dark.html |
| D Jetset | …/landing-direction-d-jetset.html |
| E Brutalist | …/landing-direction-e-brutalist.html |
| F Magazine | …/landing-direction-f-magazine.html |
| **DE Deutsch** | …/landing-de.html |

**Cursor:** Command Palette → „Simple Browser: Show“ → Übersichts-URL einfügen.

Stoppen: `Ctrl+C` im Terminal.
