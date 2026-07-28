---
title: Own server deployment
description: Deploy PreactPress static output to your own VPS, dedicated server, or shared hosting via rsync, SFTP, or a reverse proxy.
tags:
  - deploy
  - examples
---

PreactPress needs Node.js only at build time. Production is plain static files from `dist/` — any web server that can serve HTML, CSS, and JavaScript works.

## Build pipeline

Run the same checks locally or in CI before upload:

```bash
pnpm run check
pnpm run build
pnpm run preview
```

Preview serves `dist/` at **http://localhost:4173** by default. Fix any issues before uploading.

Set `site.url` (and `site.base` when serving from a subpath) in `.preactpress/config.ts` before the production build.

## rsync over SSH

A common pattern for VPS or dedicated servers:

```bash
pnpm run build
rsync -avz --delete dist/ deploy@example.com:/var/www/docs/
```

Use SSH keys instead of passwords. In GitHub Actions, store the private key as a secret (for example `DEPLOY_SSH_KEY`) and the target path as a variable:

```yaml
- run: pnpm run build

- name: Deploy via rsync
  env:
    DEPLOY_HOST: ${{ vars.DEPLOY_HOST }}
    DEPLOY_USER: ${{ vars.DEPLOY_USER }}
    DEPLOY_PATH: ${{ vars.DEPLOY_PATH }}
    DEPLOY_SSH_KEY: ${{ secrets.DEPLOY_SSH_KEY }}
  run: |
    install -m 600 -D /dev/null ~/.ssh/deploy_key
    printf '%s\n' "$DEPLOY_SSH_KEY" > ~/.ssh/deploy_key
    rsync -avz --delete -e "ssh -i ~/.ssh/deploy_key -o StrictHostKeyChecking=accept-new" \
      dist/ "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/"
```

Never commit private keys or passwords to the repository.

## Nginx

Serve the uploaded `dist/` directory:

```nginx
server {
    listen 443 ssl http2;
    server_name docs.example.com;

    root /var/www/docs;
    index index.html;

    location /assets/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
        try_files $uri =404;
    }

    location / {
        try_files $uri $uri/ $uri/index.html =404;
    }

    error_page 404 /404.html;
}
```

PreactPress emits clean URLs as `path/index.html`. The `try_files` directive above resolves them correctly.

## Caddy

```caddy
docs.example.com {
    root * /var/www/docs
    file_server
    try_files {path} {path}/ {path}/index.html
    handle_errors {
        rewrite * /404.html
        file_server
    }
}
```

## Apache

```apache
DocumentRoot /var/www/docs

<Directory /var/www/docs>
    Options -Indexes +FollowSymLinks
    AllowOverride None
    Require all granted

    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.+)$ /$1/index.html [L]
</Directory>

ErrorDocument 404 /404.html
```

## Shared hosting (SFTP/FTP)

Many shared hosts only expose FTP or SFTP:

1. Build locally or in CI.
2. Upload the contents of `dist/` to the web root (`public_html`, `www`, or similar).
3. Do not upload `node_modules` or source files unless your host requires them for builds.

Prefer SFTP over plain FTP when available. Store credentials in your CI secret store, not in workflow files.

## Systemd + preview (smoke test only)

`preactpress preview` is for local verification, not production:

```bash
pnpm exec preactpress preview --host 127.0.0.1 --port 4173
```

In production, use Nginx, Caddy, Apache, or another static file server in front of `dist/`.

## Subpath deployment

When the site lives under a path such as `/docs/`:

```ts
export default {
  site: {
    url: "https://example.com",
    base: "/docs/",
  },
};
```

Build with:

```bash
pnpm exec preactpress build --base /docs/
```

Upload to the matching directory on the server (`/var/www/example/docs/`).

## Monorepos

Build from the site package:

```bash
cd packages/docs
pnpm run check
pnpm run build
rsync -avz --delete dist/ deploy@example.com:/var/www/docs/
```

## Related guides

- [Deploy](/guide/deploy)
- [GitHub Actions](/examples/github-actions)
- [S3-compatible hosts](/examples/s3-deploy)
