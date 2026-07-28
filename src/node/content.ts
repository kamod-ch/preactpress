import path from "node:path";
import { glob } from "tinyglobby";
import type { SiteConfig } from "./siteConfig.js";
import { normalizeRoute } from "../shared/route.js";
import { isDynamicTemplateFile } from "./dynamicRoutes.js";
import { readMarkdownMetadata } from "./markdown.js";
import { pageMatchesVersion } from "../shared/pageMeta.js";
import { localeFromRoute, stripLocalePrefix } from "../shared/locale.js";
import { composeVersionRoute } from "../shared/version.js";
import { versionContentRoots } from "./resolveVersions.js";
import { workspaceContentRoots } from "./resolveWorkspaces.js";

export const CONTENT_GLOBS = ["**/*.md", "**/*.mdx"] as const;
export const CONTENT_EXTENSIONS = [".mdx", ".md"] as const;

export type ContentKind = "markdown" | "mdx";

export interface ContentFile {
  route: string;
  file: string;
  kind: ContentKind;
}

export function mdFileToRoute(srcDir: string, file: string): string {
  let rel = path.relative(srcDir, file).split(path.sep).join("/");
  const ext = CONTENT_EXTENSIONS.find((candidate) => rel.endsWith(candidate));
  if (!ext) return "/";
  rel = rel.slice(0, -ext.length);
  if (rel.endsWith("/index")) rel = rel.slice(0, -"/index".length);
  if (rel === "index" || rel === "") return "/";
  return "/" + rel;
}

function contentIgnorePatterns(site: { srcExclude?: string[] }): string[] {
  return [
    "**/node_modules/**",
    "**/.preactpress/**",
    "**/*.data.ts",
    "**/*.paths.ts",
    ...(site.srcExclude ?? []),
  ];
}

export async function scanContentFiles(
  site: Pick<SiteConfig, "srcDir"> & { srcExclude?: string[] },
): Promise<ContentFile[]> {
  const files = await glob([...CONTENT_GLOBS], {
    cwd: site.srcDir,
    absolute: true,
    ignore: contentIgnorePatterns(site),
  });
  return dedupeContentFiles(site.srcDir, files);
}

function dedupeContentFiles(srcDir: string, files: string[]): ContentFile[] {
  const routeToFile = new Map<string, ContentFile>();
  for (const file of files.sort()) {
    if (isDynamicTemplateFile(file)) continue;
    const route = mdFileToRoute(srcDir, file);
    const kind: ContentKind = file.endsWith(".mdx") ? "mdx" : "markdown";
    const existing = routeToFile.get(route);
    if (existing) {
      throw new Error(
        `preactpress: route collision for ${route}: ${path.relative(srcDir, existing.file)} and ${path.relative(srcDir, file)}`,
      );
    }
    routeToFile.set(route, { route, file, kind });
  }
  return [...routeToFile.values()];
}

function routeForVersionedFile(
  site: SiteConfig,
  version: SiteConfig["versions"]["versions"][number],
  file: string,
): string {
  const routeInDir = mdFileToRoute(version.srcDir, file);
  const locale = localeFromRoute(routeInDir, site.i18n);
  const pathKey = stripLocalePrefix(routeInDir, locale);
  return composeVersionRoute(pathKey, locale, version);
}

function routeForWorkspaceFile(
  workspace: SiteConfig["workspaces"]["workspaces"][number],
  file: string,
): string {
  const routeInDocs = mdFileToRoute(workspace.docsDir, file);
  if (routeInDocs === "/") return workspace.prefix;
  return normalizeRoute(`${workspace.prefix}${routeInDocs}`);
}

function addContentFile(
  routeToFile: Map<string, ContentFile>,
  site: SiteConfig,
  route: string,
  file: string,
): void {
  if (isDynamicTemplateFile(file)) return;
  const kind: ContentKind = file.endsWith(".mdx") ? "mdx" : "markdown";
  const existing = routeToFile.get(route);
  if (existing) {
    throw new Error(
      `preactpress: route collision for ${route}: ${path.relative(site.root, existing.file)} and ${path.relative(site.root, file)}`,
    );
  }
  routeToFile.set(route, { route, file, kind });
}

async function globContentFiles(
  cwd: string,
  site: SiteConfig,
): Promise<string[]> {
  return glob([...CONTENT_GLOBS], {
    cwd,
    absolute: true,
    ignore: contentIgnorePatterns(site),
  });
}

async function scanWorkspaceContent(site: SiteConfig, routeToFile: Map<string, ContentFile>): Promise<void> {
  for (const workspace of workspaceContentRoots(site)) {
    let files: string[] = [];
    try {
      files = await globContentFiles(workspace.docsDir, site);
    } catch {
      continue;
    }
    for (const file of files.sort()) {
      addContentFile(routeToFile, site, routeForWorkspaceFile(workspace, file), file);
    }
  }
}

async function scanVersionedContent(site: SiteConfig, routeToFile: Map<string, ContentFile>): Promise<void> {
  for (const version of versionContentRoots(site)) {
    let files: string[] = [];
    try {
      files = await globContentFiles(version.srcDir, site);
    } catch {
      continue;
    }
    for (const file of files.sort()) {
      const meta = readMarkdownMetadata(file).meta;
      if (!pageMatchesVersion(meta, version.value)) continue;
      addContentFile(routeToFile, site, routeForVersionedFile(site, version, file), file);
    }
  }
}

/** Scan content for flat sites, versioned trees, and monorepo workspaces. */
export async function scanAllContentFiles(site: SiteConfig): Promise<ContentFile[]> {
  const workspacesEnabled = site.workspaces?.enabled;
  const versionsEnabled = site.versions?.enabled;

  if (!workspacesEnabled && !versionsEnabled) {
    return scanContentFiles(site);
  }

  const routeToFile = new Map<string, ContentFile>();

  if (workspacesEnabled) {
    for (const file of await scanContentFiles(site)) {
      routeToFile.set(file.route, file);
    }
    await scanWorkspaceContent(site, routeToFile);
    if (versionsEnabled && site.workspaces.versionMode === "project") {
      await scanVersionedContent(site, routeToFile);
    }
    return [...routeToFile.values()];
  }

  await scanVersionedContent(site, routeToFile);
  return [...routeToFile.values()];
}

export async function listMarkdownRoutes(site: Pick<SiteConfig, "srcDir">): Promise<string[]> {
  const files = await scanContentFiles(site);
  return files.map((f) => f.route).sort();
}

export function fileHrefToRoute(href: string, fromRoute: string): string | undefined {
  if (
    !href ||
    href.startsWith("#") ||
    /^(?:[a-z]+:)?\/\//i.test(href) ||
    /^(?:mailto|tel):/i.test(href)
  ) {
    return undefined;
  }
  const [pathPart] = href.split(/[?#]/, 1);
  if (!/\.(?:mdx?|html)$/.test(pathPart)) return undefined;
  const base = pathPart.startsWith("/")
    ? "/"
    : fromRoute === "/"
      ? "/"
      : `${fromRoute.replace(/\/[^/]*$/, "")}/`;
  const joined = path.posix.normalize(path.posix.join(base, pathPart));
  const withoutExt = joined.replace(/\.(?:mdx?|html)$/, "");
  const withoutIndex = withoutExt.replace(/\/index$/, "");
  return normalizeRoute(withoutIndex);
}
