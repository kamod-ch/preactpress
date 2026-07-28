---
title: Deploy
description: Build and publish a PreactPress site
---

# Deploy

PreactPress builds static files. Production deployment means running a build and uploading the output directory, usually `dist/`, to a static host.

No Node server is required in production.

## Build and test locally

Run the release checks and production build from your site directory:

```bash
pnpm run check
pnpm run build
```

Preview the build locally:

```bash
pnpm run preview
```

The preview server serves the built output at **http://localhost:4173** by default.

## Configure production metadata

Set `site.url` before publishing. PreactPress uses it for canonical URLs, Open Graph metadata, `sitemap.xml`, and `robots.txt`.

```ts
export default {
  site: {
    title: "My site",
    description: "Short summary for search and social previews",
    url: "https://example.com",
    base: "/",
  },
  build: {
    sitemap: true,
    robots: true,
  },
};
```

## Public base path

By default, PreactPress assumes your site is served at the domain root:

```text
https://example.com/
```

If the site is served from a subpath, set `site.base`:

```ts
export default {
  site: {
    url: "https://user.github.io",
    base: "/my-repo/",
  },
};
```

You can also override the base path for a single build:

```bash
pnpm exec preactpress build --base /my-repo/
```

## Build output

The default output directory is `dist/`:

| Output                       | Description                                         |
| ---------------------------- | --------------------------------------------------- |
| `index.html`, `*/index.html` | Static HTML for each route                          |
| `assets/*`                   | Hashed JavaScript and CSS from Vite                 |
| `404.html`                   | Not-found page                                      |
| `preactpress-search.json`    | Search index for the default theme                  |
| `preactpress-content/*.json` | Lazy-loaded Markdown payloads for client navigation |
| `sitemap.xml`, `robots.txt`  | Generated when `site.url` and build flags are set   |
| `feed.xml`                   | Generated when `build.feed` is configured           |

Deploy only the output directory. Do not deploy `node_modules`, `.preactpress`, or the build cache.

## Platform settings

For most static hosts, use these settings:

| Host               | Build command    | Output directory |
| ------------------ | ---------------- | ---------------- |
| Netlify            | `pnpm run build` | `dist`           |
| Vercel             | `pnpm run build` | `dist`           |
| Cloudflare Pages   | `pnpm run build` | `dist`           |
| Render Static Site | `pnpm run build` | `dist`           |
| S3 / R2 / MinIO    | `pnpm run build` | `dist` (upload)  |

Install command:

```bash
pnpm install
```

Node version: **20 or higher**.

### Platform guides

| Host | Guide |
| ---- | ----- |
| GitHub Actions (CI + Pages) | [GitHub Actions](/examples/github-actions) |
| GitHub Pages | [GitHub Pages](#github-pages) (below) |
| Cloudflare Pages | [Cloudflare Pages](/examples/cloudflare-pages) |
| Netlify | [Netlify](/examples/netlify) |
| Vercel | [Vercel](/examples/vercel) |
| S3-compatible storage | [S3-compatible hosts](/examples/s3-deploy) |
| VPS / shared hosting | [Own server](/examples/own-server) |

## GitHub Pages

For a project site at `https://user.github.io/my-repo/`, configure:

```ts
export default {
  site: {
    url: "https://user.github.io",
    base: "/my-repo/",
  },
};
```

Build with the matching base path:

```bash
pnpm exec preactpress build --base /my-repo/
```

Then deploy the `dist/` directory.

### Official workflow template

Copy [`examples/github-actions/pages.yml`](https://github.com/kamod-ch/preactpress/blob/main/examples/github-actions/pages.yml) into your repository as `.github/workflows/pages.yml`, or use the composite action:

```yaml
- uses: kamod-ch/preactpress/action@v2
  with:
    command: all
    base: /${{ github.event.repository.name }}/
```

Set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**.

See [GitHub Actions](/examples/github-actions) for pull request checks, Node.js matrices, and artifact upload patterns.

## Monorepos

In a monorepo, run commands from the site package directory:

```bash
cd packages/docs
pnpm run check
pnpm run build
```

Or pass the site path to the CLI:

```bash
pnpm exec preactpress build ./packages/docs
```

## Cache headers

Files under `assets/` include content hashes in their filenames. If your host lets you set HTTP headers, cache those files aggressively:

```text
Cache-Control: public, max-age=31536000, immutable
```

Do not apply immutable caching to HTML files or JSON payloads such as `preactpress-search.json` and `preactpress-content/*.json`, because those URLs can keep the same names when content changes.
