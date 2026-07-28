import fs from "node:fs";
import path from "node:path";

export interface DetectedPackage {
  name: string;
  root: string;
  version?: string;
  dependencies: string[];
}

function readJsonFile<T>(file: string): T | undefined {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as T;
  } catch {
    return undefined;
  }
}

function packageRootsFromWorkspacesField(
  root: string,
  workspaces: string[] | Record<string, string[]>,
): string[] {
  const patterns = Array.isArray(workspaces)
    ? workspaces
    : [...(workspaces.packages ?? []), ...(workspaces.nohoist ?? [])];
  const dirs: string[] = [];
  for (const pattern of patterns) {
    if (!pattern.includes("*")) {
      dirs.push(path.resolve(root, pattern));
      continue;
    }
    const base = pattern.split("*")[0]?.replace(/\/+$/, "") ?? "";
    const parent = path.resolve(root, base);
    if (!fs.existsSync(parent)) continue;
    for (const entry of fs.readdirSync(parent, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const candidate = path.join(parent, entry.name);
      if (fs.existsSync(path.join(candidate, "package.json"))) {
        dirs.push(candidate);
      }
    }
  }
  return dirs;
}

function parsePnpmWorkspacePatterns(file: string): string[] {
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  const patterns: string[] = [];
  let inPackages = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    if (/^packages\s*:/.test(trimmed)) {
      inPackages = true;
      continue;
    }
    if (inPackages) {
      const match = trimmed.match(/^-\s+['"]?([^'"]+)['"]?/);
      if (match?.[1]) {
        patterns.push(match[1]);
        continue;
      }
      if (!trimmed.startsWith("-")) inPackages = false;
    }
  }
  return patterns;
}

function detectFromPnpm(root: string): string[] {
  const file = path.join(root, "pnpm-workspace.yaml");
  if (!fs.existsSync(file)) return [];
  try {
    return packageRootsFromWorkspacesField(root, parsePnpmWorkspacePatterns(file));
  } catch {
    return [];
  }
}

function detectFromPackageJson(root: string): string[] {
  const pkg = readJsonFile<{ workspaces?: string[] | { packages?: string[] } }>(
    path.join(root, "package.json"),
  );
  if (!pkg?.workspaces) return [];
  return packageRootsFromWorkspacesField(root, pkg.workspaces);
}

/** Best-effort discovery of workspace package roots for pnpm, npm, and Yarn. */
export function detectWorkspacePackages(root: string): DetectedPackage[] {
  const packageRoots = [...new Set([...detectFromPnpm(root), ...detectFromPackageJson(root)])];
  const packages: DetectedPackage[] = [];
  for (const packageRoot of packageRoots.sort()) {
    const meta = readJsonFile<{
      name?: string;
      version?: string;
      dependencies?: Record<string, string>;
    }>(path.join(packageRoot, "package.json"));
    if (!meta?.name) continue;
    packages.push({
      name: meta.name,
      root: path.relative(root, packageRoot) || ".",
      version: meta.version,
      dependencies: Object.keys(meta.dependencies ?? {}),
    });
  }
  return packages;
}
