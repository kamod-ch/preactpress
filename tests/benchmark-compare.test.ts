import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { compareResults } from "../benchmarks/scripts/compare-results.mjs";

const resultsDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../benchmarks/results",
);

describe("compareResults", () => {
  it("rejects comparisons when fixture page counts do not match", async () => {
    const current = {
      environment: { timestamp: "test" },
      results: [{ pageCount: 1000, coldBuildMs: 1, warmBuildMs: 1 }],
      notes: [],
    };
    const baseline = {
      environment: { timestamp: "test" },
      results: [{ pageCount: 100, coldBuildMs: 1, warmBuildMs: 1 }],
      notes: [],
    };

    const currentPath = path.join(resultsDir, ".tmp-benchmark-current.json");
    const baselinePath = path.join(resultsDir, ".tmp-benchmark-baseline.json");
    await import("node:fs/promises").then((fs) =>
      Promise.all([
        fs.writeFile(currentPath, JSON.stringify(current)),
        fs.writeFile(baselinePath, JSON.stringify(baseline)),
      ]),
    );

    const report = await compareResults(currentPath, baselinePath, { writeReport: false });
    expect(report.passed).toBe(false);
    expect(report.failures.some((f) => f.metric === "pageCount")).toBe(true);

    await import("node:fs/promises").then((fs) =>
      Promise.all([fs.unlink(currentPath), fs.unlink(baselinePath)]),
    );
  });
});
