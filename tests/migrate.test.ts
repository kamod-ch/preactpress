import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getMigrationAdapter } from "../src/node/migrate/adapters/index.js";
import {
  detectVitePressProject,
  extractConfigFromSource,
  loadVitePressConfig,
  planVitePressMigration,
  resolveVitePressLayout,
} from "../src/node/migrate/adapters/vitepress/analyze.js";
import { runMigration } from "../src/node/migrate/runner.js";
import { PACKAGE_ROOT } from "../src/node/packageRoot.js";

const FIXTURES = path.join(PACKAGE_ROOT, "tests", "fixtures");

describe("migrate vitepress adapter", () => {
  it("registers the vitepress adapter", () => {
    const adapter = getMigrationAdapter("vitepress");
    expect(adapter?.id).toBe("vitepress");
    expect(adapter?.label).toBe("VitePress");
  });

  it("detects minimal VitePress fixtures", async () => {
    const root = path.join(FIXTURES, "vitepress-minimal");
    expect(await detectVitePressProject(root)).toBe(true);
    const layout = await resolveVitePressLayout(root);
    expect(layout.configPath).toContain("config.mjs");
    expect(layout.publicDir).toContain("public");
  });

  it("loads config from .mjs fixtures", async () => {
    const configPath = path.join(FIXTURES, "vitepress-minimal", ".vitepress", "config.mjs");
    const config = await loadVitePressConfig(configPath);
    expect(config.title).toBe("Minimal VitePress");
    expect(config.themeConfig?.nav).toHaveLength(2);
    expect(config.sitemap?.hostname).toBe("https://example.com");
  });

  it("extracts theme config from TypeScript-like source", () => {
    const source = `
      export default {
        title: 'Demo',
        themeConfig: {
          nav: [{ text: 'Home', link: '/' }],
          sidebar: [{ text: 'Guide', items: [{ text: 'Intro', link: '/guide/' }] }],
        },
        locales: {
          root: { label: 'English', lang: 'en' },
          de: { label: 'Deutsch', lang: 'de', link: '/de/' },
        },
        head: [['meta', { name: 'theme-color', content: '#fff' }]],
        sitemap: { hostname: 'https://docs.example.com' },
      };
    `;
    const parsed = extractConfigFromSource(source);
    expect(parsed.title).toBe("Demo");
    expect(parsed.themeConfig?.nav?.[0]?.text).toBe("Home");
    expect(parsed.locales?.de?.label).toBe("Deutsch");
    expect(parsed.head?.[0]?.[1]).toMatchObject({ name: "theme-color" });
    expect(parsed.sitemap?.hostname).toBe("https://docs.example.com");
  });

  it("plans markdown, assets, and config migration", async () => {
    const source = path.join(FIXTURES, "vitepress-minimal");
    const plan = await planVitePressMigration({ source, output: "/tmp/out", dryRun: true });

    expect(plan.files.some((f) => f.targetPath === "index.md")).toBe(true);
    expect(plan.files.some((f) => f.targetPath === "guide/getting-started.md")).toBe(true);
    expect(plan.files.some((f) => f.targetPath === "public/logo.svg")).toBe(true);
    expect(plan.configSnippet).toContain("defineConfig");
    expect(plan.configSnippet).toContain("Minimal VitePress");

    const gettingStarted = plan.files.find((f) => f.targetPath === "guide/getting-started.md");
    expect(gettingStarted?.content).toContain("::: code-group");
    expect(gettingStarted?.content).toContain("](./index)");
    expect(gettingStarted?.content).not.toContain(".md)");
  });

  it("maps i18n locales into the generated config", async () => {
    const source = path.join(FIXTURES, "vitepress-i18n");
    const plan = await planVitePressMigration({ source, output: "/tmp/out", dryRun: true });
    expect(plan.configSnippet).toContain("locales");
    expect(plan.configSnippet).toContain("Deutsch");
    expect(plan.files.some((f) => f.targetPath === "de/index.md")).toBe(true);
  });

  it("warns about Vue components and theme SFCs", async () => {
    const source = path.join(FIXTURES, "vitepress-advanced");
    const plan = await planVitePressMigration({ source, output: "/tmp/out", dryRun: true });

    expect(plan.warnings.some((w) => w.message.includes("Vue component"))).toBe(true);
    expect(plan.manualTasks.some((t) => t.task.includes("Port Vue"))).toBe(true);
    expect(plan.warnings.some((w) => w.message.includes("DemoBadge.vue"))).toBe(true);
  });

  it("runs dry-run without writing files", async () => {
    const source = path.join(FIXTURES, "vitepress-minimal");
    const output = await fs.mkdtemp(path.join(os.tmpdir(), "pp-migrate-dry-"));
    try {
      const adapter = getMigrationAdapter("vitepress")!;
      const report = await runMigration(adapter, { source, output, dryRun: true });
      expect(report.dryRun).toBe(true);
      expect(report.stats.markdownFiles).toBeGreaterThan(0);
      await expect(fs.access(path.join(output, "index.md"))).rejects.toThrow();
      await expect(fs.access(path.join(output, ".preactpress", "config.ts"))).rejects.toThrow();
    } finally {
      await fs.rm(output, { recursive: true, force: true });
    }
  });

  it("writes migrated output without overwriting existing files", async () => {
    const source = path.join(FIXTURES, "vitepress-minimal");
    const output = await fs.mkdtemp(path.join(os.tmpdir(), "pp-migrate-write-"));
    try {
      const adapter = getMigrationAdapter("vitepress")!;
      const report = await runMigration(adapter, { source, output, dryRun: false });

      expect(report.stats.filesWritten).toBeGreaterThan(0);
      await expect(fs.access(path.join(output, "index.md"))).resolves.toBeUndefined();
      await expect(
        fs.access(path.join(output, ".preactpress", "config.ts")),
      ).resolves.toBeUndefined();
      await expect(fs.access(path.join(output, "public", "logo.svg"))).resolves.toBeUndefined();

      const logo = await fs.readFile(path.join(output, "public", "logo.svg"), "utf8");
      expect(logo).toContain("fixture-logo");

      const skipped = await runMigration(adapter, { source, output, dryRun: false });
      expect(skipped.stats.filesSkipped).toBeGreaterThan(0);
    } finally {
      await fs.rm(output, { recursive: true, force: true });
    }
  });

  it("never writes into the source directory", async () => {
    const source = await fs.mkdtemp(path.join(os.tmpdir(), "pp-migrate-source-"));
    const fixture = path.join(FIXTURES, "vitepress-minimal");
    await fs.cp(fixture, source, { recursive: true });
    try {
      const adapter = getMigrationAdapter("vitepress")!;
      await expect(
        runMigration(adapter, { source, output: source, dryRun: false }),
      ).rejects.toThrow(/must differ/i);
    } finally {
      await fs.rm(source, { recursive: true, force: true });
    }
  });
});
