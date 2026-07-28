import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildPageMarkdown,
  contentFingerprint,
  createRng,
  distributePages,
  pagePath,
} from "./lib/content-generator.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const fixturesRoot = path.resolve(scriptDir, "../fixtures");
const docsRoot = path.join(fixturesRoot, "docs");

function parseArgs(argv) {
  const args = { pages: 100, clean: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--pages" && argv[i + 1]) {
      args.pages = Number(argv[++i]);
    } else if (arg === "--clean") {
      args.clean = true;
    } else if (arg === "--help" || arg === "-h") {
      args.help = true;
    }
  }
  return args;
}

async function removeGeneratedDocs() {
  await fs.rm(docsRoot, { recursive: true, force: true });
}

async function writeManifest(pageCount) {
  const manifest = {
    pageCount,
    seed: "0x707072657373",
    fingerprint: contentFingerprint(pageCount),
    generatedAt: new Date().toISOString(),
  };
  await fs.writeFile(
    path.join(fixturesRoot, ".benchmark-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  return manifest;
}

export async function generateFixture(pageCount, { clean = false } = {}) {
  if (clean) await removeGeneratedDocs();
  await fs.mkdir(docsRoot, { recursive: true });

  const pairs = distributePages(pageCount);
  const rng = createRng();

  for (const [sectionIndex, pageIndex] of pairs) {
    const relPath = pagePath(sectionIndex, pageIndex);
    const absPath = path.join(fixturesRoot, relPath);
    await fs.mkdir(path.dirname(absPath), { recursive: true });
    await fs.writeFile(absPath, buildPageMarkdown(sectionIndex, pageIndex, rng), "utf8");
  }

  return writeManifest(pageCount);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(`Usage: node generate-fixture.mjs [--pages <n>] [--clean]

Generates reproducible Markdown pages under benchmarks/fixtures/docs/.
Default: 100 pages.`);
    return;
  }

  if (!Number.isFinite(args.pages) || args.pages < 1) {
    console.error("Invalid --pages value");
    process.exitCode = 1;
    return;
  }

  const manifest = await generateFixture(args.pages, { clean: args.clean });
  console.log(`Generated ${manifest.pageCount} pages (fingerprint: ${manifest.fingerprint})`);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  await main();
}
