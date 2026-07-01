---
title: Mermaid diagrams
description: Render flowcharts, sequence diagrams, and other Mermaid diagrams in Markdown and MDX.
tags:
  - examples
  - markdown
---

PreactPress renders Mermaid diagrams from fenced code blocks. Use the `mermaid` language name:

````md
```mermaid
graph TD
  A[Markdown] --> B[PreactPress]
  B --> C[Static HTML]
```
````

## Flowchart

```mermaid
graph TD
  A[Markdown] --> B[PreactPress]
  B --> C[Static HTML]
  C --> D[Fast docs site]
```

## Sequence diagram

```mermaid
sequenceDiagram
  participant User
  participant Site as PreactPress Site
  participant Mermaid

  User->>Site: Open docs page
  Site->>Mermaid: Render diagram block
  Mermaid-->>Site: SVG diagram
  Site-->>User: Interactive documentation
```

## State diagram

```mermaid
stateDiagram-v2
  [*] --> Draft
  Draft --> Review
  Review --> Published
  Review --> Draft
  Published --> [*]
```

Mermaid is loaded on the client only when a page contains a diagram.
