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

export const PREACTPRESS_REPO_URL = "git+https://github.com/kamod-ch/preactpress.git";
export const PREACTPRESS_REPO_CANONICAL = "https://github.com/kamod-ch/preactpress";

export const PublishMode = {
  STRICT: "strict",
  RECOVER: "recover",
};

export const PublishAction = {
  PUBLISH: "publish",
  SKIP_EXISTING: "skip-existing",
  ERROR: "error",
};

/**
 * @typedef {{ dir: string, dirName: string, name: string, version: string, isCore?: boolean, directory: string, private?: boolean }} WorkspacePackage
 * @typedef {{ package: WorkspacePackage, action: string, reason?: string }} PublishDecision
 * @typedef {{ gitHead: string | null, repositoryUrl: string | null, repositoryDirectory: string | null, provenanceUrl?: string | null }} ReleaseEvidence
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

export function normalizeRepositoryUrl(url) {
  if (!url || typeof url !== "string") {
    return null;
  }
  return url
    .trim()
    .replace(/^git\+/, "")
    .replace(/\.git$/i, "")
    .replace(/\/+$/, "")
    .toLowerCase();
}

export function isPrereleaseVersion(version) {
  const match = /^(\d+\.\d+\.\d+)(-.*)?$/u.exec(version);
  if (!match) {
    return version.includes("-");
  }
  return Boolean(match[2]);
}

/**
 * @param {string} version
 * @param {string | undefined} explicitTag
 */
export function resolveDistTag(version, explicitTag) {
  const prerelease = isPrereleaseVersion(version);
  const tag = explicitTag ?? "latest";
  if (prerelease && tag === "latest") {
    return {
      ok: false,
      error:
        'Prerelease versions require an explicit dist-tag other than "latest" (for example --tag next).',
    };
  }
  if (!tag) {
    return { ok: false, error: "A dist-tag is required for npm publish." };
  }
  return { ok: true, tag };
}

