import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { detectWorkspacePackages } from "../src/node/detectWorkspacePackages.js";
import { PACKAGE_ROOT } from "../src/node/packageRoot.js";

describe("detectWorkspacePackages", () => {
  it("detects pnpm workspace packages", () => {
    const root = path.join(PACKAGE_ROOT, "templates/monorepo");
    const packages = detectWorkspacePackages(root);
    expect(packages.map((entry) => entry.name).sort()).toEqual([
      "@example/hooks",
      "@example/icons",
      "@example/ui",
    ]);
    const hooks = packages.find((entry) => entry.name === "@example/hooks");
    expect(hooks?.dependencies).toContain("@example/ui");
  });

  it("parses pnpm-workspace.yaml package patterns", () => {
    const root = path.join(PACKAGE_ROOT, "templates/monorepo");
    expect(fs.existsSync(path.join(root, "pnpm-workspace.yaml"))).toBe(true);
    const packages = detectWorkspacePackages(root);
    expect(packages.length).toBeGreaterThanOrEqual(3);
  });
});
