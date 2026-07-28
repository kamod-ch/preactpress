---
title: Netlify deployment
description: Deploy a PreactPress static site to Netlify.
tags:
  - deploy
  - examples
---

PreactPress generates static files in `dist/`. Netlify can build and serve that directory from your Git repository without a Node server in production.

## Prerequisites

- A PreactPress site in GitHub, GitLab, or Bitbucket
- Node.js 20 or newer
- Scripts in `package.json`:

```json [package.json]
{
  "scripts": {
    "check": "preactpress check",
    "build": "preactpress build"
  }
}
```

## Configure PreactPress

Set the production URL in `.preactpress/config.ts`:

```ts [.preactpress/config.ts]
import { defineConfig } from "@kamod-ch/preactpress/config";

export default defineConfig({
  site: {
    title: "My Docs",
    description: "Documentation built with PreactPress",
    url: "https://docs.example.com",
    base: "/",
  },
});
```

Use `base: "/"` unless you intentionally serve the site from a subpath.

## Deploy with the Netlify UI

1. Open [Netlify](https://app.netlify.com/) and choose **Add new site → Import an existing project**.
2. Connect your Git provider and select the PreactPress repository.
3. Use these build settings:

| Setting | Value |
| ------- | ----- |
| Build command | `pnpm run build` |
| Publish directory | `dist` |
| Base directory | project root (or monorepo site folder) |

For stricter builds, use:

```sh
pnpm run check && pnpm run build
```

## Environment variables

Set these under **Site configuration → Environment variables**:

| Variable | Value |
| -------- | ----- |
| `NODE_VERSION` | `22` |

Netlify detects pnpm from `pnpm-lock.yaml`. If needed, add a `netlify.toml`:

```toml [netlify.toml]
[build]
  command = "pnpm run check && pnpm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "22"
```

## Monorepos

Set **Base directory** to the site package, for example `packages/docs`. Netlify runs install and build from that folder.

## Custom domains

Add your domain under **Domain management → Add a domain**. Then update `site.url` in config so canonical URLs, Open Graph metadata, `sitemap.xml`, and feeds stay correct.

## Cache headers

In `netlify.toml`, cache hashed assets aggressively and avoid immutable caching for HTML and JSON payloads:

```toml
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.html"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
```

## CI without Netlify build

You can build in GitHub Actions and deploy the artifact with the [Netlify CLI](https://docs.netlify.com/cli/get-started/). Create a **Netlify personal access token** and store it as a repository secret (for example `NETLIFY_AUTH_TOKEN`). Do not commit tokens to the repository.

```yaml
- run: pnpm run build
- run: pnpm dlx netlify-cli deploy --prod --dir=dist
  env:
    NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
    NETLIFY_SITE_ID: ${{ vars.NETLIFY_SITE_ID }}
```

Prefer Netlify's built-in Git integration when possible; use CLI deployment when you need a custom CI pipeline.

See also [Deploy](/guide/deploy) and [GitHub Actions](/examples/github-actions).
