import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  PublishAction,
  buildPublishPlan,
  classifyPackage,
  discoverWorkspacePackages,
  orderPluginDirNames,
  summarizePublishPlan,
} from "../scripts/publish-selection.mjs";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("publish-selection", () => {
  it("orders plugins with typedoc before dependents and discovers new plugin dirs", () => {
    const ordered = orderPluginDirNames([
      "plugin-changelog",
      "plugin-typedoc",
      "plugin-new-example",
    ]);
    expect(ordered[0]).toBe("plugin-typedoc");
    expect(ordered).toContain("plugin-new-example");
    expect(ordered.indexOf("plugin-typedoc")).toBeLessThan(ordered.indexOf("plugin-changelog"));
  });

  it("publishes new core and skips unchanged plugins", async () => {
    const core = {
      dir: packageRoot,
      dirName: ".",
      name: "@kamod-ch/preactpress",
      version: "9.9.9",
      isCore: true,
    };
    const plugin = {
      dir: path.join(packageRoot, "packages/plugin-changelog"),
      dirName: "plugin-changelog",
      name: "@preactpress/plugin-changelog",
      version: "0.1.0",
      isCore: false,
    };

    const registry = {
      existsOnRegistry: async (name: string, version: string) => {
        if (name === core.name) return { ok: true, exists: false };
        if (name === plugin.name && version === "0.1.0") return { ok: true, exists: true };
        return { ok: true, exists: false };
      },
    };

    const { decisions, hasError } = await buildPublishPlan([core, plugin], registry);
    expect(hasError).toBe(false);
    expect(decisions[0]?.action).toBe(PublishAction.PUBLISH);
    expect(decisions[1]?.action).toBe(PublishAction.SKIP_EXISTING);
    expect(summarizePublishPlan(decisions)).toContain("SKIP");
    expect(summarizePublishPlan(decisions)).toContain("PUBLISH");
  });

  it("fails when core version already exists", async () => {
    const core = {
      dir: packageRoot,
      dirName: ".",
      name: "@kamod-ch/preactpress",
      version: "3.0.1",
      isCore: true,
    };
    const decision = await classifyPackage(core, {
      existsOnRegistry: async () => ({ ok: true, exists: true }),
    });
    expect(decision.action).toBe(PublishAction.ERROR);
  });

  it("fails closed on registry errors", async () => {
    const pkg = {
      dir: packageRoot,
      dirName: ".",
      name: "@kamod-ch/preactpress",
      version: "9.9.9",
      isCore: true,
    };
    const decision = await classifyPackage(pkg, {
      existsOnRegistry: async () => ({ ok: false, error: "network down" }),
    });
    expect(decision.action).toBe(PublishAction.ERROR);
  });

  it("discovers workspace packages from the repository root", () => {
    const packages = discoverWorkspacePackages(packageRoot);
    expect(packages[0]?.isCore).toBe(true);
    expect(packages.some((entry) => entry.dirName === "plugin-typedoc")).toBe(true);
    expect(packages.some((entry) => entry.dirName === "plugin-changelog")).toBe(true);
  });
});
