import fs from "node:fs/promises";
import path from "node:path";
import type {
  MigrationAdapter,
  MigrationOptions,
  MigrationPlan,
  MigrationReport,
} from "./types.js";
import { createEmptyReport } from "./report.js";
import { isAssetFile, transformAssetContent } from "./adapters/vitepress/analyze.js";

async function pathExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(dir: string, dryRun: boolean): Promise<void> {
  if (dryRun) return;
  await fs.mkdir(dir, { recursive: true });
}

export async function runMigration(
  adapter: MigrationAdapter,
  options: MigrationOptions,
): Promise<MigrationReport> {
  const sourceRoot = path.resolve(options.source);
  const outputRoot = path.resolve(options.output);

  if (sourceRoot === outputRoot) {
    throw new Error("Migration output must differ from the source directory.");
  }

  const detected = await adapter.detect(sourceRoot);
  if (!detected) {
    throw new Error(
      `No ${adapter.label} project detected at ${sourceRoot}. Expected a .vitepress directory or VitePress config.`,
    );
  }

  const report = createEmptyReport(adapter.id, sourceRoot, outputRoot, options.dryRun);
  const plan = await adapter.plan(options);

  report.migrated.push(...plan.migrated);
  report.warnings.push(...plan.warnings);
  report.manualTasks.push(...plan.manualTasks);

  for (const file of plan.files) {
    if (file.category === "markdown") report.stats.markdownFiles += 1;
    if (file.category === "assets") report.stats.assetFiles += 1;
  }

  report.stats.vueComponents = report.warnings.filter((w) =>
    w.message.includes("Vue component"),
  ).length;

  if (!options.dryRun) {
    await ensureDir(outputRoot, false);
    if (plan.configSnippet) {
      const configPath = path.join(outputRoot, ".preactpress", "config.ts");
      if (await pathExists(configPath)) {
        report.stats.filesSkipped += 1;
        report.migrated.push({
          category: "config",
          status: "skipped",
          source: path.join(sourceRoot, ".vitepress", "config"),
          target: configPath,
          message: "Skipped existing PreactPress config (not overwritten)",
        });
      } else {
        await ensureDir(path.dirname(configPath), false);
        await fs.writeFile(configPath, plan.configSnippet, "utf8");
        report.stats.filesWritten += 1;
        report.migrated.push({
          category: "config",
          status: "migrated",
          target: configPath,
          message: "Generated PreactPress config from VitePress theme config",
        });
      }
    }
  } else if (plan.configSnippet) {
    report.stats.filesWritten += 1;
    report.migrated.push({
      category: "config",
      status: "migrated",
      target: ".preactpress/config.ts",
      message: "Would generate PreactPress config from VitePress theme config",
    });
  }

  await writePlannedFiles(plan, sourceRoot, outputRoot, options.dryRun, report);

  report.finishedAt = new Date().toISOString();
  return report;
}

async function writePlannedFiles(
  plan: MigrationPlan,
  sourceRoot: string,
  outputRoot: string,
  dryRun: boolean,
  report: MigrationReport,
): Promise<void> {
  for (const file of plan.files) {
    const targetPath = path.join(outputRoot, file.targetPath);
    const relSource = path.relative(sourceRoot, file.sourcePath);

    if (!dryRun && (await pathExists(targetPath))) {
      report.stats.filesSkipped += 1;
      report.migrated.push({
        category: file.category,
        status: "skipped",
        source: relSource,
        target: file.targetPath,
        message: "Target already exists (not overwritten)",
      });
      continue;
    }

    if (!dryRun) {
      await ensureDir(path.dirname(targetPath), false);
      if (isAssetFile(file)) {
        await fs.writeFile(targetPath, transformAssetContent(file.content));
      } else {
        await fs.writeFile(targetPath, file.content, "utf8");
      }
      report.stats.filesWritten += 1;
    }

    report.migrated.push({
      category: file.category,
      status: "migrated",
      source: relSource,
      target: file.targetPath,
      message: dryRun ? "Would migrate file" : "Migrated file",
    });

    if (dryRun) {
      report.stats.filesWritten += 1;
    }
  }
}
