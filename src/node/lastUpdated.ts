import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import type { SiteConfig } from "./siteConfig.js";

const execFileAsync = promisify(execFile);

export async function resolveFileLastUpdated(
  filePath: string,
  site: Pick<SiteConfig, "root" | "lastUpdatedGit">,
): Promise<string> {
  if (site.lastUpdatedGit) {
    const gitDate = await gitLastCommitDate(filePath, site.root);
    if (gitDate) return gitDate;
  }
  const stats = await fs.stat(filePath);
  return stats.mtime.toISOString();
}

async function gitLastCommitDate(filePath: string, cwd: string): Promise<string | undefined> {
  try {
    const { stdout } = await execFileAsync("git", ["log", "-1", "--format=%cI", "--", filePath], {
      cwd,
      timeout: 3000,
    });
    const value = stdout.trim();
    return value ? new Date(value).toISOString() : undefined;
  } catch {
    return undefined;
  }
}
