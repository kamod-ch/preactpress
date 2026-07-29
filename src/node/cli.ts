import path from "node:path";
import process from "node:process";
import minimist from "minimist";
import c from "picocolors";
import { PACKAGE_ROOT } from "./packageRoot.js";

const argv = minimist(process.argv.slice(2));
const first = argv._[0] as string | undefined;
const wantsHelp =
  Boolean(argv.help || argv.h) || first === "help" || first === "--help" || first === "-h";

function isPackageRoot(cwd: string): boolean {
  const a = path.resolve(cwd);
  const b = path.resolve(PACKAGE_ROOT);
  if (a === b) return true;
  try {
    return process.cwd() === cwd && path.resolve(process.cwd()) === b;
  } catch {
    return false;
  }
}

function printUsage(): void {
  console.log(
    [
      "",
      c.bold("preactpress") + " <command> [root]",
      "",
      c.dim("Commands:"),
      "  dev       Start Vite dev server",
      "  build     Production build (SSR + static)",
      "  preview   Serve the production build",
      "  check     Validate documentation quality, links, metadata, and config",
      "  workspaces  Run check or build across monorepo documentation sites",
      "  version   Snapshot current docs into versions/<value>",
      "  init      Scaffold .preactpress + starter files in [root] or cwd",
      "  migrate   Migrate from another docs framework (vitepress, …)",
      "            Use --template for starters: docs, blog, product-docs, api-docs,",
      "            saas-docs, knowledge-base, magazine, hono, or versions",
      "",
      c.dim("In this repo (package root, no site):"),
      "  pnpm run dev           Dev server for the bundled ./templates/default site",
      "  pnpm run preview       Build + preview ./templates/default (production output)",
      "",
      c.dim("Options:"),
      "  --port <n>   Port for dev / preview",
      "  --host       Host for dev / preview",
      "  --open       Open browser for dev",
      "  --base <p>   Override configured site.base",
      "  --template <name>  Starter: default, docs, blog, product-docs, api-docs,",
      "                     saas-docs, knowledge-base, magazine, or hono",
      "  --format <fmt>     check output format: human (default) or json",
      "  --strict           Treat check warnings as errors",
      "  --external         Verify external http(s) links during check",
      "  --output <path>    Write check JSON report to a file",
      "  --label <text>     Label for preactpress version snapshots",
      "  --dry-run          Preview preactpress version snapshot without writing files",
      "  -h, --help   Show this help",
      "",
    ].join("\n"),
  );
}

function resolveRootArg(cmd: string, rootArg: string | undefined): string | undefined {
  if (rootArg || !isPackageRoot(process.cwd())) return rootArg;
  if (cmd === "dev" || cmd === "build" || cmd === "preview" || cmd === "serve" || cmd === "check") {
    const templateRoot = path.join(PACKAGE_ROOT, "templates", "default");
    console.log(
      c.yellow(
        `No site root was passed from the PreactPress package root; using bundled template site at ${templateRoot}.`,
      ),
    );
    return templateRoot;
  }
  return rootArg;
}

function positionalRoot(): string | undefined {
  const candidate = argv._[1] ? String(argv._[1]) : undefined;
  return candidate && !candidate.startsWith("-") ? candidate : undefined;
}

function logError(message: string, err?: unknown): void {
  const parts = [c.red(message)];
  if (err && typeof err === "object" && "message" in err) {
    parts.push(String((err as { message: unknown }).message));
  }
  if (err && typeof err === "object" && "stack" in err && process.env.DEBUG) {
    parts.push(String((err as { stack: unknown }).stack));
  }
  console.error(parts.filter(Boolean).join("\n"));
}

