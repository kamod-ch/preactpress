# Remotion YouTube Storyboards

## Ziel

Alternative Storyboards für den Starter, damit PreactPress-Videos je nach Anlass schnell adaptiert werden können.

---

## 1. Launch Video

**Use case:** neues Release, neues Projekt oder öffentliche Produktvorstellung.

### Ablauf
1. **Hook (0–3s)**
   - große Headline
   - PreactPress-Wordmark
   - klarer Product Promise
2. **Problem → Lösung (3–7s)**
   - kurze Aussage: Docs sind oft zu schwergewichtig
   - Gegenpositionierung: Preact + MDX + statischer Output
3. **3 Kernvorteile (7–12s)**
   - Write in MDX
   - Theme quickly
   - Deploy anywhere
4. **CTA (12–15s)**
   - `pnpm dlx @kamod-ch/preactpress init my-docs`
   - GitHub / npm / Docs Hinweis

### Message
> Ship modern docs with Preact, MDX and a lightweight stack.

---

## 2. Tutorial Video

**Use case:** Einstiegsvideo für neue Nutzer.

### Ablauf
1. **Intro (0–2s)**
   - PreactPress-Logo
   - „Build your docs site in minutes“
2. **Scaffold (2–5s)**
   - Terminal-Animation mit `init`
3. **Edit content (5–9s)**
   - Markdown/MDX Datei
   - Component-Embed
4. **Run locally (9–12s)**
   - `pnpm dev`
   - Preview-Ansicht
5. **Build + deploy (12–15s)**
   - `pnpm build`
   - Static hosting logos oder simple deployment badges

### Message
> Go from empty folder to production-ready docs in a few commands.

---

## 3. Changelog Video

**Use case:** Release Notes, neue Features, Social Clips.

### Ablauf
1. **Release card (0–2s)**
   - Versionnummer
   - kurzer Release-Titel
2. **What’s new (2–9s)**
   - 3 Karten für neue Features / Fixes
3. **Why it matters (9–12s)**
   - Nutzen für Teams / Autoren / Maintainer
4. **Upgrade CTA (12–15s)**
   - `pnpm up @kamod-ch/preactpress`
   - Link zu Release Notes

### Message
> Here’s what changed, why it matters and how to upgrade.

---

## 4. Feature Spotlight Video

**Use case:** einzelnes Feature vertiefen, z. B. Search, i18n, custom themes, MDX components.

### Ablauf
1. **Feature title (0–3s)**
   - Fokus auf ein Thema
2. **Before / after (3–7s)**
   - Problem vorher
   - Workflow mit PreactPress nachher
3. **Mini-demo (7–12s)**
   - 2–3 UI states oder Code-Snippets
4. **CTA (12–15s)**
   - docs link / starter link / repo

### Message
> One feature, one problem, one clean outcome.

---

## Empfehlung für dieses Repo

Für den aktuellen Starter sind diese Prioritäten sinnvoll:

1. **Launch Video** als Standard-Composition
2. **Tutorial Video** als zweite Composition
3. **Changelog Video** für wiederverwendbare Release-Kommunikation

## Nächste mögliche Umsetzung

- zusätzliche `Composition`s für `Launch`, `Tutorial`, `Changelog`
- shared Design-Tokens und shared Szene-Komponenten
- Props für Version, CTA, Feature-Liste und Brand-Farben
