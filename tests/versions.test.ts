import { describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { build } from "../src/node/build.js";
import { check } from "../src/node/check.js";
import { resolveConfig } from "../src/node/config.js";
import { scanAllContentFiles } from "../src/node/content.js";
import { runVersionCommand } from "../src/node/versionCommand.js";
import { PACKAGE_ROOT } from "../src/node/packageRoot.js";
import {
  composeVersionRoute,
  localizedRouteForVersion,
  routePathKey,
  versionFromRoute,
} from "../src/shared/version.js";
import { localeFromRoute } from "../src/shared/locale.js";

describe("versions", () => {
  it("resolves structured version config with aliases", async () => {
    const root = path.join(PACKAGE_ROOT, "templates/versions");
    const site = await resolveConfig(root, "build", "production");
    expect(site.versions.enabled).toBe(true);
    expect(site.versions.current).toBe("2.0");
    expect(site.versions.versions.find((entry) => entry.value === "1.0")?.prefix).toBe(
      "/versions/1.0",
    );
    expect(site.versions.versions.find((entry) => entry.key === "latest")?.isAlias).toBe(true);
  });

  it("maps versioned content trees to stable routes", async () => {
    const root = path.join(PACKAGE_ROOT, "templates/versions");
    const site = await resolveConfig(root, "build", "production");
    const files = await scanAllContentFiles(site);
    const routes = files.map((file) => file.route).sort();
    expect(routes).toContain("/");
    expect(routes).toContain("/guide/getting-started");
    expect(routes).toContain("/de");
    expect(routes).toContain("/versions/1.0");
    expect(routes).toContain("/de/versions/1.0");
    expect(routes).not.toContain("/current/guide/getting-started");
  });

  it("check resolves routes from versioned content trees", async () => {
    const root = path.join(PACKAGE_ROOT, "templates/versions");
    const result = await check(root);
    expect(result.errors).toEqual([]);
    expect(result.routes).toContain("/");
    expect(result.routes).toContain("/guide/getting-started");
    expect(result.routes).toContain("/de");
  });

  it("composes locale and version prefixes consistently", async () => {
    const root = path.join(PACKAGE_ROOT, "templates/versions");
    const site = await resolveConfig(root, "build", "production");
    const archived = site.versions.versions.find(
      (entry) => entry.value === "1.0" && !entry.isAlias,
    )!;
    const locale = localeFromRoute("/de/", site.i18n)!;
    expect(composeVersionRoute("/guide/getting-started", locale, archived)).toBe(
      "/de/versions/1.0/guide/getting-started",
    );
    expect(routePathKey("/de/versions/1.0/guide/getting-started", site.i18n, site.versions)).toBe(
      "/guide/getting-started",
    );
  });

  it("builds versioned docs with search partitioning and archived banner", async () => {
    const root = path.join(PACKAGE_ROOT, "templates/versions");
    await build(root);
    const archived = await fs.readFile(
      path.join(root, "dist", "versions", "1.0", "index.html"),
      "utf8",
    );
    const currentGuide = await fs.readFile(
      path.join(root, "dist", "guide", "getting-started", "index.html"),
      "utf8",
    );
    const search = JSON.parse(
      await fs.readFile(path.join(root, "dist", "preactpress-search.json"), "utf8"),
    ) as Array<{ route: string; version?: string }>;

    expect(archived).toContain("pp-version-banner");
    expect(archived).toContain('rel="canonical"');
    expect(currentGuide).not.toContain("pp-version-banner");
    expect(
      search.some((entry) => entry.route === "/guide/getting-started" && entry.version === "2.0"),
    ).toBe(true);
    expect(
      search.some(
        (entry) => entry.route === "/versions/1.0/guide/getting-started" && entry.version === "1.0",
      ),
    ).toBe(true);
  }, 20_000);

  it("snapshots current docs without overwriting existing versions", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "preactpress-version-cmd-"));
    try {
      await fs.cp(path.join(PACKAGE_ROOT, "templates/versions"), root, { recursive: true });
      const code = await runVersionCommand(root, { value: "1.1.0", label: "1.1", dryRun: true });
      expect(code).toBe(0);
      await expect(fs.access(path.join(root, "versions", "1.1.0"))).rejects.toThrow();
      const writeCode = await runVersionCommand(root, { value: "1.1.0", label: "1.1" });
      expect(writeCode).toBe(0);
      await expect(
        fs.access(path.join(root, "versions", "1.1.0", "index.md")),
      ).resolves.toBeUndefined();
      const overwriteCode = await runVersionCommand(root, { value: "1.1.0", label: "1.1" });
      expect(overwriteCode).toBe(1);
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  }, 20_000);

  it("falls back to version home when a page is missing in another version", async () => {
    const root = path.join(PACKAGE_ROOT, "templates/versions");
    const site = await resolveConfig(root, "build", "production");
    const files = await scanAllContentFiles(site);
    const routes = new Set(files.map((file) => file.route));
    const archived = site.versions.versions.find(
      (entry) => entry.value === "1.0" && !entry.isAlias,
    )!;
    expect(
      localizedRouteForVersion("/api/overview", archived, site.versions, site.i18n, routes),
    ).toBe("/versions/1.0");
  });
});
