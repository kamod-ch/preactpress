import fs from "node:fs/promises";
import path from "node:path";
import type { ResolvedConfig } from "@kamod-ch/preactpress/config";
import { joinRoute, slugifySegment } from "@preactpress/plugin-typedoc";
import type {
  ChangelogGenerationResult,
  ChangelogManifest,
  ChangelogPluginOptions,
  ChangelogProviderId,
  ChangelogRelease,
  RawChangelogRelease,
} from "../types/index.js";
import { computeSourceHash, readManifestCache, writeManifestCache } from "./cache.js";
import { normalizeRawRelease, releaseMatchesDocVersion } from "./normalize.js";
import { resolveProvider } from "../providers/index.js";
import type { ProviderContext } from "../providers/types.js";
import { renderChangelogDocs } from "../render/markdown.js";

export interface ChangelogGenerateOptions extends ChangelogPluginOptions {}

function normalizeBaseRoute(route: string): string {
  return `/${route.replace(/^\/+/, "").replace(/\/+$/, "")}`;
}

function outputFromRoute(route: string, output?: string): string {
  if (output) return output.replace(/^\/+/, "").replace(/\/+$/, "");
  return route.replace(/^\/+/, "").replace(/\/+$/, "") || "changelog";
}

function releaseSlug(version: string): string {
  return slugifySegment(version.replace(/^v/i, "v"));
}

function buildProviderContext(
  config: Pick<ResolvedConfig, "root" | "cacheDir">,
  options: ChangelogGenerateOptions,
  cacheDir: string,
): ProviderContext {
  return {
    root: config.root,
    cacheDir,
    repository: options.repository,
    localPath: options.local ?? "CHANGELOG.md",
    changesetsDir: typeof options.changesets === "object" ? options.changesets.dir : ".changeset",
    token: options.token,
    offline: options.offline,
    fetch: options.fetch,
  };
}

async function fetchAllRawReleases(
  options: ChangelogGenerateOptions,
  context: ProviderContext,
): Promise<{ raw: RawChangelogRelease[]; provider: ChangelogProviderId; source: string; sourceHash: string }> {
  const provider = resolveProvider(options.provider);
  const sourceHash = computeSourceHash(await provider.computeSourceHash(context));

  const raw = await provider.fetchRawReleases(context);

  if (options.changesets) {
    const changesets = resolveProvider("changesets");
    const pending = await changesets.fetchRawReleases(context);
    return {
      raw: [...pending, ...raw],
      provider: provider.id,
      source:
        provider.id === "github"
          ? `github:${options.repository}`
          : provider.id === "local"
            ? context.localPath ?? "CHANGELOG.md"
            : context.changesetsDir ?? ".changeset",
      sourceHash: computeSourceHash(`${sourceHash}:${await changesets.computeSourceHash(context)}`),
    };
  }

  return {
    raw,
    provider: provider.id,
    source:
      provider.id === "github"
        ? `github:${options.repository}`
        : provider.id === "local"
          ? context.localPath ?? "CHANGELOG.md"
          : context.changesetsDir ?? ".changeset",
    sourceHash,
  };
}

function buildReleases(rawReleases: RawChangelogRelease[], baseRoute: string): ChangelogRelease[] {
  return rawReleases.map((raw) => {
    const slug = releaseSlug(raw.version);
    const route = joinRoute(baseRoute, slug);
    return normalizeRawRelease(raw, route, slug);
  });
}

function versionScopedReleases(
  releases: ChangelogRelease[],
  docVersion: string,
  versionBaseRoute: string,
): ChangelogRelease[] {
  return releases
    .filter((release) => releaseMatchesDocVersion(release.version, docVersion))
    .map((release) => {
      const slug = releaseSlug(release.version);
      const route = joinRoute(versionBaseRoute, slug);
      return { ...release, route };
    });
}

export async function generateChangelogDocs(
  config: Pick<ResolvedConfig, "root" | "srcDir" | "cacheDir"> & {
    versions?: ResolvedConfig["versions"];
  },
  options: ChangelogGenerateOptions,
): Promise<ChangelogGenerationResult> {
  if (options.provider === "github" && !options.repository) {
    throw new Error("changelogPlugin: `repository` is required when provider is `github`.");
  }

  const baseRoute = normalizeBaseRoute(options.route ?? "/changelog");
  const outputDir = outputFromRoute(options.route ?? "/changelog", options.output);
  const cacheDir = path.join(config.cacheDir, "changelog");
  const context = buildProviderContext(config, options, cacheDir);

  const { raw, provider, source, sourceHash } = await fetchAllRawReleases(options, context);

  const cached = await readManifestCache({ cacheDir, enabled: options.cache !== false }, sourceHash);
  if (cached) {
    return renderChangelogDocs(cached);
  }

  const primaryReleases = buildReleases(raw, baseRoute);
  const releases = [...primaryReleases];

  if (options.versionIntegration && config.versions?.enabled) {
    for (const version of config.versions.versions.filter((entry) => !entry.isAlias && entry.prefix)) {
      const prefix = version.prefix!.replace(/\/+$/, "");
      const versionBaseRoute = joinRoute(prefix, baseRoute.replace(/^\//, ""));
      const scoped = versionScopedReleases(primaryReleases, version.value, versionBaseRoute);
      if (!scoped.length) continue;

      releases.push({
        version: version.label ?? version.value,
        slug: "index",
        route: versionBaseRoute,
        title: `Changelog (${version.label ?? version.value})`,
        description: `Release notes for documentation version ${version.label ?? version.value}`,
        sections: [],
        contributors: [],
      });
      releases.push(...scoped);
    }
  }

  const manifest: ChangelogManifest = {
    version: 1,
    generatedAt: new Date().toISOString(),
    sourceHash,
    source,
    provider,
    repository: options.repository,
    baseRoute,
    outputDir,
    releases,
  };

  if (options.cache !== false) {
    await writeManifestCache({ cacheDir, enabled: true }, sourceHash, manifest);
  }

  return renderChangelogDocs(manifest);
}

export async function writeGeneratedPages(
  srcDir: string,
  result: ChangelogGenerationResult,
): Promise<void> {
  for (const page of result.pages) {
    const abs = path.join(srcDir, page.relativePath);
    await fs.mkdir(path.dirname(abs), { recursive: true });
    await fs.writeFile(abs, page.markdown, "utf8");
  }

  const manifestPath = path.join(srcDir, result.manifest.outputDir, ".changelog-manifest.json");
  await fs.writeFile(manifestPath, `${JSON.stringify(result.manifest, null, 2)}\n`, "utf8");
}

export async function writeStructuredManifest(
  configDir: string,
  manifest: ChangelogManifest,
): Promise<void> {
  await fs.mkdir(configDir, { recursive: true });
  await fs.writeFile(
    path.join(configDir, "changelog-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );
}
