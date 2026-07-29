import c from "picocolors";
import type { MigrationReport } from "./types.js";

export function createEmptyReport(
  adapter: string,
  sourceRoot: string,
  outputRoot: string,
  dryRun: boolean,
): MigrationReport {
  return {
    adapter,
    sourceRoot,
    outputRoot,
    dryRun,
    startedAt: new Date().toISOString(),
    finishedAt: "",
    migrated: [],
    warnings: [],
    manualTasks: [],
    stats: {
      filesWritten: 0,
      filesSkipped: 0,
      markdownFiles: 0,
      assetFiles: 0,
      vueComponents: 0,
    },
  };
}

export function formatMigrationReportHuman(report: MigrationReport): string {
  const lines: string[] = [
    "",
    c.bold("PreactPress Migration Report"),
    c.dim(`Adapter: ${report.adapter}`),
    c.dim(`Source: ${report.sourceRoot}`),
    c.dim(`Output: ${report.outputRoot}`),
    report.dryRun ? c.yellow("Mode: dry-run (no files written)") : c.green("Mode: write"),
    "",
  ];

  const migrated = report.migrated.filter((item) => item.status === "migrated");
  if (migrated.length > 0) {
    lines.push(c.bold("Automatically migrated"));
    for (const item of migrated) {
      const target = item.target ? ` → ${item.target}` : "";
      lines.push(`  [${item.category}] ${item.message}${target}`);
    }
    lines.push("");
  }

  if (report.warnings.length > 0) {
    lines.push(c.bold(c.yellow("Warnings")));
    for (const warning of report.warnings) {
      lines.push(`  ${warning.source}: ${warning.message}`);
      if (warning.hint) lines.push(c.dim(`    ${warning.hint}`));
    }
    lines.push("");
  }

  if (report.manualTasks.length > 0) {
    lines.push(c.bold("Manual follow-up"));
    for (const task of report.manualTasks) {
      lines.push(`  [${task.category}] ${task.task}`);
      if (task.source) lines.push(c.dim(`    Source: ${task.source}`));
      if (task.hint) lines.push(c.dim(`    ${task.hint}`));
    }
    lines.push("");
  }

  lines.push(c.bold("Summary"));
  lines.push(`  Markdown files: ${report.stats.markdownFiles}`);
  lines.push(`  Asset files: ${report.stats.assetFiles}`);
  lines.push(`  Vue components detected: ${report.stats.vueComponents}`);
  lines.push(
    report.dryRun
      ? `  Would write: ${report.stats.filesWritten} files`
      : `  Written: ${report.stats.filesWritten} files`,
  );
  if (report.stats.filesSkipped > 0) {
    lines.push(`  Skipped (already exist): ${report.stats.filesSkipped}`);
  }

  return lines.join("\n");
}

export function formatMigrationReportJson(report: MigrationReport): string {
  return `${JSON.stringify(report, null, 2)}\n`;
}
