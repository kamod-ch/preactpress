#!/usr/bin/env node
/**
 * Scaffold each init template into a temp dir, build + preview it, and capture a
 * home-page screenshot into templates/docs/public/templates/<id>.webp.
 *
 * Usage:
 *   pnpm run capture:template-previews
 *   pnpm run capture:template-previews -- --check
 */
import { spawn } from "node:child_process";
import { access, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { init } from "../dist/node/init.js";
import { build } from "../dist/node/build.js";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(packageRoot, "templates", "docs", "public", "templates");
const templates = ["docs", "hono", "magazine", "default"];
const checkOnly = process.argv.includes("--check");
const host = "127.0.0.1";
const basePort = 4180;

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function runCheck() {
  const missing = [];
  for (const id of templates) {
    const filePath = path.join(outDir, `${id}.webp`);
    if (!(await fileExists(filePath))) missing.push(path.relative(packageRoot, filePath));
  }
  if (missing.length > 0) {
    console.error("Missing template preview screenshots:");
    for (const file of missing) console.error(`  - ${file}`);
    console.error("\nRun: pnpm run capture:template-previews\n");
    process.exit(1);
  }
  console.log(`OK: ${templates.length} template preview screenshots present in public/templates/`);
}

function startPreview(siteRoot, port) {
  const child = spawn(
    process.execPath,
    ["./bin/preactpress.mjs", "preview", siteRoot, "--host", host, "--port", String(port)],
    {
      cwd: packageRoot,
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    },
  );

  let settled = false;
  const ready = new Promise((resolve, reject) => {
    const onData = (chunk) => {
      const text = String(chunk);
      process.stdout.write(text);
      if (text.includes("preactpress preview") && !settled) {
        settled = true;
        resolve();
      }
    };
    child.stdout?.on("data", onData);
    child.stderr?.on("data", (chunk) => {
      process.stderr.write(chunk);
      onData(chunk);
    });
    child.on("error", (err) => {
      if (!settled) {
        settled = true;
        reject(err);
      }
    });
    child.on("exit", (code, signal) => {
      if (!settled) {
        settled = true;
        reject(
          new Error(`preview exited early (${signal ?? code ?? "unknown"}) before becoming ready`),
        );
      }
    });
    setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error(`preview timed out waiting for ready log`));
      }
    }, 60_000);
  });

  return { child, ready };
}

async function stopPreview(child) {
  if (child.killed || child.exitCode !== null) return;
  await new Promise((resolve) => {
    child.once("exit", () => resolve());
    child.kill("SIGTERM");
    setTimeout(() => {
      if (!child.killed && child.exitCode === null) child.kill("SIGKILL");
    }, 3_000);
  });
}

async function captureTemplate(browser, template, port) {
  const siteRoot = await mkdtemp(path.join(tmpdir(), `preactpress-preview-${template}-`));
  console.log(`\nScaffolding ${template} → ${siteRoot}`);
  try {
    await init(siteRoot, { template });
    // Point the scaffolded site at the local package (same as a fresh file: install).
    await linkLocalPackage(siteRoot);

    console.log(`Building ${template}...`);
    await build(siteRoot);

    const preview = startPreview(siteRoot, port);
    try {
      await preview.ready;
      await new Promise((r) => setTimeout(r, 400));

      const page = await browser.newPage({
        viewport: { width: 1280, height: 800 },
        deviceScaleFactor: 1,
      });
      const url = `http://${host}:${port}/`;
      console.log(`Capturing ${url}`);
      await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
      const png = await page.screenshot({ type: "png", fullPage: false });
      await page.close();

      const outPath = path.join(outDir, `${template}.webp`);
      await sharp(png).webp({ quality: 82 }).toFile(outPath);
      console.log(`Wrote ${path.relative(packageRoot, outPath)}`);
    } finally {
      await stopPreview(preview.child);
    }
  } finally {
    await rm(siteRoot, { recursive: true, force: true });
  }
}

async function linkLocalPackage(siteRoot) {
  const { mkdir: mkdirFs, symlink, rm: rmFs, readlink } = await import("node:fs/promises");
  const linkPath = path.join(siteRoot, "node_modules", "@kamod-ch", "preactpress");
  await mkdirFs(path.dirname(linkPath), { recursive: true });
  try {
    const existing = await readlink(linkPath);
    if (path.resolve(path.dirname(linkPath), existing) === packageRoot) return;
    await rmFs(linkPath, { recursive: true, force: true });
  } catch (err) {
    const code = err?.code;
    if (code !== "ENOENT" && code !== "EINVAL" && code !== "ELOOP") throw err;
    try {
      await rmFs(linkPath, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }
  await symlink(packageRoot, linkPath, "dir");
}

async function main() {
  if (checkOnly) {
    await runCheck();
    return;
  }

  await mkdir(outDir, { recursive: true });

  const { spawnSync } = await import("node:child_process");
  const buildResult = spawnSync("pnpm", ["run", "build"], {
    cwd: packageRoot,
    stdio: "inherit",
  });
  if (buildResult.status !== 0) process.exit(buildResult.status ?? 1);

  const browser = await chromium.launch({ headless: true });
  try {
    for (let i = 0; i < templates.length; i++) {
      await captureTemplate(browser, templates[i], basePort + i);
    }
  } finally {
    await browser.close();
  }

  await writeFile(
    path.join(outDir, ".gitkeep"),
    "# Generated by scripts/capture-template-previews.mjs\n",
  );
  console.log("\nDone. Template gallery previews are ready.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
