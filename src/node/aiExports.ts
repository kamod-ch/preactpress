import fs from "node:fs/promises";
import path from "node:path";
import type { PageView } from "../client/types.js";
import type { Logger } from "vite";
import { shouldIgnoreDeadLink } from "../shared/deadLinks.js";
import { flattenNavLeafItems, flattenSidebarItems, type SidebarConfig } from "../shared/sidebar.js";
import { localeFromRoute } from "../shared/locale.js";
import { versionFromRoute } from "../shared/version.js";
import { isDraftPage } from "../shared/pageMeta.js";
import { absoluteUrl } from "./html.js";
import type { BuildResult } from "./pluginTypes.js";
import type {
  NavItem,
  ResolvedAiExportsConfig,
  ResolvedConfig,
  ResolvedI18n,
  ResolvedVersions,
} from "./siteConfig.js";

export interface AiPageEntry {
  route: string;
  page: PageView;
}

export interface ContextIndexDocument {
  version: 1;
  project: {
    name: string;
    description: string;
    url?: string;
  };
  pages: Array<{
    route: string;
    title?: string;
    description?: string;
    url?: string;
    markdownUrl?: string;
    locale?: string;
    version?: string;
    headings?: Array<{ id: string; text: string; level: number }>;
  }>;
  symbols: Array<Record<string, unknown>>;
  components: Array<Record<string, unknown>>;
  versions: Array<{ value: string; label: string; link?: string; archived?: boolean }>;
  locales: Array<{ key: string; label: string; lang: string; link?: string }>;
}

