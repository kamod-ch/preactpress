import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { formatBytes, formatMs } from "./lib/env.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const thresholdsPath = path.join(scriptDir, "../thresholds.json");

function metricRow(label, value, formatter = (v) => String(v)) {
  return `| ${label} | ${value == null ? "—" : formatter(value)} |`;
}

export async function summarizeReport(report, outputPath) {
  const env = report.environment;
  const lines = [
    "# PreactPress Benchmark Report",
    "",
    `Generated: ${env.timestamp}`,
    "",
    "## Environment",
    "",
    "| Key | Value |",
    "| --- | --- |",
    `| Node | ${env.nodeVersion} |`,
    `| Platform | ${env.platform} |`,
    `| CPU | ${env.cpuModel} (${env.cpuCount} cores) |`,
    `| RAM | ${env.totalMemoryMb} MiB |`,
    `| Git | ${env.gitBranch} @ ${env.gitCommit} |`,
    "",
    "## Results by page count",
    "",
  ];

  for (const row of report.results) {
    lines.push(`### ${row.pageCount.toLocaleString()} pages`, "");
    lines.push("| Metric | Value |");
    lines.push("| --- | --- |");
    lines.push(metricRow("Cold build", row.coldBuildMs, formatMs));
    lines.push(metricRow("Warm build", row.warmBuildMs, formatMs));
    lines.push(metricRow("Dev server start", row.devServerStartMs, formatMs));
    lines.push(metricRow("Page update (dev)", row.pageUpdateMs, formatMs));
    lines.push(metricRow("Peak memory (build)", row.peakMemoryMb, (v) => `${v} MiB`));
    lines.push(metricRow("Search index", row.searchIndexBytes, formatBytes));
    lines.push(metricRow("Sample HTML", row.sampleHtmlBytes, formatBytes));
    lines.push(metricRow("Main JS (referenced)", row.mainJsBytes, formatBytes));
    lines.push(metricRow("Main CSS (referenced)", row.mainCssBytes, formatBytes));
    lines.push(metricRow("Total dist size", row.totalStaticBytes, formatBytes));
    lines.push("");
  }

  if (report.results.length > 1) {
    lines.push("## Scaling (relative to 100 pages)", "", "| Metric | 100 | 1000 | 5000 | 10000 |");
    lines.push("| --- | --- | --- | --- | --- |");
    const base = report.results.find((r) => r.pageCount === 100) ?? report.results[0];
    const metrics = ["coldBuildMs", "warmBuildMs", "searchIndexBytes", "totalStaticBytes"];
    for (const metric of metrics) {
      const cells = report.results.map((r) => {
        const ratio = r[metric] / base[metric];
        return `${formatMs(r[metric])} (${ratio.toFixed(2)}×)`;
      });
      while (cells.length < 4) cells.push("—");
      lines.push(`| ${metric} | ${cells.join(" | ")} |`);
    }
    lines.push("");
  }

  lines.push("## Notes", "");
  for (const note of report.notes ?? []) {
    lines.push(`- ${note}`);
  }
  lines.push("");

  const content = lines.join("\n");
  if (outputPath) {
    await fs.writeFile(outputPath, content);
  }
  return content;
}

function checkMetric(name, actual, baseline, threshold) {
  if (baseline == null || actual == null) return null;
  const relative = threshold.relative ?? 1.15;
  const limit = baseline * relative;
  const delta = ((actual - baseline) / baseline) * 100;
  const passed = actual <= limit;
  return { name, actual, baseline, limit, delta, passed, relative };
}

export async function compareResults(currentPath, baselinePath, { writeReport = true } = {}) {
  const thresholds = JSON.parse(await fs.readFile(thresholdsPath, "utf8"));
  const current = JSON.parse(await fs.readFile(currentPath, "utf8"));
  const baseline = JSON.parse(await fs.readFile(baselinePath, "utf8"));

  const failures = [];
  const checks = [];

  for (const row of current.results) {
    const baseRow = baseline.results.find((r) => r.pageCount === row.pageCount);
    if (!baseRow) {
      checks.push({ pageCount: row.pageCount, status: "skipped", reason: "no baseline for size" });
      continue;
    }

    for (const [metric, cfg] of Object.entries(thresholds.metrics)) {
      const result = checkMetric(metric, row[metric], baseRow[metric], cfg);
      if (!result) continue;
      checks.push({ pageCount: row.pageCount, ...result });
      if (!result.passed) {
        failures.push({
          pageCount: row.pageCount,
          metric,
          actual: result.actual,
          baseline: result.baseline,
          limit: result.limit,
          deltaPercent: result.delta,
        });
      }
    }
  }

  const report = {
    current: currentPath,
    baseline: baselinePath,
    passed: failures.length === 0,
    failureCount: failures.length,
    failures,
    checks,
  };

  if (writeReport) {
    const outPath = currentPath.replace(/\.json$/, ".compare.json");
    await fs.writeFile(outPath, `${JSON.stringify(report, null, 2)}\n`);
  }

  return report;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2 || args.includes("--help")) {
    console.log("Usage: node compare-results.mjs <current.json> <baseline.json>");
    process.exit(args.includes("--help") ? 0 : 1);
    return;
  }

  const report = await compareResults(path.resolve(args[0]), path.resolve(args[1]));
  if (report.passed) {
    console.log("All regression checks passed.");
  } else {
    console.error(`Regression failures (${report.failureCount}):`);
    for (const f of report.failures) {
      console.error(
        `  [${f.pageCount} pages] ${f.metric}: ${f.actual} vs baseline ${f.baseline} (+${f.deltaPercent.toFixed(1)}%, limit ${f.limit.toFixed(0)})`,
      );
    }
    process.exitCode = 1;
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  await main();
}
