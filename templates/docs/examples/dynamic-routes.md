---
title: Dynamic route example
description: Build multiple static pages from one bracket route template.
tags:
  - examples
  - dynamic-routes
---

# Dynamic route example

The docs starter includes a runnable dynamic route under `packages/[pkg].md`.

- [PreactPress package page](/packages/preactpress)
- [Preact package page](/packages/preact)

The matching `packages/[pkg].paths.ts` module returns the static params and props that are rendered at build time. No production server is required.
