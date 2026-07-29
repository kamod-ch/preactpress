import path from "node:path";
import fs from "node:fs";
import c from "picocolors";
import { detectWorkspacePackages } from "./detectWorkspacePackages.js";

export interface WorkspacesCommandOptions {
  command: "check" | "build";
  root?: string;
  parallel?: number;
}

function findMonorepoRoots(start: string): string[] {
  const roots = new Set<string>();
  let current = path.resolve(start);
  while (true) {
    if (
      fs.existsSync(path.join(current, "pnpm-workspace.yaml")) ||
      (fs.existsSync(path.join(current, "package.json")) &&
        JSON.parse(fs.readFileSync(path.join(current, "package.json"), "utf8"))?.workspaces)
    ) {
      roots.add(current);
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return [...roots];
}

function docSitesInRoot(root: string): string[] {
  const sites: string[] = [];
  if (fs.existsSync(path.join(root, ".preactpress", "config.ts"))) {
    sites.push(root);
  }
  const packages = detectWorkspacePackages(root);
  for (const pkg of packages) {
    const siteRoot = path.resolve(root, pkg.root);
    if (fs.existsSync(path.join(siteRoot, ".preactpress", "config.ts"))) {
      sites.push(siteRoot);
    }
    if (fs.existsSync(path.join(siteRoot, "packages", "docs", ".preactpress", "config.ts"))) {
      sites.push(path.join(siteRoot, "packages", "docs"));
    }
  }
  if (fs.existsSync(path.join(root, "packages", "docs", ".preactpress", "config.ts"))) {
    sites.push(path.join(root, "packages", "docs"));
  }
  return [...new Set(sites)];
}

async function runSiteCommand(siteRoot: string, command: "check" | "build"): Promise<void> {
  if (command === "check") {
    const { runCheckCommand } = await import("./checkOutput.js");
    const code = await runCheckCommand(siteRoot, { format: "human" });
    if (code !== 0) throw new Error(`check failed for ${siteRoot}`);
    return;
  }
  const { build } = await import("./build.js");
  await build(siteRoot);
}

export async function runWorkspacesCommand(options: WorkspacesCommandOptions): Promise<number> {
  const start = path.resolve(options.root ?? process.cwd());
  const monorepoRoots = findMonorepoRoots(start);
  const sites = [...new Set(monorepoRoots.flatMap((root) => docSitesInRoot(root)))];
  if (!sites.length) {
    console.error(
      c.red("preactpress workspaces: no documentation sites with .preactpress/config.ts found."),
    );
    return 1;
  }

  console.log(c.dim(`Found ${sites.length} documentation site(s):`));
  for (const site of sites) console.log(`  ${site}`);

  const failures: string[] = [];
  for (const site of sites) {
    try {
      console.log(c.cyan(`\n→ ${options.command} ${site}`));
      await runSiteCommand(site, options.command);
      console.log(c.green(`  ✓ ${options.command} ok`));
    } catch (error) {
      failures.push(site);
      console.error(c.red(`  ✗ ${options.command} failed`));
      if (error instanceof Error) console.error(c.dim(error.message));
    }
  }

  if (failures.length) {
    console.error(c.red(`\n${failures.length} site(s) failed.`));
    return 1;
  }
  console.log(c.green(`\nAll ${sites.length} site(s) passed.`));
  return 0;
}
