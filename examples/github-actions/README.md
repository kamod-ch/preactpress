# PreactPress GitHub Actions workflows

Official, copy-ready workflow templates for PreactPress sites.

| File                                   | Purpose                                                               |
| -------------------------------------- | --------------------------------------------------------------------- |
| [`check.yml`](./check.yml)             | Pull request checks: `preactpress check`, build, JSON report artifact |
| [`pages.yml`](./pages.yml)             | Build and deploy to GitHub Pages                                      |
| [`node-matrix.yml`](./node-matrix.yml) | Node.js 20/22 matrix for check and build                              |

## Quick start

1. Copy one or more YAML files into your site repository under `.github/workflows/`.
2. Commit and push. GitHub Actions runs automatically on the next push or pull request.
3. For GitHub Pages, set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**.

## Composite action (optional)

Instead of inline steps, use the maintained composite action:

```yaml
- uses: kamod-ch/preactpress/action@v2
  with:
    command: all
    node-version: 22
    strict: true
    upload-artifact: true
```

See [`action/README.md`](../../action/README.md) for all inputs.

## Documentation

- [GitHub Actions guide](https://kamod-ch.github.io/preactpress/examples/github-actions/)
- [Deploy guide](https://kamod-ch.github.io/preactpress/guide/deploy/)

Examples do not include deployment secrets. Configure credentials only in your repository or host settings.
