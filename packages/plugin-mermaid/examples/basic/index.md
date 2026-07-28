---
title: Mermaid diagrams
description: Example diagrams rendered by @preactpress/plugin-mermaid
---

# Mermaid diagrams

PreactPress renders Mermaid diagrams from fenced code blocks:

```mermaid
graph TD
  A[Markdown] --> B[PreactPress]
  B --> C[Static HTML]
```

## Sequence diagram

```mermaid
sequenceDiagram
  participant Author
  participant Build
  participant Browser
  Author->>Build: Write ```mermaid fence
  Build->>Browser: Static fallback HTML
  Browser->>Browser: Enhance with SVG
```

## Invalid diagram

```mermaid
graph TD
  A --> B
  this is not valid mermaid
```

Without JavaScript, the diagram source remains visible as an accessible fallback.
