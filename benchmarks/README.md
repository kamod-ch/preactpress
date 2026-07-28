# PreactPress Performance Benchmarks

Reproducible benchmark suite for measuring PreactPress scaling across project sizes.

## What is measured

| Metric | Description |
| --- | --- |
| Cold build | Full production build after clearing `dist/` and `.preactpress/cache` |
| Warm build | Second build reusing cache from cold build |
| Dev server start | Time until first successful HTTP response |
| Page update | Time until a touched Markdown page reflects in dev SSR |
| Peak memory | Peak RSS during in-process production build |
| Search index size | `dist/preactpress-search.json` bytes |
| HTML output size | Sample page (`/docs/section-001/page-0001`) HTML bytes |
| JavaScript per page | Sum of script `src` assets referenced by sample HTML |
| Lighthouse baseline | Static HTML/JS/CSS sizes and asset counts (not Chrome Lighthouse) |

## Project sizes

Default matrix: **100**, **1,000**, **5,000**, **10,000** pages.

Content is generated programmatically with a fixed PRNG seed (`0x707072657373`). No manually maintained test pages.

## Quick start

From the PreactPress package root:

```bash
pnpm run build
node benchmarks/scripts/generate-fixture.mjs --pages 100
node benchmarks/scripts/run-benchmark.mjs --sizes 100 --skip-dev
```

Full local run (slow — includes dev-server measurements):

```bash
node benchmarks/scripts/run-benchmark.mjs
```

CI mode (100 pages, no dev server):

```bash
node benchmarks/scripts/run-benchmark.mjs --ci
```

## Directory layout

```
benchmarks/
  fixtures/           # Minimal site template + generated docs/
  scripts/
    generate-fixture.mjs
    run-benchmark.mjs
    compare-results.mjs
    lib/
  results/            # JSON + Markdown output (gitignored except baseline)
  thresholds.json     # Regression thresholds for CI
  README.md
```

## Output

Each run writes:

- `results/benchmark-<timestamp>.json` — machine-readable metrics + environment metadata
- `results/benchmark-<timestamp>.md` — human-readable summary with scaling table

Compare against a baseline:

```bash
node benchmarks/scripts/compare-results.mjs \
  results/benchmark-latest.json \
  results/baseline.json
```

Exit code `1` when any metric exceeds configured regression thresholds.

## Regression thresholds

Configured in `thresholds.json`. Default relative allowance is **+15–25%** vs baseline depending on metric. Thresholds apply **per page count** — never compare 100-page results against 10,000-page baselines.

Update baseline after intentional improvements:

```bash
cp results/benchmark-<timestamp>.json results/baseline.json
```

## Benchmark environment

Document these when publishing results:

- Node.js version
- OS / CPU / RAM
- Git commit
- Whether dev-server tests ran (network + filesystem dependent)
- Same-machine comparison only

The JSON report includes an `environment` block automatically.

## CI

GitHub Actions job `benchmark` runs on Node 22:

1. Build PreactPress
2. Generate 100-page fixture
3. Run cold + warm build benchmarks
4. Compare against committed `results/baseline.json`

Dev-server and 1k+ page sizes are intended for local/scheduled runs due to CI time limits.

## Avoiding misleading comparisons

- **Same fixture size only** — scaling ratios are computed within one run.
- **Same machine only** — absolute timings vary by hardware.
- **Cold vs warm** — always label which build type was measured.
- **Static Lighthouse fields** — these are asset-size proxies, not Core Web Vitals.
- **Minimal sidebar** — fixture config keeps navigation tiny so nav config size does not dominate scaling.

## Identifying regressions locally

```bash
# Before changes
node benchmarks/scripts/run-benchmark.mjs --sizes 100,1000 --skip-dev \
  --output /tmp/before.json

# After changes
node benchmarks/scripts/run-benchmark.mjs --sizes 100,1000 --skip-dev \
  --output /tmp/after.json

node benchmarks/scripts/compare-results.mjs /tmp/after.json /tmp/before.json
```
