---
title: Comparison
description: How PreactPress compares to VitePress, Docusaurus, and Starlight
---

# Comparison

PreactPress targets teams who document **Preact libraries and APIs** and want VitePress-style workflows with MDX, validation, and AI-ready exports.

## At a glance

| | PreactPress | VitePress | Docusaurus | Starlight |
| --- | --- | --- | --- | --- |
| **UI stack** | Preact + MDX | Vue | React | Astro |
| **Primary audience** | Preact libraries, APIs, AI agents | Vue documentation | Large React doc portals | Multi-framework content |
| **Docs theme** | Built-in default | Built-in default | Built-in default | Built-in default |
| **Runtime size** | Small Preact bundle | Vue hydration | React + router | Varies by integration |
| **Static output** | Yes | Yes | Yes | Yes |
| **Local search** | Built-in | Built-in | Built-in | Built-in |
| **i18n** | Built-in | Built-in | Built-in | Built-in |
| **Versioning** | Built-in | Built-in | Built-in | Community patterns |

## Developer experience

| Capability | PreactPress | VitePress | Docusaurus | Starlight |
| ---------- | ----------- | --------- | ---------- | --------- |
| File-based Markdown routes | Yes | Yes | Yes | Yes |
| MDX / interactive components | Preact MDX | Vue in Markdown | React MDX | Astro + islands |
| Config validation CLI | `preactpress check` | Build-time only | Build-time only | Build-time only |
| Plugin API | Typed hooks | VitePress hooks | Docusaurus plugins | Astro integrations |
| VitePress migration CLI | `migrate vitepress` | — | — | — |

## Library and API documentation

| Capability | PreactPress | VitePress | Docusaurus | Starlight |
| ---------- | ----------- | --------- | ---------- | --------- |
| TypeScript API reference | `@preactpress/plugin-typedoc` | Manual / community | TypeDoc plugin | Manual |
| OpenAPI / REST docs | `@preactpress/plugin-openapi` | Community | Community | Community |
| Component prop tables | `@preactpress/plugin-component-reference` | Manual | PropTypes / manual | Manual |
| Live code playground | `@preactpress/plugin-playground` | Custom | Live codeblock plugin | Custom |
| Changelog from GitHub | `@preactpress/plugin-changelog` | Manual | Manual | Manual |
| Mermaid diagrams | `@preactpress/plugin-mermaid` | Built-in | Community | Community |

## AI and coding agents

| Capability | PreactPress | VitePress | Docusaurus | Starlight |
| ---------- | ----------- | --------- | ---------- | --------- |
| `llms.txt` export | Built-in (`ai` config) | Community | Community | Community |
| Full-text LLM dump | `llms-full.txt` | Community | Community | Community |
| Per-page Markdown copies | Built-in | — | — | — |
| Structured context index | `api/context.json` | — | — | — |

## Deployment

All four tools emit static files suitable for Netlify, Vercel, Cloudflare Pages, GitHub Pages, and S3.

PreactPress additionally generates:

- `_redirects` from config (Netlify / Cloudflare)
- `preactpress-redirects.json` manifest
- Redirect HTML fallbacks with canonical URLs

## When to choose PreactPress

Choose PreactPress when:

- Your library or product already uses **Preact**
- You want **VitePress-like docs DX** without Vue
- You need **TypeDoc, OpenAPI, or component prop docs** as official plugins
- You want **`preactpress check`** in CI before every release
- You serve docs to **AI coding agents** via `llms.txt`

## When to choose something else

| Tool | Choose when |
| ---- | ----------- |
| **VitePress** | You are committed to Vue and want the reference Vue docs stack |
| **Docusaurus** | You need React, a large plugin ecosystem, or Meta-style doc portals |
| **Starlight / Astro** | You build multi-framework content sites with islands, not library API docs |

## Benchmarks

PreactPress cold/warm build times for a 100-page fixture are documented in the [release report](https://github.com/kamod-ch/preactpress/blob/main/RELEASE-REPORT.md). Compare tools on the same machine and page count for meaningful numbers.

## Next steps

| Page | Why |
| ---- | --- |
| [What is PreactPress?](/guide/what-is-preactpress) | Core concepts |
| [Getting started](/guide/getting-started) | Create your first site |
| [Migrate from VitePress](/guide/migration/vitepress) | Switch from Vue docs |
