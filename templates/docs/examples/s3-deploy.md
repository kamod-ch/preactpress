---
title: S3-compatible deployment
description: Deploy PreactPress static output to Amazon S3, MinIO, Cloudflare R2, and other S3-compatible object stores.
tags:
  - deploy
  - examples
---

PreactPress builds a static `dist/` directory. Any S3-compatible object store can host that output behind a CDN or public bucket policy.

Supported hosts include:

- Amazon S3 (+ CloudFront)
- Cloudflare R2
- MinIO
- Backblaze B2 (S3-compatible API)
- DigitalOcean Spaces
- Wasabi

## Build locally or in CI

```bash
pnpm run check
pnpm run build
```

Set `site.url` to your public CDN or bucket URL before building so `sitemap.xml`, canonical links, and Open Graph metadata are correct.

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

## Upload with AWS CLI

Install the [AWS CLI](https://aws.amazon.com/cli/) and configure credentials via environment variables or `aws configure` — never commit access keys to Git.

Sync the build output:

```bash
aws s3 sync dist/ s3://my-docs-bucket/ \
  --delete \
  --exclude ".DS_Store"
```

Cache hashed assets separately from HTML and JSON:

```bash
aws s3 sync dist/assets/ s3://my-docs-bucket/assets/ \
  --cache-control "public, max-age=31536000, immutable"

aws s3 sync dist/ s3://my-docs-bucket/ \
  --exclude "assets/*" \
  --cache-control "public, max-age=0, must-revalidate" \
  --exclude ".DS_Store"
```

Point CloudFront (or another CDN) at the bucket origin. Enable HTTPS on the CDN domain and set `site.url` to that domain.

## Cloudflare R2

R2 exposes an S3-compatible endpoint. Use the AWS CLI with a custom endpoint:

```bash
export AWS_ACCESS_KEY_ID="your-r2-access-key"
export AWS_SECRET_ACCESS_KEY="your-r2-secret-key"

aws s3 sync dist/ s3://my-docs-bucket/ \
  --endpoint-url https://<account-id>.r2.cloudflarestorage.com \
  --delete
```

Create API tokens in the Cloudflare dashboard and store them as CI secrets. Connect a custom domain via Cloudflare's public bucket or CDN settings.

## MinIO (self-hosted)

```bash
mc alias set local https://minio.example.com ACCESS_KEY SECRET_KEY
mc mirror --overwrite dist/ local/my-docs-bucket/
```

## GitHub Actions upload

Build in CI, then sync with the AWS CLI. Store credentials only in repository secrets:

```yaml
- run: pnpm run check && pnpm run build

- name: Upload to S3
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    AWS_DEFAULT_REGION: eu-central-1
  run: |
    aws s3 sync dist/ s3://my-docs-bucket/ --delete
```

For R2, add `--endpoint-url` with the R2 endpoint from your Cloudflare dashboard.

## SPA-style 404 handling

PreactPress generates `404.html`. On S3 + CloudFront, configure the distribution to return `/404.html` with HTTP 404 for missing objects. On Cloudflare R2 behind a custom domain, use Cloudflare error page rules or Workers as needed.

## What not to upload

Upload only `dist/`. Do not sync `node_modules`, `.preactpress`, or `node_modules/.preactpress`.

See also [Deploy](/guide/deploy), [Own server](/examples/own-server), and [GitHub Actions](/examples/github-actions).
