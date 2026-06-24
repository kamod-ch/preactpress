# Content Collections Plan

## Ziel

PreactPress soll neben klassischen Dokumentationsseiten auch **strukturierte Content Collections** als First-class-Feature unterstützen.

Dadurch lassen sich nicht nur Docs, sondern auch katalogartige statische Sites umsetzen, zum Beispiel:

- Jobboards
- Plugin-Verzeichnisse
- Produktkataloge
- Theme-Galerien
- Teamseiten
- Ressourcen-Sammlungen

## Vision

Nutzer sollen Collections deklarativ definieren können, zum Beispiel:

```ts
defineCollection({
  name: "libraries",
  directory: "content/libraries",
  schema: librarySchema,
});
```

Darauf aufbauend soll PreactPress strukturierte Inhalte validieren, abfragen, für statische Routen nutzen und bei Build-Time weiterverarbeiten können.

## Warum das wichtig ist

Heute bietet PreactPress bereits gute Grundbausteine:

- `createContentLoader(...)` für Build-Time-Daten
- statische Dynamic Routes via `[slug].md` + `.paths.ts`
- Themes und Layout-Komponenten für individuelle Darstellung

Was fehlt, ist eine zusammenhängende **Higher-level API**, die diese Bausteine für strukturierte Inhalte bündelt.

Collections würden PreactPress deutlich über reine Dokumentationsseiten hinaus erweitern, ohne das statische Modell aufzugeben.

## Scope

### In Scope

- deklarative Definition von Collections im Config- oder Helper-Layer
- Zuordnung eines Collection-Namens zu einem Verzeichnis
- Validierung strukturierter Frontmatter-/Metadaten über ein Schema
- Build-Time-Zugriff auf Collection-Entries
- statische Detailseiten und Archiv-/Kategorie-Routen auf Basis der Collection
- vorbereitende Unterstützung für SEO, Sitemap und strukturierte Metadaten

### Out of Scope für die erste Iteration

- serverseitige oder runtime-dynamische Collections
- CMS-Integration als Pflichtbestandteil
- voll generisches Plugin-System nur für Collections
- freie, unvalidierte Layoutnamen ohne Theme-Vertrag

## Gewünschte Fähigkeiten

### 1. First-class Collections

- `defineCollection(...)` als öffentliche API
- mehrere Collections pro Projekt
- klare Zuordnung von `name`, `directory`, optionalem `slug`-Verhalten und `schema`
- Build-Fehler bei ungültigen oder unvollständigen Einträgen

### 2. Strukturierte Datenabfrage

- Zugriff via `getCollection("libraries")`
- sortieren, filtern und gruppieren von Einträgen
- Basis für Kategorien, Tags, verwandte Einträge und Übersichtsseiten

### 3. Collection-getriebene statische Routen

Beispiele:

- `/libraries/[slug]`
- `/categories/[category]`
- paginierte Collection-Indizes

### 4. Eigene Seitenlayouts

Collection-Einträge sollen eigene Darstellungen ermöglichen, aber kontrolliert und theme-freundlich.

Bevorzugt:

- Collection- oder Route-basierte Layout-Zuordnung
- klarer Theme-Vertrag für Entry- und Index-Ansichten

Mit Vorsicht behandeln:

```md
---
layout: library
---
```

Freie Layoutnamen wirken attraktiv, führen aber schnell zu uneinheitlicher Validierung und unklaren Erwartungen zwischen Core und Themes.

### 5. Build-Time-Ableitungen

Collections sollen nutzbar sein für:

- Kategorien berechnen
- ähnliche Einträge ermitteln
- Statistiken erzeugen
- Sitemap erweitern
- strukturierte Metadaten validieren
- Suchindex und Feed-ähnliche Artefakte vorbereiten

## API-Richtung

### Mindestziel

```ts
const libraries = defineCollection({
  name: "libraries",
  directory: "content/libraries",
  schema: librarySchema,
});
```

### Sinnvolle Erweiterungen

```ts
const libraries = defineCollection({
  name: "libraries",
  directory: "content/libraries",
  schema: librarySchema,
  slug: ({ file, data }) => data.slug ?? file,
  entryLayout: "catalog-entry",
  indexLayout: "catalog-index",
});
```

### Zugriff im Build

- `getCollection(name)` für Loader, Hooks und Themes
- optional später abgeleitete Helfer wie:
  - `getEntryBySlug(collection, slug)`
  - `groupCollectionBy(collection, key)`
  - `getRelatedEntries(entry, collection)`

