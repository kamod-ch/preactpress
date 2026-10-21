#!/usr/bin/env node
/**
 * Build gallery starters for GitHub Pages live demos under <out>/demos/<id>/.
 * Skips `docs` — the docs site root is already that starter.
 *
 * Usage:
 *   node ./scripts/build-template-demos.mjs --out templates/docs/dist --pages-base /preactpress/
 */
import { cp, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { init } from "../dist/node/init.js";
import { build } from "../dist/node/build.js";
import {
  GALLERY_TEMPLATES,
  LIVE_DEMO_BUILD_IDS,
  demoPublicBase,
  normalizePagesBase,
} from "./gallery-templates.mjs";
import { linkLocalPackage } from "./link-local-preactpress.mjs";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1 || index >= process.argv.length - 1) return undefined;
  return process.argv[index + 1];
}

async function buildOneDemo(templateId, outRoot, pagesBase) {
  const siteRoot = await mkdtemp(path.join(tmpdir(), `preactpress-demo-${templateId}-`));
  const buildBase = demoPublicBase(pagesBase, templateId);
  const destDir = path.join(outRoot, "demos", templateId);

  console.log(`\nBuilding live demo: ${templateId}`);
  console.log(`  scaffold → ${siteRoot}`);
  console.log(`  base     → ${buildBase}`);
  console.log(`  output   → ${path.relative(packageRoot, destDir)}`);

  try {
    await init(siteRoot, { template: templateId });
    await linkLocalPackage(siteRoot);
    await build(siteRoot, { base: buildBase });
    await rm(destDir, { recursive: true, force: true });
    await mkdir(path.dirname(destDir), { recursive: true });
    await cp(path.join(siteRoot, "dist"), destDir, { recursive: true });
  } finally {
    await rm(siteRoot, { recursive: true, force: true });
  }
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function writeDemoIndex(outRoot, pagesBase) {
  const base = normalizePagesBase(pagesBase);
  const items = GALLERY_TEMPLATES.map((entry) => {
    const href = demoPublicBase(pagesBase, entry.id);
    const pathSuffix = href.slice(base.length) || "(site root)";
    return `<li><a href="${escapeHtml(href)}">${escapeHtml(entry.name)}</a> <span>(${escapeHtml(pathSuffix)})</span></li>`;
  }).join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PreactPress template demos</title>
    <style>
      body { font-family: system-ui, sans-serif; max-width: 40rem; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; }
      h1 { font-size: 1.5rem; }
      ul { padding-left: 1.25rem; }
      li { margin: 0.5rem 0; }
      span { color: #64748b; font-size: 0.9rem; }
      a { color: #0f766e; font-weight: 600; }
    </style>
  </head>
  <body>
    <h1>PreactPress template demos</h1>
    <p>Each link opens a static build of that init starter. The documentation site itself is the live <strong>docs</strong> template.</p>
    <ul>
${items}
    </ul>
    <p><a href="${escapeHtml(base)}">← Back to PreactPress docs</a></p>
  </body>
</html>
`;

  await mkdir(path.join(outRoot, "demos"), { recursive: true });
  await writeFile(path.join(outRoot, "demos", "index.html"), html, "utf8");
}

async function main() {
  const outArg = readArg("--out");
  const pagesBaseArg = readArg("--pages-base") ?? "/";
  if (!outArg) {
    console.error(
      "Usage: node ./scripts/build-template-demos.mjs --out <dir> [--pages-base /repo/]",
    );
    process.exit(1);
  }

  const outRoot = path.resolve(outArg);
  const pagesBase = normalizePagesBase(pagesBaseArg);

  await mkdir(outRoot, { recursive: true });

  for (const templateId of LIVE_DEMO_BUILD_IDS) {
    await buildOneDemo(templateId, outRoot, pagesBase);
  }

  await writeDemoIndex(outRoot, pagesBase);
  console.log(
    `\nDone. Live demos are in ${path.relative(packageRoot, path.join(outRoot, "demos"))}/`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
