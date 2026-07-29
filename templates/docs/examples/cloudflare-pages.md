---
title: Cloudflare Pages deployment
description: Deploy a PreactPress static site to Cloudflare Pages.
tags:
  - deploy
  - examples
---

PreactPress outputs static files, so Cloudflare Pages can serve the generated `dist/` directory without a Node server.

## Prerequisites

- A PreactPress site committed to GitHub or GitLab
- Node.js 20 or newer
- A package script like:

```json [package.json]
{
  "scripts": {
    "check": "preactpress check",
    "build": "preactpress build"
  }
}
```

## Configure PreactPress

Set the final production URL in `.preactpress/config.ts`:

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

Use `base: "/"` for normal Cloudflare Pages deployments. Only change `base` if you intentionally serve the site from a subpath.

## Deploy with the Cloudflare dashboard

1. Open **Cloudflare Dashboard → Workers & Pages → Create application → Pages**.
2. Connect your GitHub or GitLab repository.
3. Choose your PreactPress project.
4. Use these build settings:

| Setting             | Value            |
| ------------------- | ---------------- |
| Framework preset    | `None` / custom  |
| Build command       | `pnpm run build` |
| Build output folder | `dist`           |
| Root directory      | project root     |

If your docs live in a monorepo subfolder, set **Root directory** to that folder, for example:

```txt
packages/docs
```

## Environment variables

Set the Node version in Cloudflare Pages:

| Variable       | Value |
| -------------- | ----- |
| `NODE_VERSION` | `22`  |

Cloudflare Pages usually detects pnpm from `pnpm-lock.yaml`. If needed, set:

| Variable       | Value     |
| -------------- | --------- |
| `PNPM_VERSION` | `10.12.4` |

## Optional: run checks before build

For stricter deployments, use this build command:

```sh
pnpm run check && pnpm run build
```

This fails the deployment when routes, nav links, sidebar links, or internal Markdown links are invalid.

## Deploy with Wrangler

You can also deploy the built `dist/` directory manually with Wrangler:

```sh
pnpm run check
pnpm run build
pnpm dlx wrangler pages deploy dist --project-name my-preactpress-site
```

For a monorepo, run those commands from the site package directory or pass the correct output path.

## Custom domains

After the first deployment, add your domain in **Pages → Custom domains**. Then update `site.url` to match the production domain:

```ts
export default defineConfig({
  site: {
    url: "https://docs.example.com",
  },
});
```

This keeps canonical URLs, Open Graph metadata, `sitemap.xml`, `robots.txt`, and feeds correct.

See also [Deploy](/guide/deploy), [GitHub Actions](/examples/github-actions), and [Netlify](/examples/netlify).

## Cache notes

Cloudflare can cache hashed files under `assets/` aggressively because their filenames change when content changes. Avoid immutable caching for HTML, `preactpress-search.json`, and `preactpress-content/*.json`.
