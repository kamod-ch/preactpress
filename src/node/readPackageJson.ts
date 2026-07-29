import fs from "node:fs";
import path from "node:path";

export interface PackageJsonMeta {
  name?: string;
  version?: string;
  description?: string;
  repository?: string | { type?: string; url?: string; directory?: string };
  homepage?: string;
}

export function readPackageJsonMeta(packageRoot: string): PackageJsonMeta {
  const file = path.join(packageRoot, "package.json");
  try {
    const raw = fs.readFileSync(file, "utf8");
    const parsed = JSON.parse(raw) as PackageJsonMeta;
    return parsed ?? {};
  } catch {
    return {};
  }
}

export function repositoryUrlFromMeta(meta: PackageJsonMeta): string | undefined {
  const repo = meta.repository;
  if (!repo) return undefined;
  if (typeof repo === "string") {
    return normalizeGitHubUrl(repo);
  }
  if (repo.url) return normalizeGitHubUrl(repo.url);
  return undefined;
}

function normalizeGitHubUrl(url: string): string {
  return url
    .replace(/^git\+/, "")
    .replace(/^git:\/\//, "https://")
    .replace(/\.git$/, "")
    .replace(/^git@github\.com:/, "https://github.com/");
}
