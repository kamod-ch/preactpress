---
title: Vercel deployment
description: Deploy a PreactPress static site to Vercel.
tags:
  - deploy
  - examples
---

PreactPress outputs static HTML and assets. Vercel serves the `dist/` directory as a static site without a Node runtime in production.

## Prerequisites

- A PreactPress site in Git
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

```ts [.preactpress/config.ts]
import { defineConfig } from "@kamod-ch/preactpress/config";

export default defineConfig({
  site: {
    title: "My Docs",
    url: "https://docs.example.com",
    base: "/",
  },
});
```

## Deploy with the Vercel dashboard

1. Open [Vercel](https://vercel.com/new) and import your Git repository.
2. Vercel usually detects a static project. Confirm:

| Setting          | Value            |
| ---------------- | ---------------- |
| Framework Preset | Other            |
| Build Command    | `pnpm run build` |
| Output Directory | `dist`           |
| Install Command  | `pnpm install`   |

For stricter deployments:

```sh
pnpm run check && pnpm run build
```

## vercel.json (optional)

For explicit control or monorepos:

```json [vercel.json]
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "pnpm run check && pnpm run build",
  "outputDirectory": "dist",
  "installCommand": "pnpm install"
}
```

For a site in a subdirectory, set **Root Directory** in the Vercel project settings to that folder (for example `packages/docs`) instead of duplicating paths in `vercel.json`.

## Environment variables

Under **Project → Settings → Environment Variables**:

| Variable       | Value |
| -------------- | ----- |
| `NODE_VERSION` | `22`  |

## Custom domains

Add a domain in **Project → Settings → Domains**, then update `site.url` in PreactPress config.

## Headers

Use `vercel.json` to cache hashed assets and keep HTML fresh:

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## CI deploy with Vercel CLI

Build in GitHub Actions and deploy with the [Vercel CLI](https://vercel.com/docs/cli). Store `VERCEL_TOKEN` as a repository secret and `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` as variables — never commit them.

```yaml
- run: pnpm run build
- run: pnpm dlx vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

The `--prebuilt` flag uploads the existing `dist/` output instead of rebuilding on Vercel.

See also [Deploy](/guide/deploy) and [GitHub Actions](/examples/github-actions).
