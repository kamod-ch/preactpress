import fs from "node:fs/promises";
import path from "node:path";
import c from "picocolors";
import type { CheckOptions, CheckResult, DocumentationCheckResult } from "./checkTypes.js";

export function formatCheckJson(result: DocumentationCheckResult): string {
  return `${JSON.stringify(result, null, 2)}\n`;
}

export async function writeCheckOutput(
  result: DocumentationCheckResult,
  outputPath: string,
): Promise<void> {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, formatCheckJson(result), "utf8");
}

export function printDocumentationCheckResult(result: DocumentationCheckResult): void {
  console.log("");
  console.log(c.bold("PreactPress Documentation Check"));
  console.log("");
  console.log(`Score: ${result.score}/100`);
  console.log("");
  console.log(`Errors: ${result.stats.errors}`);
  console.log(`Warnings: ${result.stats.warnings}`);
  console.log(`Broken links: ${result.stats.brokenLinks}`);
  console.log(`Orphan pages: ${result.stats.orphanPages}`);
  console.log(`Missing metadata: ${result.stats.missingMetadata}`);
  console.log("");

  if (result.errors.length === 0 && result.warnings.length === 0) {
    console.log(c.green("No issues found."));
    console.log(c.dim(`${result.routes.length} route(s) checked.`));
    return;
  }

  for (const issue of result.errors) {
    console.log(`${c.red("error")}: ${issue.message}`);
  }
  for (const issue of result.warnings) {
    console.log(`${c.yellow("warning")}: ${issue.message}`);
  }

  console.log("");
  console.log(c.dim(`${result.routes.length} route(s) checked.`));
}

/** @deprecated Use {@link printDocumentationCheckResult}. */
export function printCheckResult(result: CheckResult): void {
  printDocumentationCheckResult(result);
}

export function resolveCheckExitCode(
  result: DocumentationCheckResult,
  options: Pick<CheckOptions, "strict">,
): number {
  if (result.errors.length > 0) return 1;
  if (options.strict && result.warnings.length > 0) return 1;
  return 0;
}

export async function runCheckCommand(
  root: string | undefined,
  options: CheckOptions,
): Promise<number> {
  const { check } = await import("./documentationCheck.js");
  const { resolveConfig } = await import("./config.js");
  const [result, site] = await Promise.all([
    check(root, options),
    resolveConfig(root, "serve", "development"),
  ]);

  if (options.output) {
    await writeCheckOutput(result, options.output);
  }

  if (options.format === "json") {
    console.log(formatCheckJson(result).trimEnd());
  } else {
    printDocumentationCheckResult(result);
  }

  return resolveCheckExitCode(result, {
    strict: Boolean(options.strict || site.check.failOnWarnings),
  });
}
