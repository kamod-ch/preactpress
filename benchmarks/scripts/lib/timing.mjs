import { performance } from "node:perf_hooks";

export function nowMs() {
  return performance.now();
}

export async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function peakRssMb() {
  const usage = process.memoryUsage();
  return Math.round((usage.rss / (1024 * 1024)) * 100) / 100;
}

export async function measureAsync(fn) {
  const start = nowMs();
  const startRss = process.memoryUsage().rss;
  let peakRss = startRss;
  const sample = setInterval(() => {
    const rss = process.memoryUsage().rss;
    if (rss > peakRss) peakRss = rss;
  }, 50);

  try {
    const result = await fn();
    return {
      result,
      durationMs: nowMs() - start,
      peakMemoryMb: Math.round((peakRss / (1024 * 1024)) * 100) / 100,
    };
  } finally {
    clearInterval(sample);
  }
}

export async function waitForHttp(url, { timeoutMs = 120_000, intervalMs = 200 } = {}) {
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { redirect: "follow" });
      if (res.ok || res.status === 404) return res;
      lastError = new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastError = err;
    }
    await sleep(intervalMs);
  }
  throw new Error(`Timed out waiting for ${url}: ${lastError?.message ?? "unknown"}`);
}

export async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
  return res.text();
}
