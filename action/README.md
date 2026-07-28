# PreactPress GitHub Action

Composite action for CI and deployment workflows: install dependencies with cache, run `preactpress check`, build static output, and optionally upload artifacts.

## Usage

Pin to a [release tag](https://github.com/kamod-ch/preactpress/releases) of the PreactPress repository:

```yaml
- uses: kamod-ch/preactpress/action@v2
  with:
    command: build
    node-version: 22
```

### Pull request checks

```yaml
- uses: kamod-ch/preactpress/action@v2
  with:
    command: all
    node-version: 22
    strict: true
    check-args: --format json --output reports/docs-check.json
```

### Build with artifact upload

```yaml
- uses: kamod-ch/preactpress/action@v2
  with:
    command: build
    node-version: 22
    upload-artifact: true
    artifact-name: dist
```

### GitHub Pages project site

For `https://user.github.io/my-repo/`:

```yaml
- uses: kamod-ch/preactpress/action@v2
  with:
    command: all
    base: /${{ github.event.repository.name }}/
```

### Monorepo site package

```yaml
- uses: kamod-ch/preactpress/action@v2
  with:
    working-directory: packages/docs
    command: all
    node-version: 22
```

## Inputs

| Input | Default | Description |
| ----- | ------- | ----------- |
| `command` | `all` | `install`, `check`, `build`, or `all` |
| `node-version` | `22` | Node.js version |
| `working-directory` | `.` | Site root directory |
| `package-manager` | `pnpm` | `pnpm`, `npm`, or `yarn` |
| `install-args` | `--frozen-lockfile` | Extra install arguments |
| `check-args` | — | Extra `preactpress check` arguments |
| `build-args` | — | Extra `preactpress build` arguments |
| `base` | — | Shortcut for `--base` on build |
| `strict` | `false` | Pass `--strict` to check |
| `upload-artifact` | `false` | Upload `artifact-path` after build |
| `artifact-name` | `preactpress-dist` | Artifact name |
| `artifact-path` | `dist` | Output directory relative to site root |

## Workflow templates

Copy-ready workflows live in [`examples/github-actions/`](../examples/github-actions/):

- [`check.yml`](../examples/github-actions/check.yml) — PR checks with JSON report
- [`pages.yml`](../examples/github-actions/pages.yml) — GitHub Pages deployment
- [`node-matrix.yml`](../examples/github-actions/node-matrix.yml) — Node.js 20/22 matrix

See the [GitHub Actions guide](https://kamod-ch.github.io/preactpress/examples/github-actions/) for deployment notes across hosts.