export function readPackageMetadata(packageJsonPath) {
  let raw;
  try {
    raw = readFileSync(packageJsonPath, "utf8");
  } catch {
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

  if (pkg.private === true) {
    return {
      ok: true,
      name: pkg.name,
      version: pkg.version,
      private: true,
    };
  }

  const access = pkg.publishConfig?.access;
  if (access && access !== "public") {
    return {
      ok: false,
      error: `package ${pkg.name} must use publishConfig.access "public" (found "${access}")`,
    };
  }

  return { ok: true, name: pkg.name, version: pkg.version, private: false };
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
  if (coreMeta.private) {
    throw new Error("core package must not be private");
  }

  const core = {
    dir: packageRoot,
    dirName: ".",
    name: coreMeta.name,
    version: coreMeta.version,
    isCore: true,
    directory: ".",
  };

  const plugins = orderPluginDirNames(listPluginDirNames(packagesDir)).flatMap((dirName) => {
    const meta = readPackageMetadata(path.join(packagesDir, dirName, "package.json"));
    if (!meta.ok) {
      throw new Error(meta.error);
    }
    if (meta.private) {
      return [];
    }
    return [
      {
        dir: path.join(packagesDir, dirName),
        dirName,
        name: meta.name,
        version: meta.version,
        isCore: false,
        directory: `packages/${dirName}`,
      },
    ];
  });

  return [core, ...plugins];
}

/**
 * @param {ReleaseEvidence} evidence
 * @param {{ commitSha: string, repoUrl?: string, directory?: string }} expected
 */
export function verifyRegistryReleaseEvidence(evidence, expected) {
  const issues = [];
  const expectedRepo = normalizeRepositoryUrl(expected.repoUrl ?? PREACTPRESS_REPO_URL);

  if (!evidence.gitHead) {
    issues.push("registry metadata has no gitHead (cannot tie version to this commit)");
  } else if (evidence.gitHead !== expected.commitSha) {
    issues.push(
      `registry gitHead ${evidence.gitHead} does not match expected release commit ${expected.commitSha}`,
    );
  }

  const registryRepo = normalizeRepositoryUrl(evidence.repositoryUrl);
  if (!registryRepo || registryRepo !== expectedRepo) {
    issues.push(
      "registry repository.url does not match git+https://github.com/kamod-ch/preactpress.git",
    );
  }

  if (expected.directory && expected.directory !== ".") {
    if (evidence.repositoryDirectory !== expected.directory) {
      issues.push(
        `registry repository.directory is "${evidence.repositoryDirectory ?? "missing"}", expected "${expected.directory}"`,
      );
    }
  }

  if (evidence.provenanceUrl) {
    const url = evidence.provenanceUrl.toLowerCase();
    if (!url.includes("github.com/kamod-ch/preactpress")) {
      issues.push("provenance attestation is not linked to github.com/kamod-ch/preactpress");
    }
  }

  if (issues.length > 0) {
    return {
      ok: false,
      issues,
      guidance:
        "Do not use --recover. Confirm the version belongs to this release (gitHead + repository), or publish missing packages from a new version bump.",
    };
  }

  return { ok: true };
}

/**
 * @param {WorkspacePackage} pkg
 * @param {{ existsOnRegistry: (name: string, version: string) => Promise<{ ok: true, exists: boolean } | { ok: false, error: string }>, getReleaseEvidence?: (name: string, version: string) => Promise<{ ok: true, evidence: ReleaseEvidence } | { ok: false, error: string }> }} registry
 * @param {{ mode?: string, expectedCommitSha?: string }} [options]
 * @returns {Promise<PublishDecision>}
 */
export async function classifyPackage(pkg, registry, options = {}) {
  const mode = options.mode ?? PublishMode.STRICT;
  const lookup = await registry.existsOnRegistry(pkg.name, pkg.version);
  if (!lookup.ok) {
    return {
      package: pkg,
      action: PublishAction.ERROR,
      reason: lookup.error,
    };
  }

  if (!lookup.exists) {
    return { package: pkg, action: PublishAction.PUBLISH };
  }

  if (mode === PublishMode.STRICT) {
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

  if (!options.expectedCommitSha) {
    return {
      package: pkg,
      action: PublishAction.ERROR,
      reason: "recovery mode requires an expected release commit (--commit or manifest commitSha)",
    };
  }

  if (!registry.getReleaseEvidence) {
    return {
      package: pkg,
      action: PublishAction.ERROR,
      reason: "recovery mode requires registry release evidence lookup",
    };
  }

  const evidenceResult = await registry.getReleaseEvidence(pkg.name, pkg.version);
  if (!evidenceResult.ok) {
    return {
      package: pkg,
      action: PublishAction.ERROR,
      reason: evidenceResult.error,
    };
  }

  const verified = verifyRegistryReleaseEvidence(evidenceResult.evidence, {
    commitSha: options.expectedCommitSha,
    directory: pkg.directory,
  });

  if (!verified.ok) {
    return {
      package: pkg,
      action: PublishAction.ERROR,
      reason: `${verified.issues.join("; ")}. ${verified.guidance}`,
    };
  }

  return {
    package: pkg,
    action: PublishAction.SKIP_EXISTING,
    reason: `verified for release commit ${options.expectedCommitSha}`,
  };
}

/**
 * @param {WorkspacePackage[]} packages
 * @param {{ existsOnRegistry: (name: string, version: string) => Promise<{ ok: true, exists: boolean } | { ok: false, error: string }>, getReleaseEvidence?: (name: string, version: string) => Promise<{ ok: true, evidence: ReleaseEvidence } | { ok: false, error: string }> }} registry
 * @param {{ mode?: string, expectedCommitSha?: string }} [options]
 * @returns {Promise<{ decisions: PublishDecision[], hasError: boolean }>}
 */
export async function buildPublishPlan(packages, registry, options = {}) {
  const decisions = [];
  let hasError = false;
  for (const pkg of packages) {
    const decision = await classifyPackage(pkg, registry, options);
    decisions.push(decision);
    if (decision.action === PublishAction.ERROR) {
      hasError = true;
    }
  }
  return { decisions, hasError };
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

/**
 * @param {string[]} argv
 */
export function parsePublishCliArgs(argv) {
  const args = {
    dryRun: false,
    recover: false,
    commitSha: undefined,
    manifestPath: undefined,
    distTag: undefined,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--dry-run") {
      args.dryRun = true;
    } else if (token === "--recover") {
      args.recover = true;
    } else if (token === "--commit") {
      args.commitSha = argv[index + 1];
      index += 1;
    } else if (token === "--manifest") {
      args.manifestPath = argv[index + 1];
      index += 1;
    } else if (token === "--tag") {
      args.distTag = argv[index + 1];
      index += 1;
    }
  }

  return args;
}

/**
 * @param {WorkspacePackage[]} packages
 * @param {{ commitSha: string, ref?: string | null }} context
 */
export function buildReleaseManifest(packages, context) {
  return {
    schemaVersion: 1,
    commitSha: context.commitSha,
    ref: context.ref ?? null,
    repository: PREACTPRESS_REPO_URL,
    packages: packages.map((pkg) => ({
      name: pkg.name,
      version: pkg.version,
      directory: pkg.directory,
    })),
    published: [],
  };
}

/**
 * @param {ReturnType<typeof buildReleaseManifest>} manifest
 * @param {WorkspacePackage[]} packages
 */
export function assertManifestMatchesWorkspace(manifest, packages) {
  if (!manifest?.packages?.length) {
    throw new Error("release manifest has no packages entry");
  }
  const byName = new Map(packages.map((pkg) => [pkg.name, pkg]));
  for (const entry of manifest.packages) {
    const workspace = byName.get(entry.name);
    if (!workspace) {
      throw new Error(
        `manifest lists ${entry.name}, which is not in the current workspace publish set`,
      );
    }
    if (workspace.version !== entry.version) {
      throw new Error(
        `manifest version for ${entry.name} (${entry.version}) does not match workspace (${workspace.version})`,
      );
    }
    if (entry.directory !== workspace.directory) {
      throw new Error(`manifest directory for ${entry.name} does not match workspace layout`);
    }
  }
}
