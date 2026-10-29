import { execFile, execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import {
  PublishAction,
  assertManifestMatchesWorkspace,
  buildReleaseManifest,
  discoverWorkspacePackages,
  resolveDistTag,
  PublishMode,
  buildPublishPlan,
  summarizePublishPlan,
} from "./publish-selection.mjs";
import { createNpmRegistryClient } from "./publish-registry.mjs";

const execFileAsync = promisify(execFile);

/**
 * @param {string} cwd
 * @param {(file: string, args: string[], opts: object) => Promise<{ stdout: string }>} runExecFile
 */
export async function runNpmPackDryRun(cwd, runExecFile) {
  await runExecFile("npm", ["pack", "--dry-run"], { cwd, stdio: ["ignore", "inherit", "inherit"] });
}

/**
 * @param {string} cwd
 * @param {string} distTag
 * @param {(file: string, args: string[], opts: object) => Promise<{ stdout: string }>} runExecFile
 */
export async function runNpmPublish(cwd, distTag, runExecFile) {
  const args = ["publish", "--access", "public", "--provenance", "--tag", distTag];
  await runExecFile("npm", args, { cwd, stdio: ["ignore", "inherit", "inherit"] });
}

/**
 * @param {PublishDecision[]} decisions
 * @param {{ distTag: string, dryRun: boolean, runExecFile: Function, onPublished?: Function }} options
 */
export async function executePublishPlan(decisions, options) {
  const toPublish = decisions.filter((entry) => entry.action === PublishAction.PUBLISH);
  for (const entry of toPublish) {
    await runNpmPackDryRun(entry.package.dir, options.runExecFile);
    if (options.dryRun) {
      continue;
    }
    await runNpmPublish(entry.package.dir, options.distTag, options.runExecFile);
    if (options.onPublished) {
      await options.onPublished(entry);
    }
  }
  return toPublish;
}

/**
 * @param {string} packageRoot
 * @param {(file: string, args: string[], opts: object) => Promise<{ stdout: string }>} runExecFile
 */
export async function runWorkspaceVerify(packageRoot, runExecFile) {
  await runExecFile("pnpm", ["run", "verify:workspace"], {
    cwd: packageRoot,
    stdio: ["ignore", "inherit", "inherit"],
  });
}

export function resolveReleaseCommitSha(args, packageRoot, execFile = execFileSync) {
  if (args.manifestPath) {
    const manifest = JSON.parse(readFileSync(args.manifestPath, "utf8"));
    if (!manifest.commitSha) {
      throw new Error(`manifest ${args.manifestPath} is missing commitSha`);
    }
    return { commitSha: manifest.commitSha, manifest, ref: manifest.ref ?? null };
  }
  if (args.commitSha) {
    return { commitSha: args.commitSha, manifest: null, ref: null };
  }
  const head = execFile("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
    cwd: packageRoot,
  }).trim();
  return { commitSha: head, manifest: null, ref: null };
}

export function assertCheckoutMatchesCommit(
  packageRoot,
  expectedCommitSha,
  execFile = execFileSync,
) {
  const head = execFile("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
    cwd: packageRoot,
  }).trim();
  if (head !== expectedCommitSha) {
    throw new Error(
      `Checkout must match the release commit (${expectedCommitSha}); current HEAD is ${head}. Check out the tagged release commit before using --recover.`,
    );
  }
}

export function manifestPathForCommit(packageRoot, commitSha) {
  return path.join(packageRoot, "tmp", `preactpress-release-${commitSha}.json`);
}

export function writeReleaseManifest(manifestPath, manifest) {
  mkdirSync(path.dirname(manifestPath), { recursive: true });
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

export function appendPublishedPackage(manifestPath, entry) {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  manifest.published = manifest.published ?? [];
  manifest.published.push({
    name: entry.package.name,
    version: entry.package.version,
    directory: entry.package.directory,
    publishedAt: new Date().toISOString(),
  });
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

/**
 * @param {string} packageRoot
 * @param {ReturnType<typeof parsePublishCliArgs>} args
 * @param {{ registry?: ReturnType<typeof createNpmRegistryClient>, runExecFile?: Function, execFileSync?: typeof execFileSync }} [deps]
 */
export async function runPublishPipeline(packageRoot, args, deps = {}) {
  const runExecFile =
    deps.runExecFile ??
    (async (file, argv, opts) => {
      await execFileAsync(file, argv, opts);
      return { stdout: "" };
    });
  const execFileSyncImpl = deps.execFileSync ?? execFileSync;
  const registry = deps.registry ?? createNpmRegistryClient({ cwd: packageRoot });

  await runWorkspaceVerify(packageRoot, runExecFile);

  const packages = discoverWorkspacePackages(packageRoot);
  let distTag = args.distTag ?? "latest";
  for (const pkg of packages) {
    const perPackageTag = resolveDistTag(pkg.version, args.distTag);
    if (!perPackageTag.ok) {
      throw new Error(`${pkg.name}: ${perPackageTag.error}`);
    }
    distTag = perPackageTag.tag;
  }

  const releaseContext = args.recover
    ? resolveReleaseCommitSha(args, packageRoot, execFileSyncImpl)
    : resolveReleaseCommitSha(
        { ...args, commitSha: undefined, manifestPath: undefined },
        packageRoot,
        execFileSyncImpl,
      );

  let manifest = releaseContext.manifest;
  if (args.recover) {
    assertCheckoutMatchesCommit(packageRoot, releaseContext.commitSha, execFileSyncImpl);
    if (manifest) {
      assertManifestMatchesWorkspace(manifest, packages);
    }
  }

  const planOptions = {
    mode: args.recover ? PublishMode.RECOVER : PublishMode.STRICT,
    expectedCommitSha: args.recover ? releaseContext.commitSha : undefined,
  };

  const { decisions, hasError } = await buildPublishPlan(packages, registry, planOptions);
  console.log("\n[publish] Preflight plan:\n" + summarizePublishPlan(decisions));

  if (hasError) {
    throw new Error("registry uncertainty, conflicting release evidence, or invalid release state");
  }

  manifest =
    manifest ??
    buildReleaseManifest(packages, {
      commitSha: releaseContext.commitSha,
      ref: process.env.GITHUB_REF ?? releaseContext.ref,
    });

  const manifestPath = manifestPathForCommit(packageRoot, releaseContext.commitSha);
  if (!args.dryRun) {
    writeReleaseManifest(manifestPath, manifest);
    console.log(`\n[publish] Release manifest: ${manifestPath}`);
  }

  try {
    await executePublishPlan(decisions, {
      distTag,
      dryRun: args.dryRun,
      runExecFile,
      onPublished: args.dryRun
        ? undefined
        : async (entry) => {
            appendPublishedPackage(manifestPath, entry);
            console.log(
              `[publish] Published ${entry.package.name}@${entry.package.version} (tag: ${distTag})`,
            );
          },
    });
  } catch (error) {
    console.error(
      "\n[publish] Publish stopped after first failure; fix the error and resume with --recover.",
    );
    throw error;
  }

  if (args.dryRun) {
    console.log("\n[publish] Dry run complete; no registry writes were performed.");
    return { decisions, distTag, dryRun: true };
  }

  console.log("\n[publish] Publish run finished.");
  return { decisions, distTag, dryRun: false, manifestPath };
}
