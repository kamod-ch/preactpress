import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { collectEnvironment } from "./lib/env.mjs";
import { fetchText, measureAsync, nowMs, sleep, waitForHttp } from "./lib/timing.mjs";
import { generateFixture } from "./generate-fixture.mjs";
import { pageRoute } from "./lib/content-generator.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDir, "../..");
const fixturesRoot = path.resolve(scriptDir, "../fixtures");
const resultsDir = path.resolve(scriptDir, "../results");
const cliBin = path.join(packageRoot, "bin/preactpress.mjs");

const DEFAULT_SIZES = [100, 1000, 5000, 10000];

function parseArgs(argv) {
  const args = {
    sizes: [...DEFAULT_SIZES],
    skipDev: false,
    skipWarm: false,
    output: "",
    dryRun: false,
    ci: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--sizes" && argv[i + 1]) {
      args.sizes = argv[++i].split(",").map(Number);
    } else if (arg === "--skip-dev") args.skipDev = true;
    else if (arg === "--skip-warm") args.skipWarm = true;
    else if (arg === "--output" && argv[i + 1]) args.output = argv[++i];
    else if (arg === "--ci") args.ci = true;
    else if (arg === "--dry-run") args.dryRun = true;
    else if (arg === "--help" || arg === "-h") args.help = true;
  }
  if (args.ci) args.sizes = [100];
  return args;
}

async function pathExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function rmrf(p) {
  await fs.rm(p, { recursive: true, force: true });
}

async function dirSizeBytes(root) {
  let total = 0;
  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) await walk(full);
      else if (ent.isFile()) total += (await fs.stat(full)).size;
    }
  }
  if (await pathExists(root)) await walk(root);
  return total;
}

async function fileSize(p) {
  try {
    return (await fs.stat(p)).size;
  } catch {
    return 0;
  }
}

async function runBuild(cwd, { cold = false } = {}) {
  const cacheDir = path.join(cwd, ".preactpress/cache");
  const distDir = path.join(cwd, "dist");
  if (cold) {
    await rmrf(cacheDir);
    await rmrf(distDir);
  }

  const previousCwd = process.cwd();
  process.chdir(cwd);
  try {
    const { build } = await import(path.join(packageRoot, "dist/node/index.js"));
    const measured = await measureAsync(() => build("."));
    return {
      durationMs: measured.durationMs,
      peakMemoryMb: measured.peakMemoryMb,
    };
  } finally {
    process.chdir(previousCwd);
  }
}

