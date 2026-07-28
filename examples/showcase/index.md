---
title: PreactPress Showcase
description: Feature showcase for the PreactPress documentation framework
layout: home
hero:
  name: PreactPress Showcase
  text: Documentation framework demo
  tagline: Plugins, validation, redirects, AI exports, and live Preact playgrounds in one project.
  actions:
    - theme: brand
      text: Explore features
      link: /guide/features
    - theme: alt
      text: Try playground
      link: /guide/playground
features:
  - icon: P
    title: Plugin system
    details: Mermaid and Playground plugins registered in config.
  - icon: C
    title: preactpress check
    details: Run pnpm check before every release.
  - icon: A
    title: AI exports
    details: llms.txt and llms-full.txt generated at build time.
---

## Validate this site

```bash
pnpm check
pnpm build
```

The redirect `/legacy` points to [Features](/guide/features) — validated by `preactpress check`.
