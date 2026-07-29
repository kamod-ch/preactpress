import os from "node:os";
import { execFileSync } from "node:child_process";

export function collectEnvironment() {
  const nodeVersion = process.version;
  let cpuModel = os.cpus()[0]?.model ?? "unknown";
  let cpuCount = os.cpus().length;
  let totalMemoryMb = Math.round(os.totalmem() / (1024 * 1024));

  let gitCommit = "unknown";
  let gitBranch = "unknown";
  try {
    gitCommit = execFileSync("git", ["rev-parse", "--short", "HEAD"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    /* not a git repo */
  }
  try {
    gitBranch = execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    /* not a git repo */
  }

  return {
    nodeVersion,
    platform: `${os.platform()}-${os.arch()}`,
    cpuModel,
    cpuCount,
    totalMemoryMb,
    gitCommit,
    gitBranch,
    timestamp: new Date().toISOString(),
  };
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MiB`;
}

export function formatMs(ms) {
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

export function mbFromBytes(bytes) {
  return Math.round((bytes / (1024 * 1024)) * 100) / 100;
}
