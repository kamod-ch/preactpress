import path from "node:path";
import { createLogger } from "vite";
import { describe, expect, it } from "vitest";
import { PACKAGE_ROOT } from "../src/node/packageRoot.js";
import { resolveSiteConfig } from "../src/node/resolveSiteConfig.js";
import { scanAllContentFiles } from "../src/node/content.js";
import {
  localizedRouteForWorkspace,
  routePathKeyWithWorkspace,
  workspaceFromRoute,
} from "../src/shared/workspace.js";
import { resolveSidebarForRoute } from "../src/shared/sidebar.js";

function monorepoSite() {
  const root = path.join(PACKAGE_ROOT, "templates/monorepo");
  return resolveSiteConfig(
    {
      site: {
        title: "Kamod Monorepo Docs",
        description: "Unified documentation for UI, Icons, and Hooks packages",
      },
      workspaces: {
        autoDiscover: true,
        versionMode: "package",
        items: [
          { name: "UI", id: "ui", root: "packages/ui", docs: "./docs" },
          { name: "Icons", id: "icons", root: "packages/icons", docs: "./docs" },
          { name: "Hooks", id: "hooks", root: "packages/hooks", docs: "./docs" },
        ],
      },
      themeConfig: {
        sidebar: {
          "/ui/": [{ text: "UI", items: [{ text: "Getting started", link: "/ui/getting-started" }] }],
        },
      },
    },
    { root, configDir: path.join(root, ".preactpress"), logger: createLogger("error") },
  );
}

describe("workspaces", () => {
  it("resolves structured workspace config with package metadata", () => {
    const site = monorepoSite();
    expect(site.workspaces.enabled).toBe(true);
    expect(site.workspaces.workspaces).toHaveLength(3);
    const ui = site.workspaces.workspaces.find((entry) => entry.id === "ui");
    expect(ui?.packageVersion).toBe("1.2.0");
    expect(ui?.prefix).toBe("/ui");
  });

  it("maps workspace docs to prefixed routes without slug collisions", async () => {
    const site = monorepoSite();
    const routes = (await scanAllContentFiles(site)).map((file) => file.route).sort();
    expect(routes).toContain("/");
    expect(routes).toContain("/ui");
    expect(routes).toContain("/ui/getting-started");
    expect(routes).toContain("/icons");
    expect(routes).toContain("/hooks/use-counter");
    expect(routes.filter((route) => route === "/getting-started")).toHaveLength(0);
  });

  it("resolves sidebars per workspace prefix", () => {
    const site = monorepoSite();
    const uiSidebar = resolveSidebarForRoute(
      site.themeConfig.sidebar,
      "/ui/getting-started",
      site.i18n,
      site.versions,
      site.workspaces,
    );
    expect(uiSidebar[0]?.items.some((item) => item.link === "/ui/getting-started")).toBe(true);
  });

  it("localizes workspace routes while preserving page path keys", () => {
    const site = monorepoSite();
    const icons = site.workspaces.workspaces.find((entry) => entry.id === "icons")!;
    const routeSet = new Set(["/icons", "/ui/getting-started"]);
    expect(
      localizedRouteForWorkspace(
        "/ui/getting-started",
        icons,
        site.workspaces,
        site.versions,
        site.i18n,
        routeSet,
      ),
    ).toBe("/icons");
    expect(routePathKeyWithWorkspace("/ui/getting-started", site.i18n, site.versions, site.workspaces)).toBe(
      "/getting-started",
    );
    expect(workspaceFromRoute("/hooks/use-counter", site.workspaces, site.i18n, site.versions)?.id).toBe(
      "hooks",
    );
  });
});