async function main(): Promise<void> {
  if (wantsHelp) {
    printUsage();
    return;
  }

  if (!first && isPackageRoot(process.cwd())) {
    printUsage();
    console.log(
      c.yellow(
        "No site command was run because this directory contains the PreactPress CLI sources. Use `pnpm run dev` for the bundled starter site.",
      ),
    );
    return;
  }

  const cmd = first ?? "dev";
  const root = resolveRootArg(cmd, positionalRoot());

  if (cmd === "migrate") {
    const adapter = argv._[1] ? String(argv._[1]) : undefined;
    if (!adapter || adapter === "help" || argv.help || argv.h) {
      const { printMigrateUsage } = await import("./migrateCommand.js");
      printMigrateUsage();
      if (!adapter || adapter === "help") return;
      process.exitCode = 1;
      return;
    }
    const formatArg = argv.format ? String(argv.format) : "human";
    if (formatArg !== "human" && formatArg !== "json") {
      logError(`Unknown migrate format "${formatArg}". Use human or json.`);
      process.exitCode = 1;
      return;
    }
    const { runMigrateCommand } = await import("./migrateCommand.js");
    const exitCode = await runMigrateCommand({
      adapter,
      source: argv.source ? String(argv.source) : undefined,
      output: argv.output ? String(argv.output) : undefined,
      dryRun: Boolean(argv["dry-run"] ?? argv.dryRun),
      format: formatArg,
      report: argv.report ? String(argv.report) : undefined,
    });
    if (exitCode !== 0) process.exitCode = exitCode;
    return;
  }

  if (cmd === "init") {
    const dir = root ? path.resolve(root) : process.cwd();
    const { init } = await import("./init.js");
    const result = await init(dir, {
      template: argv.template ? String(argv.template) : undefined,
    });
    const templateLabel =
      result.template === "default" ? "default template" : `${result.template} template`;
    console.log(
      c.green(`Scaffolded PreactPress site in ${result.root} using the ${templateLabel}`),
    );
    console.log("");
    console.log(c.dim("Next steps:"));
    const rel = path.relative(process.cwd(), result.root);
    if (rel && rel !== ".") {
      const cdTarget = rel.startsWith("..") ? result.root : rel;
      console.log(`  cd ${cdTarget}`);
    }
    console.log("  pnpm install    # or npm install");
    console.log("  pnpm run dev      # http://localhost:5173");
    return;
  }

  if (cmd === "build") {
    const { build } = await import("./build.js");
    await build(root, { base: argv.base ? String(argv.base) : undefined });
    console.log(c.green("Build finished."));
    return;
  }

  if (cmd === "preview" || cmd === "serve") {
    const { preview } = await import("./serve.js");
    await preview(root, {
      port: argv.port ? Number(argv.port) : undefined,
      host: parseHostFlag(argv.host),
      base: argv.base ? String(argv.base) : undefined,
    });
    return;
  }

  if (cmd === "version") {
    const versionValue = argv._[1] ? String(argv._[1]) : undefined;
    if (!versionValue) {
      logError('Usage: preactpress version <value> [--label "Label"] [--dry-run]');
      process.exitCode = 1;
      return;
    }
    const { runVersionCommand } = await import("./versionCommand.js");
    const exitCode = await runVersionCommand(root, {
      value: versionValue,
      label: argv.label ? String(argv.label) : undefined,
      dryRun: Boolean(argv["dry-run"] ?? argv.dryRun),
    });
    if (exitCode !== 0) process.exitCode = exitCode;
    return;
  }

  if (cmd === "workspaces") {
    const sub = argv._[1] ? String(argv._[1]) : undefined;
    if (sub !== "check" && sub !== "build") {
      logError("Usage: preactpress workspaces check|build [root]");
      process.exitCode = 1;
      return;
    }
    const { runWorkspacesCommand } = await import("./workspacesCommand.js");
    const exitCode = await runWorkspacesCommand({ command: sub, root });
    if (exitCode !== 0) process.exitCode = exitCode;
    return;
  }

  if (cmd === "check") {
    const { runCheckCommand } = await import("./checkOutput.js");
    const formatArg = argv.format ? String(argv.format) : "human";
    if (formatArg !== "human" && formatArg !== "json") {
      logError(`Unknown check format "${formatArg}". Use human or json.`);
      process.exitCode = 1;
      return;
    }
    const exitCode = await runCheckCommand(root, {
      strict: Boolean(argv.strict),
      external: Boolean(argv.external),
      format: formatArg,
      output: argv.output ? String(argv.output) : undefined,
    });
    if (exitCode !== 0) process.exitCode = exitCode;
    return;
  }

  if (cmd === "dev") {
    const { createServer } = await import("./server.js");
    const port = argv.port ? Number(argv.port) : undefined;
    const server = await createServer(root, {
      port,
      strictPort: port !== undefined,
      host: parseHostFlag(argv.host),
      open: Boolean(argv.open),
      base: argv.base ? String(argv.base) : undefined,
    });
    await server.listen();
    server.printUrls();
    return;
  }

  logError(`Unknown command "${cmd}". Try dev, build, preview, check, version, migrate, or init.`);
  process.exitCode = 1;
}

function parseHostFlag(value: unknown): string | boolean | undefined {
  if (value === undefined) return undefined;
  if (value === true) return true;
  return String(value);
}

main().catch((err) => {
  logError("preactpress failed.", err);
  process.exit(1);
});
