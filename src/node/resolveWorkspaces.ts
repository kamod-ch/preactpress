import fs from "node:fs";
import path from "node:path";
import { normalizePath } from "vite";
import type {
  ResolvedWorkspace,
  ResolvedWorkspaces,
  ThemeConfig,
  WorkspaceItemConfig,
  WorkspaceLabels,
  WorkspacesConfig,
} from "./siteConfig.js";
import { DEFAULT_WORKSPACE_LABELS, workspacePrefixForId } from "../shared/workspace.js";
import { normalizeRoute } from "../shared/route.js";
import { readPackageJsonMeta, repositoryUrlFromMeta } from "./readPackageJson.js";
import { detectWorkspacePackages, type DetectedPackage } from "./detectWorkspacePackages.js";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function isStructuredWorkspacesConfig(value: unknown): value is WorkspacesConfig {
  return isPlainObject(value) && Array.isArray(value.items);
}

function normalizeWorkspaceId(id: string): string {
  return id
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-");
}

function resolveDocsDir(
  root: string,
  configDir: string,
  item: WorkspaceItemConfig,
  packageRoot: string,
): string {
  const docs = item.docs ?? "./docs";
  const base = path.isAbsolute(docs) ? docs : path.resolve(packageRoot, docs);
  if (!fs.existsSync(base)) {
    throw new Error(`preactpress: workspace "${item.id}" docs directory not found: ${base}`);
  }
  return normalizePath(base);
}

function defaultEditPattern(repoUrl: string | undefined, docsRelative: string): string | undefined {
  if (!repoUrl) return undefined;
  return `${repoUrl.replace(/\/+$/, "")}/edit/main/${docsRelative}/:path`;
}

function defaultSourcePattern(repoUrl: string | undefined, sourceDir = "src"): string | undefined {
  if (!repoUrl) return undefined;
  return `${repoUrl.replace(/\/+$/, "")}/blob/main/${sourceDir}/:path`;
}

function resolveWorkspaceItem(
  item: WorkspaceItemConfig,
  ctx: { root: string; configDir: string; themeConfig: ThemeConfig },
  detected?: DetectedPackage,
): ResolvedWorkspace {
  const id = normalizeWorkspaceId(item.id);
  const prefix = workspacePrefixForId(id);
  const packageRoot = normalizePath(path.resolve(ctx.root, detected?.root ?? item.root ?? `.`));
  const docsDir = resolveDocsDir(ctx.root, ctx.configDir, item, packageRoot);
  const pkg = readPackageJsonMeta(packageRoot);
  const repoUrl = item.repository ?? repositoryUrlFromMeta(pkg);
  const docsRelative = path.relative(ctx.root, docsDir).split(path.sep).join("/");
  const packageVersion = item.version ?? pkg.version;
  const editPattern = item.editLink?.pattern ?? defaultEditPattern(repoUrl, docsRelative);
  const sourcePattern =
    item.sourceLink?.pattern ?? defaultSourcePattern(repoUrl, item.sourceDir ?? "src");

  return {
    id,
    name: item.name ?? pkg.name ?? id,
    prefix,
    link: item.link ?? `${prefix}/`,
    packageRoot,
    docsDir,
    docsRelativePrefix: `${path.relative(ctx.root, docsDir).split(path.sep).join("/")}/`,
    packageName: pkg.name,
    packageVersion,
    description: item.description ?? pkg.description,
    repositoryUrl: repoUrl,
    changelogPath: item.changelog
      ? normalizePath(path.resolve(packageRoot, item.changelog))
      : fs.existsSync(path.join(packageRoot, "CHANGELOG.md"))
        ? path.join(packageRoot, "CHANGELOG.md")
        : undefined,
    editLink: editPattern
      ? { pattern: editPattern, text: item.editLink?.text ?? "Edit this page" }
      : undefined,
    sourceLink: sourcePattern
      ? { pattern: sourcePattern, text: item.sourceLink?.text ?? "View source" }
      : undefined,
    typedoc: item.typedoc,
    themeConfig: {
      ...ctx.themeConfig,
      ...item.themeConfig,
      sidebar: item.sidebar ?? item.themeConfig?.sidebar ?? ctx.themeConfig.sidebar,
    },
    dependencies: detected?.dependencies ?? [],
  };
}

export function resolveWorkspacesConfig(
  input: WorkspacesConfig | WorkspaceItemConfig[] | undefined,
  ctx: { root: string; configDir: string; themeConfig: ThemeConfig },
): ResolvedWorkspaces {
  let parsed: WorkspacesConfig | null = null;
  if (Array.isArray(input)) {
    parsed = { items: input };
  } else if (input && isStructuredWorkspacesConfig(input)) {
    parsed = input;
  }

  if (!parsed?.items?.length) {
    return {
      enabled: false,
      defaultId: "",
      versionMode: "project",
      labels: { ...DEFAULT_WORKSPACE_LABELS },
      workspaces: [],
    };
  }

  const labels: Required<WorkspaceLabels> = {
    switcher: parsed.labels?.switcher ?? DEFAULT_WORKSPACE_LABELS.switcher,
    version: parsed.labels?.version ?? DEFAULT_WORKSPACE_LABELS.version,
  };
  const versionMode = parsed.versionMode ?? "project";
  const detected = parsed.autoDiscover ? detectWorkspacePackages(ctx.root) : [];
  const detectedByName = new Map(detected.map((entry) => [entry.name, entry]));

  const seenIds = new Set<string>();
  const workspaces: ResolvedWorkspace[] = parsed.items.map((item) => {
    const id = normalizeWorkspaceId(item.id);
    if (seenIds.has(id)) {
      throw new Error(`preactpress: duplicate workspace id "${id}"`);
    }
    seenIds.add(id);
    const match = item.packageName ? detectedByName.get(item.packageName) : undefined;
    return resolveWorkspaceItem(item, ctx, match);
  });

  for (const prefix of workspaces.map((workspace) => workspace.prefix)) {
    if (prefix === "/") {
      throw new Error("preactpress: workspace id resolves to invalid route prefix /");
    }
  }

  const defaultId = parsed.default ?? workspaces[0]?.id ?? "";

  return {
    enabled: true,
    defaultId,
    versionMode,
    labels,
    workspaces,
  };
}

export function workspaceContentRoots(
  site: Pick<import("./siteConfig.js").ResolvedConfig, "workspaces">,
): ResolvedWorkspace[] {
  if (!site.workspaces.enabled) return [];
  return site.workspaces.workspaces;
}