## Empfohlene Umsetzung in Phasen

## Phase 1 — MVP: Collection Registry + Validierung

### Ziel

Collections als stabiles Kernkonzept einführen.

### Deliverables

- öffentliche API `defineCollection(...)`
- Config-Erweiterung für `collections`
- Scanner für Collection-Verzeichnisse
- Schema-Validierung pro Entry
- normalisierte Entry-Struktur für Core und Themes
- Build-Fehler mit klaren Dateipfaden bei ungültigen Daten
- Dokumentation mit mindestens einem vollständigen Beispiel

### Ergebnis

Nutzer können strukturierte Inhalte sauber definieren und Build-Time sicher verwenden.

## Phase 2 — Routing + Collection Pages

### Ziel

Collections direkt in das statische Routing integrieren.

### Deliverables

- generierte Detailrouten pro Entry
- Kategorien-/Tag-Archive auf Basis der Collection-Daten
- Collection-Indexseiten
- Pagination für größere Collections
- Kollisionserkennung mit vorhandenen Dateirouten

### Ergebnis

Use Cases wie `/libraries/[slug]` und `/categories/[category]` werden nativ und ergonomisch.

## Phase 3 — Computed Data + SEO

### Ziel

Collections als Publishing- und Katalog-Engine ausbauen.

### Deliverables

- ähnliche Einträge / related content
- aggregierte Statistiken
- Sitemap-Integration
- strukturierte Metadaten / JSON-LD-Unterstützung
- Suchindex-Erweiterung pro Collection
- Beispiele für katalogartige Sites

### Ergebnis

PreactPress wird für Content-Sites und Verzeichnisse deutlich attraktiver.

## Technische Leitplanken

- bestehende APIs nicht ersetzen, sondern erweitern
- `createContentLoader(...)` als Fundament weiterverwenden
- Dynamic Routes intern weiterhin nutzbar machen
- bestehende Docs-Workflows dürfen unverändert weiter funktionieren
- neue Core-API muss deterministisch und vollständig Build-Time-orientiert bleiben

## Auswirkungen auf bestehende Architektur

### Bestehende Bausteine, die wiederverwendet werden können

- `src/node/createContentLoader.ts`
- `src/node/pageDataLoaders.ts`
- `src/node/dynamicRoutes.ts`
- `src/shared/contentSchema.ts`

### Bereiche, die erweitert werden müssen

- Config-Typen und öffentliche Config-Helfer
- Content-Scanning und Routing-Auflösung
- Validierung / Check-Kommandos
- Theme-Datenmodell
- Dokumentation und Starter-Beispiele

## Risiken

- zu frühe Überverallgemeinerung der API
- Konflikte zwischen Dateirouting und generierten Collection-Routen
- unklare Theme-Verträge bei freien Layoutnamen
- Schema-API könnte zu eng oder zu offen designt werden
- Collections dürfen den einfachen Docs-Use-Case nicht komplizierter machen

## Erfolgskriterien

Das Feature ist erfolgreich, wenn PreactPress damit ohne Workarounds mindestens folgende Szenarien sauber abbilden kann:

1. Library-/Plugin-Verzeichnis mit Detailseiten und Kategorien
2. Teamseite mit strukturierten Profilen
3. Ressourcen-Sammlung mit Filtern und thematischen Übersichten
4. Produkt- oder Theme-Galerie mit statisch generierten Detailseiten

## Dokumentationsbedarf

Nach der technischen Umsetzung sollten mindestens folgende Doku-Seiten ergänzt werden:

- Einführung in Collections
- Collection-Schema und Validierung
- Collection-Routing
- Build-Time-Queries und Derived Data
- Beispielprojekt `libraries`
- Hinweise zu Grenzen und Best Practices

## Status

- [x] Produktidee beschrieben
- [x] Nutzen und Zielbild formuliert
- [x] Phasenplan definiert
- [ ] API konkretisieren
- [ ] Core-Architektur entwerfen
- [ ] Implementierung umsetzen
- [ ] Tests und Doku ergänzen

## Fazit

Content Collections sind eine der stärksten möglichen Erweiterungen für PreactPress.

Sie bauen auf bestehenden Konzepten wie Content Loadern und Dynamic Routes auf, heben diese aber auf ein deutlich verständlicheres und mächtigeres Niveau. Damit könnte sich PreactPress von einem reinen Docs-Framework zu einem vielseitigen statischen Framework für strukturierte Content-Sites weiterentwickeln.
