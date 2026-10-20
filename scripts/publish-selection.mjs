import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

/** Publish order: typedoc first, then dependents. Remaining plugins are alphabetical. */
const PLUGIN_PUBLISH_ORDER = [
  "plugin-typedoc",
  "plugin-mermaid",
  "plugin-playground",
  "plugin-component-reference",
  "plugin-openapi",
  "plugin-changelog",
];

export const PublishAction = {
  PUBLISH: "publish",
  SKIP_EXISTING: "skip-existing",
  ERROR: "error",
};

/**
 * @typedef {{ dir: string, dirName: string, name: string, version: string, isCore?: boolean }} WorkspacePackage
 * @typedef {{ package: WorkspacePackage, action: string, reason?: string }} PublishDecision
 */

export function listPluginDirNames(packagesDir) {
  return readdirSync(packagesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("plugin-"))
    .map((entry) => entry.name);
}

export function orderPluginDirNames(discovered) {
  const ordered = PLUGIN_PUBLISH_ORDER.filter((name) => discovered.includes(name));
  const remaining = discovered.filter((name) => !ordered.includes(name)).sort();
  return [...ordered, ...remaining];
}

export function readPackageMetadata(packageJsonPath) {
  let raw;
  try {
    raw = readFileSync(packageJsonPath, "utf8");
  } catch (error) {
    return { ok: false, error: `missing package.json at ${packageJsonPath}` };
  }

  let pkg;
  try {
    pkg = JSON.parse(raw);
  } catch {
    return { ok: false, error: `invalid JSON in ${packageJsonPath}` };
  }

  if (!pkg.name || !pkg.version) {
    return { ok: false, error: `package.json at ${packageJsonPath} must include name and version` };
  }

  return { ok: true, name: pkg.name, version: pkg.version };
}

/**
 * @param {string} packageRoot
 * @returns {WorkspacePackage[]}
 */
export function discoverWorkspacePackages(packageRoot) {
  const packagesDir = path.join(packageRoot, "packages");
  const coreMeta = readPackageMetadata(path.join(packageRoot, "package.json"));
  if (!coreMeta.ok) {
    throw new Error(coreMeta.error);
  }

  const core = {
    dir: packageRoot,
    dirName: ".",
    name: coreMeta.name,
    version: coreMeta.version,
    isCore: true,
  };

  const plugins = orderPluginDirNames(listPluginDirNames(packagesDir)).map((dirName) => {
    const meta = readPackageMetadata(path.join(packagesDir, dirName, "package.json"));
    if (!meta.ok) {
      throw new Error(meta.error);
    }
    return {
      dir: path.join(packagesDir, dirName),
      dirName,
      name: meta.name,
      version: meta.version,
      isCore: false,
    };
  });

  return [core, ...plugins];
}

/**
 * @param {WorkspacePackage} pkg
 * @param {{ existsOnRegistry: (name: string, version: string) => Promise<{ ok: true, exists: boolean } | { ok: false, error: string }> }} registry
 * @returns {Promise<PublishDecision>}
 */
export async function classifyPackage(pkg, registry) {
  const lookup = await registry.existsOnRegistry(pkg.name, pkg.version);
  if (!lookup.ok) {
    return {
      package: pkg,
      action: PublishAction.ERROR,
      reason: lookup.error,
    };
  }

  if (lookup.exists) {
    if (pkg.isCore) {
      return {
        package: pkg,
        action: PublishAction.ERROR,
        reason: `core version ${pkg.version} is already published`,
      };
    }
    return {
      package: pkg,
      action: PublishAction.SKIP_EXISTING,
      reason: `version ${pkg.version} already on registry`,
    };
  }

  return { package: pkg, action: PublishAction.PUBLISH };
}

/**
 * @param {WorkspacePackage[]} packages
 * @param {{ existsOnRegistry: (name: string, version: string) => Promise<{ ok: true, exists: boolean } | { ok: false, error: string }> }} registry
 * @returns {Promise<{ decisions: PublishDecision[], hasError: boolean }>}
 */
export async function buildPublishPlan(packages, registry) {
  const decisions = [];
  for (const pkg of packages) {
    const decision = await classifyPackage(pkg, registry);
    decisions.push(decision);
    if (decision.action === PublishAction.ERROR) {
      return { decisions, hasError: true };
    }
  }
  return { decisions, hasError: false };
}

export function summarizePublishPlan(decisions) {
  const lines = [];
  for (const decision of decisions) {
    const prefix = `${decision.package.name}@${decision.package.version}`;
    if (decision.action === PublishAction.PUBLISH) {
      lines.push(`PUBLISH  ${prefix}`);
    } else if (decision.action === PublishAction.SKIP_EXISTING) {
      lines.push(`SKIP     ${prefix} (${decision.reason})`);
    } else {
      lines.push(`ERROR    ${prefix} (${decision.reason})`);
    }
  }
  return lines.join("\n");
}
