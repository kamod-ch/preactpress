import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { resolveDynamicRoutes } from "../src/node/dynamicRoutes.js";
import type { SiteConfig } from "../src/node/siteConfig.js";

async function makeSite(): Promise<{ root: string; site: SiteConfig }> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "preactpress-dynamic-"));
  const site: SiteConfig = {
    root,
    srcDir: root,
    srcExclude: [],
    cleanUrls: true,
    rewrites: {},
    mpa: false,
    lastUpdatedGit: false,
    configDir: root,
    outDir: path.join(root, "dist"),
    cacheDir: path.join(root, ".cache"),
    theme: "",
    site: { title: "Test", description: "", base: "/", lang: "en" },
    themeConfig: {},
    markdown: { html: false, linkify: true, typographer: true, emoji: false, math: false },
    head: [],
    build: { sitemap: true, robots: true, feed: false },
    vite: {},
    logger: console as SiteConfig["logger"],
  };
  return { root, site };
}

describe("resolveDynamicRoutes", () => {
  it("generates routes from bracket templates and paths modules", async () => {
    const { root, site } = await makeSite();
    try {
      await fs.mkdir(path.join(root, "packages"), { recursive: true });
      await fs.writeFile(
        path.join(root, "packages", "[pkg].md"),
        `---
title: "{{ params.pkg }}"
---

# {{ params.pkg }}
`,
        "utf8",
      );
      await fs.writeFile(
        path.join(root, "packages", "[pkg].paths.ts"),
        `export default {
  paths() {
    return [
      { params: { pkg: 'preact' } },
      { params: { pkg: 'vite' } }
    ]
  }
}`,
        "utf8",
      );

      const routes = await resolveDynamicRoutes(site);
      expect(routes.map((entry) => entry.route).sort()).toEqual([
        "/packages/preact",
        "/packages/vite",
      ]);
      expect(routes[0].source).toContain("# preact");
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  });
});
