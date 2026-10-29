import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  PublishAction,
  PublishMode,
  PREACTPRESS_REPO_URL,
  buildPublishPlan,
  classifyPackage,
  discoverWorkspacePackages,
  orderPluginDirNames,
  readPackageMetadata,
  resolveDistTag,
  summarizePublishPlan,
  verifyRegistryReleaseEvidence,
} from "../scripts/publish-selection.mjs";
import { executePublishPlan } from "../scripts/publish-execution.mjs";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const releaseEvidence = (commitSha, directory = ".") => ({
  gitHead: commitSha,
  repositoryUrl: PREACTPRESS_REPO_URL,
  repositoryDirectory: directory,
  provenanceUrl: "https://github.com/kamod-ch/preactpress/attestations/123",
});

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

  it("1. plans publish for all packages when no versions exist on the registry", async () => {
    const packages = discoverWorkspacePackages(packageRoot).slice(0, 2);
    const registry = {
      existsOnRegistry: async () => ({ ok: true, exists: false }),
    };
    const { decisions, hasError } = await buildPublishPlan(packages, registry);
    expect(hasError).toBe(false);
    expect(decisions.every((entry) => entry.action === PublishAction.PUBLISH)).toBe(true);
  });

  it("publishes new core and skips unchanged plugins in strict mode", async () => {
    const core = {
      dir: packageRoot,
      dirName: ".",
      name: "@kamod-ch/preactpress",
      version: "9.9.9",
      isCore: true,
      directory: ".",
    };
    const plugin = {
      dir: path.join(packageRoot, "packages/plugin-changelog"),
      dirName: "plugin-changelog",
      name: "@preactpress/plugin-changelog",
      version: "0.1.0",
      isCore: false,
      directory: "packages/plugin-changelog",
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

  it("2. fails in strict mode when core version already exists", async () => {
    const core = {
      dir: packageRoot,
      dirName: ".",
      name: "@kamod-ch/preactpress",
      version: "3.0.1",
      isCore: true,
      directory: ".",
    };
    const decision = await classifyPackage(
      core,
      {
        existsOnRegistry: async () => ({ ok: true, exists: true }),
      },
      { mode: PublishMode.STRICT },
    );
    expect(decision.action).toBe(PublishAction.ERROR);
  });

  it("3. recovery skips verified core and publishes missing plugins", async () => {
    const commitSha = "abc123deadbeef";
    const core = {
      dir: packageRoot,
      dirName: ".",
      name: "@kamod-ch/preactpress",
      version: "3.2.0",
      isCore: true,
      directory: ".",
    };
    const plugin = {
      dir: path.join(packageRoot, "packages/plugin-changelog"),
      dirName: "plugin-changelog",
      name: "@preactpress/plugin-changelog",
      version: "0.2.0",
      isCore: false,
      directory: "packages/plugin-changelog",
    };

    const registry = {
      existsOnRegistry: async (name: string) => ({
        ok: true,
        exists: name === core.name,
      }),
      getReleaseEvidence: async (name: string) => ({
        ok: true,
        evidence: releaseEvidence(
          commitSha,
          name === core.name ? "." : "packages/plugin-changelog",
        ),
      }),
    };

    const { decisions, hasError } = await buildPublishPlan([core, plugin], registry, {
      mode: PublishMode.RECOVER,
      expectedCommitSha: commitSha,
    });

    expect(hasError).toBe(false);
    expect(decisions[0]?.action).toBe(PublishAction.SKIP_EXISTING);
    expect(decisions[1]?.action).toBe(PublishAction.PUBLISH);
  });

  it("4. recovery rejects existing versions with conflicting gitHead evidence", async () => {
    const core = {
      dir: packageRoot,
      dirName: ".",
      name: "@kamod-ch/preactpress",
      version: "3.2.0",
      isCore: true,
      directory: ".",
    };
    const decision = await classifyPackage(
      core,
      {
        existsOnRegistry: async () => ({ ok: true, exists: true }),
        getReleaseEvidence: async () => ({
          ok: true,
          evidence: releaseEvidence("other-commit"),
        }),
      },
      { mode: PublishMode.RECOVER, expectedCommitSha: "expected-commit" },
    );
    expect(decision.action).toBe(PublishAction.ERROR);
    expect(decision.reason).toContain("does not match expected release commit");
  });

  it("5. fails closed on registry auth/network errors", async () => {
    const pkg = {
      dir: packageRoot,
      dirName: ".",
      name: "@kamod-ch/preactpress",
      version: "9.9.9",
      isCore: true,
      directory: ".",
    };
    const decision = await classifyPackage(pkg, {
      existsOnRegistry: async () => ({ ok: false, error: "registry lookup failed (auth/network)" }),
    });
    expect(decision.action).toBe(PublishAction.ERROR);
  });

  it("6. excludes private packages from the publish set", () => {
    const tempRoot = mkdtempSync(path.join(tmpdir(), "preactpress-publish-"));
    writeFileSync(
      path.join(tempRoot, "package.json"),
      JSON.stringify({
        name: "@kamod-ch/preactpress",
        version: "1.0.0",
        publishConfig: { access: "public" },
      }),
    );
    const packagesDir = path.join(tempRoot, "packages");
    mkdirSync(packagesDir, { recursive: true });
    const privateDir = path.join(packagesDir, "plugin-private");
    mkdirSync(privateDir);
    writeFileSync(
      path.join(privateDir, "package.json"),
      JSON.stringify({
        name: "@preactpress/plugin-private",
        version: "0.0.1",
        private: true,
      }),
    );

    const packages = discoverWorkspacePackages(tempRoot);
    expect(packages.some((entry) => entry.name === "@preactpress/plugin-private")).toBe(false);
    expect(readPackageMetadata(path.join(privateDir, "package.json")).private).toBe(true);
  });

  it("8. rejects prerelease versions without an explicit non-latest dist-tag", () => {
    expect(resolveDistTag("1.0.0-beta.1", undefined).ok).toBe(false);
    expect(resolveDistTag("1.0.0-beta.1", "latest").ok).toBe(false);
    expect(resolveDistTag("1.0.0-beta.1", "next").ok).toBe(true);
    expect(resolveDistTag("1.0.0", undefined)).toEqual({ ok: true, tag: "latest" });
  });

  it("discovers workspace packages from the repository root", () => {
    const packages = discoverWorkspacePackages(packageRoot);
    expect(packages[0]?.isCore).toBe(true);
    expect(packages.some((entry) => entry.dirName === "plugin-typedoc")).toBe(true);
    expect(packages.every((entry) => entry.directory)).toBe(true);
  });

  it("verifyRegistryReleaseEvidence requires gitHead and repository.url", () => {
    const bad = verifyRegistryReleaseEvidence(
      {
        gitHead: null,
        repositoryUrl: "https://example.com/other.git",
        repositoryDirectory: null,
      },
      { commitSha: "abc", directory: "packages/plugin-typedoc" },
    );
    expect(bad.ok).toBe(false);
    expect(bad.issues?.length).toBeGreaterThan(0);
  });
});

describe("publish execution", () => {
  it("7. dry-run never calls npm publish", async () => {
    const calls: string[][] = [];
    const runExecFile = async (_file: string, args: string[]) => {
      calls.push(args);
      return { stdout: "" };
    };
    await executePublishPlan(
      [
        {
          package: {
            dir: packageRoot,
            dirName: ".",
            name: "@kamod-ch/preactpress",
            version: "9.9.9",
            isCore: true,
            directory: ".",
          },
          action: PublishAction.PUBLISH,
        },
      ],
      { distTag: "latest", dryRun: true, runExecFile },
    );
    expect(calls.some((args) => args[0] === "publish")).toBe(false);
    expect(calls.some((args) => args.includes("--dry-run"))).toBe(true);
  });

  it("9. stops publishing after the first npm publish failure", async () => {
    const calls: string[][] = [];
    const runExecFile = async (_file: string, args: string[]) => {
      calls.push(args);
      if (args[0] === "publish") {
        throw new Error("publish failed");
      }
      return { stdout: "" };
    };

    await expect(
      executePublishPlan(
        [
          {
            package: {
              dir: packageRoot,
              dirName: ".",
              name: "@kamod-ch/preactpress",
              version: "9.9.9",
              isCore: true,
              directory: ".",
            },
            action: PublishAction.PUBLISH,
          },
          {
            package: {
              dir: path.join(packageRoot, "packages/plugin-changelog"),
              dirName: "plugin-changelog",
              name: "@preactpress/plugin-changelog",
              version: "9.9.9",
              isCore: false,
              directory: "packages/plugin-changelog",
            },
            action: PublishAction.PUBLISH,
          },
        ],
        { distTag: "latest", dryRun: false, runExecFile },
      ),
    ).rejects.toThrow("publish failed");

    expect(calls.filter((args) => args[0] === "publish")).toHaveLength(1);
  });
});