async function collectOutputMetrics(cwd, sampleRoute) {
  const distDir = path.join(cwd, "dist");
  const searchIndexPath = path.join(distDir, "preactpress-search.json");
  const htmlPath = path.join(distDir, sampleRoute.replace(/^\//, ""), "index.html");

  const searchIndexBytes = await fileSize(searchIndexPath);
  const sampleHtmlBytes = await fileSize(htmlPath);

  let mainJsBytes = 0;
  let mainCssBytes = 0;
  let scriptTags = 0;
  let stylesheetTags = 0;

  if (sampleHtmlBytes > 0) {
    const html = await fs.readFile(htmlPath, "utf8");
    const scriptMatches = html.match(/<script[^>]+src="([^"]+)"/g) ?? [];
    const linkMatches = html.match(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g) ?? [];
    scriptTags = scriptMatches.length;
    stylesheetTags = linkMatches.length;

    for (const match of scriptMatches) {
      const href = match.match(/src="([^"]+)"/)?.[1];
      if (href && !href.startsWith("http")) {
        mainJsBytes += await fileSize(path.join(distDir, href.replace(/^\//, "")));
      }
    }
    for (const match of linkMatches) {
      const href = match.match(/href="([^"]+)"/)?.[1];
      if (href && !href.startsWith("http")) {
        mainCssBytes += await fileSize(path.join(distDir, href.replace(/^\//, "")));
      }
    }
  }

  const totalStaticBytes = await dirSizeBytes(distDir);

  return {
    searchIndexBytes,
    sampleHtmlBytes,
    mainJsBytes,
    mainCssBytes,
    totalStaticBytes,
    lighthouse: {
      sampleHtmlBytes,
      mainJsBytes,
      mainCssBytes,
      scriptTags,
      stylesheetTags,
      totalBlockingEstimate: mainJsBytes,
      note: "Static analysis only — not a full Lighthouse run. Compare same fixture size only.",
    },
  };
}

async function measureDevServer(cwd, sampleRoute, updatePagePath) {
  const port = 4173 + Math.floor(Math.random() * 500);
  const baseUrl = `http://127.0.0.1:${port}${sampleRoute}`;

  const child = spawn(
    process.execPath,
    [cliBin, "dev", ".", "--port", String(port), "--host", "127.0.0.1"],
    {
      cwd,
      env: { ...process.env, NODE_ENV: "development" },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  let stderr = "";
  child.stderr?.on("data", (c) => {
    stderr += String(c);
  });

  const start = nowMs();
  try {
    await waitForHttp(baseUrl, { timeoutMs: 180_000 });
    const devServerStartMs = nowMs() - start;

    const before = await fetchText(baseUrl);
    const marker = `<!-- benchmark-touch-${Date.now()} -->`;
    const absUpdate = path.join(cwd, updatePagePath);
    const original = await fs.readFile(absUpdate, "utf8");
    await fs.writeFile(absUpdate, `${original}\n${marker}\n`, "utf8");

    const updateStart = nowMs();
    let updated = false;
    while (nowMs() - updateStart < 60_000) {
      await sleep(200);
      const after = await fetchText(baseUrl);
      if (after.includes(marker)) {
        updated = true;
        break;
      }
    }
    await fs.writeFile(absUpdate, original, "utf8");

    if (!updated) {
      throw new Error("Dev page update did not propagate within 60s");
    }

    return {
      devServerStartMs,
      pageUpdateMs: nowMs() - updateStart,
    };
  } finally {
    child.kill("SIGTERM");
    await sleep(300);
    if (!child.killed) child.kill("SIGKILL");
    if (stderr && process.env.DEBUG) console.error(stderr.slice(-1000));
  }
}

async function benchmarkSize(pageCount, opts) {
  console.log(`\n=== Benchmark: ${pageCount} pages ===`);

  await generateFixture(pageCount, { clean: true });

  const sampleRoute = pageRoute(1, 1);
  const updatePagePath = "docs/section-001/page-0001.md";

  const cold = await runBuild(fixturesRoot, { cold: true });
  console.log(`  cold build: ${Math.round(cold.durationMs)} ms`);

  let warm = cold;
  if (!opts.skipWarm) {
    warm = await runBuild(fixturesRoot, { cold: false });
    console.log(`  warm build: ${Math.round(warm.durationMs)} ms`);
  }

  const output = await collectOutputMetrics(fixturesRoot, sampleRoute);

  let dev = { devServerStartMs: null, pageUpdateMs: null };
  if (!opts.skipDev) {
    dev = await measureDevServer(fixturesRoot, sampleRoute, updatePagePath);
    console.log(
      `  dev start: ${Math.round(dev.devServerStartMs)} ms, page update: ${Math.round(dev.pageUpdateMs)} ms`,
    );
  }

  return {
    pageCount,
    coldBuildMs: Math.round(cold.durationMs),
    warmBuildMs: Math.round(warm.durationMs),
    devServerStartMs: dev.devServerStartMs != null ? Math.round(dev.devServerStartMs) : null,
    pageUpdateMs: dev.pageUpdateMs != null ? Math.round(dev.pageUpdateMs) : null,
    peakMemoryMb: cold.peakMemoryMb,
    ...output,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(`Usage: node run-benchmark.mjs [options]

Options:
  --sizes 100,1000,...   Page counts (default: 100,1000,5000,10000)
  --skip-dev             Skip dev-server measurements
  --skip-warm            Skip warm build
  --output <file.json>   Write JSON results
  --ci                   CI mode: 100 pages only
  --dry-run              Print plan only`);
    return;
  }

  if (args.dryRun) {
    console.log("Benchmark plan:", args.sizes.join(", "), "pages");
    return;
  }

  await fs.mkdir(resultsDir, { recursive: true });

  const environment = collectEnvironment();
  const results = [];

  for (const size of args.sizes) {
    if (!Number.isFinite(size) || size < 1) {
      console.error(`Invalid size: ${size}`);
      process.exitCode = 1;
      return;
    }
    results.push(await benchmarkSize(size, args));
  }

  const report = {
    schema: "preactpress-benchmark/v1",
    environment,
    results,
    notes: [
      "All timings measured on the same machine in one run — do not compare across machines.",
      "Cold build clears .preactpress/cache and dist before building.",
      "Warm build reuses cache from the preceding cold build for the same page count.",
      "Lighthouse fields are static HTML/JS/CSS analysis, not Chrome Lighthouse scores.",
      "Fixture content is seeded (0x707072657373) and generated programmatically.",
    ],
  };

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outputPath = args.output
    ? path.resolve(args.output)
    : path.join(resultsDir, `benchmark-${stamp}.json`);

  await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`\nResults written to ${outputPath}`);

  const { summarizeReport } = await import("./compare-results.mjs");
  const mdPath = outputPath.replace(/\.json$/, ".md");
  await summarizeReport(report, mdPath);
  console.log(`Summary written to ${mdPath}`);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  await main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}

export { benchmarkSize, collectOutputMetrics, runBuild };