export function markdownOutPath(route: string): string {
  if (route === "/") return "index.md";
  const trimmed = route.replace(/^\//, "").replace(/\/$/, "");
  return `${trimmed}.md`;
}

export function isRouteExcluded(route: string, exclude: string[]): boolean {
  return shouldIgnoreDeadLink(route, exclude, { from: route, route });
}

export function collectAiPages(
  pages: Array<{ route: string; page: PageView }>,
  exclude: string[],
): AiPageEntry[] {
  return pages.filter(({ route, page }) => {
    if (route === "/404") return false;
    if (isRouteExcluded(route, exclude)) return false;
    if (isDraftPage(page.meta)) return false;
    if (page.meta.tagIndex === true) return false;
    return true;
  });
}

function orderedRoutes(
  entries: AiPageEntry[],
  themeConfig: { nav?: NavItem[]; sidebar?: SidebarConfig },
  i18n?: ResolvedI18n,
  versions?: ResolvedVersions,
): string[] {
  const routeSet = new Set(entries.map((entry) => entry.route));
  const preferred: string[] = [];
  const seen = new Set<string>();

  for (const item of flattenNavLeafItems(themeConfig.nav)) {
    if (routeSet.has(item.link) && !seen.has(item.link)) {
      preferred.push(item.link);
      seen.add(item.link);
    }
  }
  for (const item of flattenSidebarItems(themeConfig.sidebar)) {
    if (routeSet.has(item.link) && !seen.has(item.link)) {
      preferred.push(item.link);
      seen.add(item.link);
    }
  }

  const remaining = entries
    .map((entry) => entry.route)
    .filter((route) => !seen.has(route))
    .sort((a, b) => a.localeCompare(b));

  return [...preferred, ...remaining];
}

function sidebarSections(
  themeConfig: { sidebar?: SidebarConfig },
  i18n?: ResolvedI18n,
  versions?: ResolvedVersions,
): Array<{ title: string; routes: string[] }> {
  const sidebar = themeConfig.sidebar;
  if (!sidebar) return [];
  const groups = Array.isArray(sidebar) ? sidebar : Object.values(sidebar).flat();
  return groups
    .map((group) => ({
      title: group.text ?? "Documentation",
      routes: group.items.flatMap((item) => {
        const routes: string[] = [];
        if (item.link) routes.push(item.link);
        if (item.items?.length) {
          for (const nested of item.items) {
            if (nested.link) routes.push(nested.link);
          }
        }
        return routes;
      }),
    }))
    .filter((group) => group.routes.length > 0);
}

function apiReferenceRoutes(entries: AiPageEntry[]): string[] {
  return entries
    .filter(({ route, page }) => {
      if (route.includes("/api/") || route.startsWith("/api")) return true;
      const section = page.meta.apiSection;
      return section === "typedoc" || section === "openapi";
    })
    .map((entry) => entry.route);
}

function formatPageMarkdownBlock(config: ResolvedConfig, route: string, page: PageView): string {
  const url = config.site.url ? absoluteUrl(config, route) : route;
  const title = page.title ?? route;
  const description = page.description ?? "";
  const locale = localeFromRoute(route, config.i18n)?.key;
  const version = versionFromRoute(route, config.versions, config.i18n)?.value;
  const metaLines = [
    `source: ${url}`,
    `title: ${title}`,
    description ? `description: ${description}` : undefined,
    locale ? `locale: ${locale}` : undefined,
    version ? `version: ${version}` : undefined,
  ].filter(Boolean);

  const body =
    page.kind === "markdown" && page.markdown
      ? page.markdown.trim()
      : (page.description?.trim() ?? "");

  const heading = title && !body.startsWith("# ") ? `# ${title}\n\n` : "";
  return `---\n${metaLines.join("\n")}\n---\n\n${heading}${body}`.trim();
}

export function generateLlmsTxt(
  config: ResolvedConfig,
  entries: AiPageEntry[],
  bundleNames: string[] = [],
): string {
  const { site, themeConfig, i18n, versions } = config;
  const lines: string[] = [`# ${site.title}`, "", `> ${site.description}`, ""];

  if (site.url) {
    lines.push(`Site: ${site.url}`, "");
  }

  const ordered = orderedRoutes(entries, themeConfig, i18n, versions);
  const entryByRoute = new Map(entries.map((entry) => [entry.route, entry]));
  const sections = sidebarSections(themeConfig, i18n, versions);

  if (sections.length > 0) {
    lines.push("## Documentation areas", "");
    for (const section of sections) {
      lines.push(`### ${section.title}`, "");
      for (const route of section.routes) {
        const entry = entryByRoute.get(route);
        if (!entry) continue;
        appendLlmsPageLink(lines, config, entry.route, entry.page);
      }
      lines.push("");
    }
  } else {
    lines.push("## Documentation", "");
    for (const route of ordered) {
      const entry = entryByRoute.get(route);
      if (!entry) continue;
      appendLlmsPageLink(lines, config, entry.route, entry.page);
    }
    lines.push("");
  }

  const entryPoints = flattenNavLeafItems(themeConfig.nav).slice(0, 8);
  if (entryPoints.length > 0) {
    lines.push("## Entry points", "");
    for (const item of entryPoints) {
      const url = site.url ? absoluteUrl(config, item.link) : item.link;
      lines.push(`- [${item.text}](${url})`);
    }
    lines.push("");
  }

  const apiRoutes = apiReferenceRoutes(entries);
  if (apiRoutes.length > 0) {
    lines.push("## API reference", "");
    for (const route of apiRoutes) {
      const entry = entryByRoute.get(route);
      if (!entry) continue;
      appendLlmsPageLink(lines, config, entry.route, entry.page);
    }
    lines.push("");
  }

  if (bundleNames.length > 0) {
    lines.push("## Full documentation bundles", "");
    for (const name of bundleNames) {
      const url = site.url ? absoluteUrl(config, `/${name}`) : `/${name}`;
      lines.push(`- [${name}](${url})`);
    }
    lines.push("");
  } else if (config.ai !== false && config.ai.llmsFullTxt) {
    const url = site.url ? absoluteUrl(config, "/llms-full.txt") : "/llms-full.txt";
    lines.push("## Full documentation", "", `- [llms-full.txt](${url})`, "");
  }

  if (config.ai !== false && config.ai.contextIndex) {
    const url = site.url ? absoluteUrl(config, "/api/context.json") : "/api/context.json";
    lines.push("## Machine-readable index", "", `- [context.json](${url})`, "");
  }

  if (versions?.enabled && versions.versions.length > 0) {
    lines.push("## Versions", "");
    for (const version of versions.versions.filter((entry) => !entry.isAlias)) {
      const link = version.link ?? version.prefix ?? version.value;
      const url = site.url && link.startsWith("/") ? absoluteUrl(config, link) : link;
      lines.push(`- ${version.label} (${version.value}): ${url}`);
    }
    lines.push("");
  }

  if (i18n && i18n.locales.length > 1) {
    lines.push("## Locales", "");
    for (const locale of i18n.locales) {
      const url =
        site.url && locale.link ? absoluteUrl(config, locale.link) : (locale.link ?? locale.key);
      lines.push(`- ${locale.label} (${locale.lang}): ${url}`);
    }
    lines.push("");
  }

  return `${lines.join("\n").trim()}\n`;
}

function appendLlmsPageLink(
  lines: string[],
  config: ResolvedConfig,
  route: string,
  page: PageView,
): void {
  const title = page.title ?? route;
  const description = page.description ?? "";
  const pageUrl = config.site.url ? absoluteUrl(config, route) : route;
  lines.push(`- [${title}](${pageUrl})${description ? `: ${description}` : ""}`);
  if (config.ai !== false && config.ai.pageMarkdown) {
    const mdPath = `/${markdownOutPath(route)}`;
    const mdUrl = config.site.url ? absoluteUrl(config, mdPath) : mdPath;
    lines.push(`  - Markdown: ${mdUrl}`);
  }
}

export function generateLlmsFullTxt(config: ResolvedConfig, entries: AiPageEntry[]): string {
  const ordered = orderedRoutes(entries, config.themeConfig, config.i18n, config.versions);
  const entryByRoute = new Map(entries.map((entry) => [entry.route, entry]));
  const blocks: string[] = [];

  for (const route of ordered) {
    const entry = entryByRoute.get(route);
    if (!entry) continue;
    blocks.push(formatPageMarkdownBlock(config, entry.route, entry.page));
  }

  return `${blocks.join("\n\n---\n\n")}\n`;
}

export function splitFullDocumentation(
  content: string,
  maxBytes: number,
): { bundles: string[]; warning?: string } {
  const size = Buffer.byteLength(content, "utf8");
  if (size <= maxBytes) {
    return { bundles: [content] };
  }

  const parts = content.split("\n\n---\n\n");
  const bundles: string[] = [];
  let current = "";

  for (const part of parts) {
    const candidate = current ? `${current}\n\n---\n\n${part}` : part;
    if (Buffer.byteLength(candidate, "utf8") > maxBytes && current) {
      bundles.push(`${current.trim()}\n`);
      current = part;
    } else {
      current = candidate;
    }
  }
  if (current.trim()) bundles.push(`${current.trim()}\n`);

  const warning = `llms-full.txt is ${size} bytes; split into ${bundles.length} bundle(s) (limit ${maxBytes} bytes).`;
  return { bundles, warning };
}

export function generateContextIndex(
  config: ResolvedConfig,
  entries: AiPageEntry[],
): ContextIndexDocument {
  const symbols: Array<Record<string, unknown>> = [];
  const components: Array<Record<string, unknown>> = [];

  const pages = entries.map(({ route, page }) => {
    const metaSymbols = page.meta.symbols;
    if (Array.isArray(metaSymbols)) {
      for (const symbol of metaSymbols) {
        if (symbol && typeof symbol === "object") {
          symbols.push({ ...(symbol as Record<string, unknown>), route });
        }
      }
    }
    const metaComponents = page.meta.components;
    if (Array.isArray(metaComponents)) {
      for (const component of metaComponents) {
        if (component && typeof component === "object") {
          components.push({ ...(component as Record<string, unknown>), route });
        }
      }
    }

    const mdPath = `/${markdownOutPath(route)}`;
    return {
      route,
      title: page.title,
      description: page.description,
      url: config.site.url ? absoluteUrl(config, route) : undefined,
      markdownUrl:
        config.ai !== false && config.ai.pageMarkdown && config.site.url
          ? absoluteUrl(config, mdPath)
          : undefined,
      locale: localeFromRoute(route, config.i18n)?.key,
      version: versionFromRoute(route, config.versions, config.i18n)?.value,
      headings: page.headings?.map(({ id, text, level }) => ({ id, text, level })),
    };
  });

  return {
    version: 1,
    project: {
      name: config.site.title,
      description: config.site.description,
      url: config.site.url,
    },
    pages,
    symbols,
    components,
    versions: config.versions.enabled
      ? config.versions.versions
          .filter((entry) => !entry.isAlias)
          .map(({ value, label, link, status }) => ({
            value,
            label,
            link,
            archived: status === "archived",
          }))
      : [],
    locales: config.i18n
      ? config.i18n.locales.map(({ key, label, lang, link }) => ({ key, label, lang, link }))
      : [],
  };
}

export function pageMarkdownForCopy(page: PageView): string | undefined {
  if (page.kind !== "markdown" || !page.markdown) return undefined;
  const title = page.title?.trim();
  const body = page.markdown.trim();
  if (title && !body.startsWith("# ")) {
    return `# ${title}\n\n${body}`;
  }
  return body;
}

export function serializablePageForClient(page: PageView, includeMarkdown: boolean): unknown {
  if (page.kind === "markdown") {
    if (!includeMarkdown && page.markdown !== undefined) {
      const { markdown: _markdown, ...rest } = page;
      return rest;
    }
    return page;
  }
  const { Component: _Component, ...rest } = page;
  return rest;
}

export async function writeAiExports(
  config: ResolvedConfig,
  result: BuildResult,
  logger: Logger,
): Promise<void> {
  const ai = config.ai;
  if (ai === false || !config.site.url) return;

  const entries = collectAiPages(result.pages, ai.exclude);
  const bundleNames: string[] = [];

  if (ai.pageMarkdown) {
    for (const { route, page } of entries) {
      if (page.kind !== "markdown" || !page.markdown) continue;
      const outPath = path.join(result.outDir, markdownOutPath(route));
      await fs.mkdir(path.dirname(outPath), { recursive: true });
      await fs.writeFile(outPath, formatPageMarkdownBlock(config, route, page) + "\n", "utf8");
    }
    logger.info(
      `wrote ${entries.filter((e) => e.page.kind === "markdown" && e.page.markdown).length} page markdown file(s)`,
      {
        timestamp: true,
      },
    );
  }

  if (ai.llmsFullTxt) {
    const full = generateLlmsFullTxt(config, entries);
    const { bundles, warning } = splitFullDocumentation(full, ai.maxBundleBytes);
    if (warning) logger.warn(`preactpress: ${warning}`, { timestamp: true });

    if (bundles.length === 1) {
      await fs.writeFile(path.join(result.outDir, "llms-full.txt"), bundles[0], "utf8");
      logger.info("wrote llms-full.txt", { timestamp: true });
    } else {
      for (let index = 0; index < bundles.length; index += 1) {
        const name = `llms-full-${index + 1}.txt`;
        bundleNames.push(name);
        await fs.writeFile(path.join(result.outDir, name), bundles[index], "utf8");
      }
      logger.info(`wrote ${bundles.length} llms-full bundle(s)`, { timestamp: true });
    }
  }

  if (ai.llmsTxt) {
    await fs.writeFile(
      path.join(result.outDir, "llms.txt"),
      generateLlmsTxt(config, entries, bundleNames),
      "utf8",
    );
    logger.info("wrote llms.txt", { timestamp: true });
  }

  if (ai.contextIndex) {
    const contextPath = path.join(result.outDir, "api", "context.json");
    await fs.mkdir(path.dirname(contextPath), { recursive: true });
    await fs.writeFile(
      contextPath,
      JSON.stringify(generateContextIndex(config, entries), null, 2) + "\n",
      "utf8",
    );
    logger.info("wrote api/context.json", { timestamp: true });
  }
}
