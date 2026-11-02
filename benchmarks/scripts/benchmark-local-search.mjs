import { cpus, platform, arch } from "node:os";
import { performance } from "node:perf_hooks";
import { selectSearchEntries } from "../../dist/client/searchScore.js";

// Deterministic 1,000-page index; only page 500 should match the routing queries.
const entries = Array.from({ length: 1000 }, (_, i) => ({
  route: `/guide/page-${i}`,
  title: i === 500 ? "Routing Guides" : `Reference Component ${i}`,
  excerpt: "Documentation for configuring this component in a local documentation site.",
  locale: "en",
  version: "v1",
  workspace: "docs",
}));
console.log(
  JSON.stringify(
    {
      runtime: process.version,
      platform: platform(),
      arch: arch(),
      cpu: cpus()[0].model,
      pages: entries.length,
      warmup: 20,
      samples: 200,
    },
    null,
    2,
  ),
);
for (const query of ["routing", "routng", "zzzzzz"]) {
  const search = () => selectSearchEntries(entries, query, "en", "v1", "docs");
  for (let i = 0; i < 20; i++) search();
  const timings = [];
  for (let i = 0; i < 200; i++) {
    const start = performance.now();
    search();
    timings.push(performance.now() - start);
  }
  timings.sort((a, b) => a - b);
  const routes = search().map((entry) => entry.route);
  const expected = query === "zzzzzz" ? [] : ["/guide/page-500"];
  if (JSON.stringify(routes) !== JSON.stringify(expected))
    throw new Error(`Unexpected results: ${query}`);
  console.log(
    JSON.stringify({
      query,
      medianMs: timings[100],
      p95Ms: timings[189],
      maxMs: timings[199],
      routes,
      falsePositives: 0,
    }),
  );
}
