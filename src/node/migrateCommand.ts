import fs from "node:fs/promises";
import path from "node:path";
import c from "picocolors";
import { getMigrationAdapter, listMigrationAdapters } from "./migrate/adapters/index.js";
import { formatMigrationReportHuman, formatMigrationReportJson } from "./migrate/report.js";
import { runMigration } from "./migrate/runner.js";
import type { MigrationOptions } from "./migrate/types.js";

export interface MigrateCommandOptions {
  adapter: string;
  source?: string;
  output?: string;
  dryRun?: boolean;
  format?: "human" | "json";
  report?: string;
}

const DEFAULT_OUTPUT = "./preactpress-docs";

export async function runMigrateCommand(options: MigrateCommandOptions): Promise<number> {
  const adapter = getMigrationAdapter(options.adapter);
  if (!adapter) {
    const available = listMigrationAdapters()
      .map((a) => a.id)
      .join(", ");
    console.error(c.red(`Unknown migration adapter "${options.adapter}". Available: ${available}`));
    return 1;
  }

  const source = path.resolve(options.source ?? process.cwd());
  const output = path.resolve(options.output ?? DEFAULT_OUTPUT);
  const dryRun = Boolean(options.dryRun);

  if (path.resolve(source) === path.resolve(output)) {
    console.error(c.red("Source and output directories must differ."));
    return 1;
  }

  const migrationOptions: MigrationOptions = { source, output, dryRun };

  try {
    const report = await runMigration(adapter, migrationOptions);

    const format = options.format ?? "human";
    const payload =
      format === "json" ? formatMigrationReportJson(report) : formatMigrationReportHuman(report);

    if (options.report) {
      await fs.mkdir(path.dirname(path.resolve(options.report)), { recursive: true });
      await fs.writeFile(path.resolve(options.report), formatMigrationReportJson(report), "utf8");
    } else if (!dryRun) {
      await fs.mkdir(output, { recursive: true });
      await fs.writeFile(
        path.join(output, "migration-report.json"),
        formatMigrationReportJson(report),
        "utf8",
      );
    }

    console.log(payload);

    if (dryRun) {
      console.log(c.yellow("\nDry run complete. Re-run without --dry-run to write files."));
    } else {
      console.log(c.green(`\nMigration output written to ${output}`));
      console.log(c.dim("Next steps:"));
      console.log(`  cd ${path.relative(process.cwd(), output) || "."}`);
      console.log("  pnpm install");
      console.log("  pnpm run dev");
    }

    return 0;
  } catch (err) {
    console.error(c.red("Migration failed."));
    if (err instanceof Error) console.error(err.message);
    return 1;
  }
}

export function printMigrateUsage(): void {
  console.log(
    [
      "",
      c.bold("preactpress migrate") + " <adapter> [options]",
      "",
      c.dim("Adapters:"),
      "  vitepress    Migrate a VitePress documentation site",
      "",
      c.dim("Options:"),
      "  --source <dir>   VitePress project root or docs folder (default: cwd)",
      "  --output <dir>   Migration output directory (default: ./preactpress-docs)",
      "  --dry-run        Analyze and report without writing files",
      "  --format <fmt>   Report format: human (default) or json",
      "  --report <path>  Write JSON migration report to a file",
      "",
      c.dim("Examples:"),
      "  preactpress migrate vitepress --source ./docs",
      "  preactpress migrate vitepress --dry-run",
      "  preactpress migrate vitepress --output ./preactpress-docs",
      "",
      c.dim("Future adapters:"),
      "  docusaurus, starlight (planned)",
      "",
    ].join("\n"),
  );
}
