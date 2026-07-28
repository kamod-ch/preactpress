import fs from "node:fs/promises";
import path from "node:path";
import c from "picocolors";
import { resolveConfigPath } from "./paths.js";
import { resolveConfig } from "./config.js";

export interface VersionCommandOptions {
  value: string;
  label?: string;
  dryRun?: boolean;
}

function isValidVersionValue(value: string): boolean {
  return /^\d+(?:\.\d+)*$/.test(value);
}

async function copyDirectory(source: string, target: string, dryRun: boolean): Promise<number> {
  let count = 0;
  const entries = await fs.readdir(source, { withFileTypes: true });
  for (const entry of entries) {
    const from = path.join(source, entry.name);
    const to = path.join(target, entry.name);
    if (entry.isDirectory()) {
      if (!dryRun) await fs.mkdir(to, { recursive: true });
      count += await copyDirectory(from, to, dryRun);
      continue;
    }
    if (!dryRun) {
      await fs.mkdir(path.dirname(to), { recursive: true });
      await fs.copyFile(from, to);
    }
    count += 1;
  }
  return count;
}

function renderVersionConfigSnippet(value: string, label: string): string {
  return `{
        value: '${value}',
        label: '${label}',
        status: 'archived',
      }`;
}

async function registerVersionInConfig(
  configPath: string,
  value: string,
  label: string,
  dryRun: boolean,
): Promise<"updated" | "exists" | "manual"> {
  const source = await fs.readFile(configPath, "utf8");
  if (source.includes(`value: '${value}'`) || source.includes(`value: "${value}"`)) {
    return "exists";
  }
  const itemsMatch = source.match(/items\s*:\s*\[/);
  if (!itemsMatch || itemsMatch.index === undefined) {
    return "manual";
  }
  const insertAt = itemsMatch.index + itemsMatch[0].length;
  const snippet = `\n      ${renderVersionConfigSnippet(value, label)},`;
  const next = `${source.slice(0, insertAt)}${snippet}${source.slice(insertAt)}`;
  if (!dryRun) await fs.writeFile(configPath, next, "utf8");
  return "updated";
}

export async function runVersionCommand(
  rootArg: string | undefined,
  options: VersionCommandOptions,
): Promise<number> {
  const root = path.resolve(rootArg ?? process.cwd());
  const site = await resolveConfig(root, "build", "production");
  if (!site.versions.enabled) {
    console.error(
      c.red(
        "preactpress version: enable structured versions in .preactpress/config.ts before snapshotting.",
      ),
    );
    return 1;
  }

  const value = options.value.trim();
  if (!isValidVersionValue(value)) {
    console.error(c.red(`preactpress version: invalid version value "${value}". Use semver-like values such as 1.2.0.`));
    return 1;
  }

  const label = options.label?.trim() || value;
  const sourceDir = path.join(root, site.versions.currentDir);
  const targetDir = path.join(root, site.versions.dir, value);
  const configPath = resolveConfigPath(root);

  try {
    await fs.access(sourceDir);
  } catch {
    console.error(c.red(`preactpress version: current docs directory not found at ${sourceDir}`));
    return 1;
  }

  try {
    await fs.access(targetDir);
    console.error(c.red(`preactpress version: refusing to overwrite existing snapshot at ${targetDir}`));
    return 1;
  } catch {
    // target is free
  }

  const fileCount = await copyDirectory(sourceDir, targetDir, Boolean(options.dryRun));
  const registration = await registerVersionInConfig(configPath, value, label, Boolean(options.dryRun));

  console.log("");
  console.log(c.bold(options.dryRun ? "Version snapshot (dry run)" : "Version snapshot created"));
  console.log(`  Version: ${value}`);
  console.log(`  Label:   ${label}`);
  console.log(`  From:    ${path.relative(root, sourceDir) || "."}/`);
  console.log(`  To:      ${path.relative(root, targetDir)}/`);
  console.log(`  Files:   ${fileCount}`);
  if (registration === "updated") {
    console.log(c.green(`  Config:  added versions.items entry in ${path.relative(root, configPath)}`));
  } else if (registration === "exists") {
    console.log(c.yellow("  Config:  version entry already present; left config unchanged"));
  } else {
    console.log(c.yellow("  Config:  add this item manually to versions.items:"));
    console.log(`    ${renderVersionConfigSnippet(value, label)}`);
  }
  if (options.dryRun) {
    console.log("");
    console.log(c.dim("Dry run only. Re-run without --dry-run to write files."));
  } else {
    console.log("");
    console.log(c.dim("No git operations were performed."));
  }
  console.log("");
  return 0;
}
