import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { resolveConfig } from "./config.js";
import { fileHrefToRoute, scanAllContentFiles, type ContentFile } from "./content.js";
import { resolveDynamicRoutes } from "./dynamicRoutes.js";
import { extractHeadingsFromContent } from "./markdownHeadings.js";
import { readMarkdownMetadata } from "./markdown.js";
import { listTagIndexRoutes } from "./tagIndex.js";
import type { ResolvedConfig } from "./siteConfig.js";
import { normalizeRoute } from "../shared/route.js";
import { PAGE_LAYOUTS, isDraftPage, isPageLayout, pageLayoutFromMeta } from "../shared/pageMeta.js";
import { applyRouteRewrites } from "../shared/rewrites.js";
import {
  allSidebarGroups,
  flattenNavLeafItems,
  flattenSidebarLeafItems,
} from "../shared/sidebar.js";
import { parseFeatures, parseHero } from "../shared/pageChrome.js";
import {
  algoliaOptionsFromSearch,
  isAlgoliaSearchEnabled,
  resolveAlgoliaOptions,
  validateAlgoliaCredentials,
} from "../shared/search.js";
import type { SearchConfig } from "../shared/search.js";
import type { SocialLink } from "../shared/socialIcons.js";
import { routePathKey } from "../shared/locale.js";
import { redirectFromRoutes, validateRedirectsForCheck } from "./redirects.js";
import { shouldIgnoreDeadLink } from "../shared/deadLinks.js";
import {
  extractCodeFenceLanguages,
  extractCustomHeadingIds,
  extractFirstH1,
  extractMarkdownImages,
  extractMarkdownLinks,
  isExternalHref,
  isKnownCodeLanguage,
  isStaticAssetHref,
  resolveInternalRoute,
  resolveLocalAssetPath,
  verifyExternalHref,
} from "./checkHelpers.js";
import {
  buildCheckStats,
  combineIssues,
  computeCheckScore,
  type CheckIssue,
  type CheckOptions,
  type CheckResult,
  type DocumentationCheckResult,
} from "./checkTypes.js";

function pushError(
  errors: CheckIssue[],
  code: CheckIssue["code"],
  message: string,
  ctx?: { file?: string; route?: string },
): void {
  errors.push({ level: "error", code, message, ...ctx });
}

function pushWarning(
  warnings: CheckIssue[],
  code: CheckIssue["code"],
  message: string,
  ctx?: { file?: string; route?: string },
): void {
  warnings.push({ level: "warning", code, message, ...ctx });
}

export async function check(root?: string, options: CheckOptions = {}): Promise<CheckResult> {
  const site = await resolveConfig(root, "serve", "development");
  const errors: CheckIssue[] = [];
  const warnings: CheckIssue[] = [];

  let files: ContentFile[] = [];
  try {
    files = await scanAllContentFiles(site);
  } catch (err) {
    pushError(errors, "duplicate-slug", err instanceof Error ? err.message : String(err));
  }

  const draftFiles = files.filter((file) => isDraftPage(readMarkdownMetadata(file.file).meta));
  const publishedFiles = files.filter((file) => !draftFiles.includes(file));
  const routeToFile = new Map(publishedFiles.map((file) => [file.route, file]));

  try {
    if (Object.keys(site.rewrites).length > 0) {
      applyRouteRewrites(routeToFile, site.rewrites);
    }
  } catch (err) {
    pushError(errors, "config", err instanceof Error ? err.message : String(err));
  }

  const dynamicRoutes = await resolveDynamicRoutes(site);
  const routes = [
    ...new Set([...routeToFile.keys(), ...dynamicRoutes.map((entry) => entry.route)]),
  ].sort();
  const routeSet = new Set(routes);
  const tagRoutes = await listTagIndexRoutes(site, routeSet);
  for (const tr of tagRoutes) routeSet.add(tr);

  checkLocaleRoots(site, routeSet, errors);
  checkConfiguredLinks(site, routeSet, errors, site.ignoreDeadLinks);
  checkNavTargets(site, warnings);
  checkSearchConfig(site, warnings);
  checkSocialLinks(site, warnings);
  checkSeoDescriptions(site, publishedFiles, warnings);
  checkPageChrome(site, publishedFiles, routeSet, errors, warnings, site.ignoreDeadLinks);
  checkRedirectRules(site, routeSet, errors, warnings);
  checkMissingTranslations(site, routeSet, warnings);

  for (const file of draftFiles) {
    pushWarning(
      warnings,
      "draft",
      `${path.relative(site.srcDir, file.file)} is marked draft and will be excluded from build output`,
      { file: path.relative(site.srcDir, file.file), route: file.route },
    );
  }

  const outboundLinks = new Map<string, Set<string>>();
  const inboundLinks = new Map<string, Set<string>>();
  for (const route of routeSet) {
    inboundLinks.set(route, new Set());
    outboundLinks.set(route, new Set());
  }

  for (const file of publishedFiles) {
    const rel = path.relative(site.srcDir, file.file);
    const raw = await fs.readFile(file.file, "utf8");

    checkFrontmatter(raw, rel, file.route, errors, warnings);
    checkMetadata(raw, rel, file.route, warnings);
    checkHeadingIds(raw, rel, file.route, warnings);
    checkCodeLanguages(raw, rel, file.route, warnings);
    await checkImages(site, raw, rel, file, warnings);

    for (const href of extractMarkdownLinks(raw)) {
      await checkContentLink(
        href,
        rel,
        file.route,
        routeSet,
        errors,
        warnings,
        site.ignoreDeadLinks,
        outboundLinks,
        inboundLinks,
        options,
      );
    }
  }

  checkOrphanAndUnreachablePages(site, routeSet, inboundLinks, outboundLinks, warnings);

  const allRoutes = [...routes, ...tagRoutes].sort();
  const score = computeCheckScore(errors, warnings);
  const stats = buildCheckStats(errors, warnings);
  const result: DocumentationCheckResult = { score, errors, warnings, stats, routes: allRoutes };
  return { ...result, issues: combineIssues(result) };
}

async function checkContentLink(
  href: string,
  rel: string,
  fromRoute: string,
  routeSet: Set<string>,
  errors: CheckIssue[],
  warnings: CheckIssue[],
  ignoreDeadLinks: ResolvedConfig["ignoreDeadLinks"],
  outboundLinks: Map<string, Set<string>>,
  inboundLinks: Map<string, Set<string>>,
  options: CheckOptions,
): Promise<void> {
  if (href.startsWith("#")) return;
  if (isStaticAssetHref(href)) return;

  if (isExternalHref(href)) {
    if (options.external && /^https?:\/\//i.test(href)) {
      const ok = await verifyExternalHref(href);
      if (!ok) {
        pushWarning(warnings, "external-link", `${rel} links to unreachable external URL ${href}`, {
          file: rel,
          route: fromRoute,
        });
      }
    }
    return;
  }

  const markdownRoute = fileHrefToRoute(href, fromRoute);
  const internalRoute = resolveInternalRoute(href, fromRoute);
  const targetRoute = markdownRoute ?? internalRoute;

  if (!targetRoute) {
    if (shouldIgnoreDeadLink(href, ignoreDeadLinks, { from: rel })) return;
    pushWarning(
      warnings,
      "unresolvable-link",
      `${rel} contains a relative link that could not be resolved: ${href}`,
      { file: rel, route: fromRoute },
    );
    return;
  }

  outboundLinks.get(fromRoute)?.add(targetRoute);
  inboundLinks.get(targetRoute)?.add(fromRoute);

  if (!routeSet.has(targetRoute)) {
    if (shouldIgnoreDeadLink(href, ignoreDeadLinks, { from: rel, route: targetRoute })) return;
    pushError(errors, "broken-link", `${rel} links to missing page ${href} (${targetRoute})`, {
      file: rel,
      route: fromRoute,
    });
  }
}

function checkFrontmatter(
  raw: string,
  rel: string,
  route: string,
  errors: CheckIssue[],
  warnings: CheckIssue[],
): void {
  try {
    const parsed = matter(raw);
    if (parsed.data !== null && typeof parsed.data !== "object") {
      pushError(errors, "invalid-frontmatter", `${rel} frontmatter must be an object`, {
        file: rel,
        route,
      });
      return;
    }
    const data = (parsed.data ?? {}) as Record<string, unknown>;
    if (data.layout !== undefined && !isPageLayout(data.layout)) {
      pushWarning(
        warnings,
        "layout",
        `${rel} uses unknown layout "${String(data.layout)}" (expected ${PAGE_LAYOUTS.join(", ")})`,
        { file: rel, route },
      );
    }
    if (data.draft !== undefined && typeof data.draft !== "boolean") {
      pushWarning(warnings, "invalid-frontmatter", `${rel} frontmatter "draft" must be a boolean`, {
        file: rel,
        route,
      });
    }
  } catch (err) {
    pushError(
      errors,
      "invalid-frontmatter",
      `${rel} has invalid frontmatter: ${err instanceof Error ? err.message : String(err)}`,
      { file: rel, route },
    );
  }
}

function checkMetadata(raw: string, rel: string, route: string, warnings: CheckIssue[]): void {
  const parsed = matter(raw);
  const titleFromFm =
    typeof parsed.data?.title === "string" && parsed.data.title.trim()
      ? parsed.data.title.trim()
      : undefined;
  const h1 = extractFirstH1(raw);
  if (!titleFromFm && !h1) {
    pushWarning(warnings, "missing-title", `${rel} has no page title (frontmatter or H1)`, {
      file: rel,
      route,
    });
  }

  const description =
    typeof parsed.data?.description === "string" ? parsed.data.description.trim() : "";
  if (!description) {
    pushWarning(warnings, "missing-description", `${rel} has no description in frontmatter`, {
      file: rel,
      route,
    });
  }
}

function checkHeadingIds(raw: string, rel: string, route: string, warnings: CheckIssue[]): void {
  const customIds = extractCustomHeadingIds(raw);
  const seenCustom = new Set<string>();
  for (const id of customIds) {
    if (seenCustom.has(id)) {
      pushWarning(warnings, "duplicate-heading-id", `${rel} repeats custom heading id "${id}"`, {
        file: rel,
        route,
      });
    }
    seenCustom.add(id);
  }

  const headings = extractHeadingsFromContent(matter(raw).content);
  const seenGenerated = new Set<string>();
  for (const heading of headings) {
    if (seenGenerated.has(heading.id)) {
      pushWarning(warnings, "duplicate-heading-id", `${rel} repeats heading id "${heading.id}"`, {
        file: rel,
        route,
      });
    }
    seenGenerated.add(heading.id);
  }
}

function checkCodeLanguages(raw: string, rel: string, route: string, warnings: CheckIssue[]): void {
  for (const fence of extractCodeFenceLanguages(raw)) {
    if (isKnownCodeLanguage(fence.lang)) continue;
    pushWarning(
      warnings,
      "unknown-code-language",
      `${rel}:${fence.line} uses unknown code block language "${fence.lang}"`,
      { file: rel, route },
    );
  }
}

async function checkImages(
  site: ResolvedConfig,
  raw: string,
  rel: string,
  file: ContentFile,
  warnings: CheckIssue[],
): Promise<void> {
  for (const image of extractMarkdownImages(raw)) {
    if (!image.alt.trim()) {
      pushWarning(warnings, "missing-alt-text", `${rel} image "${image.src}" is missing alt text`, {
        file: rel,
        route: file.route,
      });
    }
    const assetPath = resolveLocalAssetPath(image.src, file.file, site.srcDir, site.site.base);
    if (!assetPath) continue;
    try {
      await fs.access(assetPath);
    } catch {
      pushWarning(warnings, "missing-image", `${rel} references missing image file ${image.src}`, {
        file: rel,
        route: file.route,
      });
    }
  }
}

function checkOrphanAndUnreachablePages(
  site: ResolvedConfig,
  routeSet: Set<string>,
  inboundLinks: Map<string, Set<string>>,
  outboundLinks: Map<string, Set<string>>,
  warnings: CheckIssue[],
): void {
  const seeds = collectNavSeeds(site, routeSet);
  const reachable = bfsRoutes(seeds, outboundLinks);
  const redirectRoutes = redirectFromRoutes(site.redirects);

  for (const route of routeSet) {
    if (redirectRoutes.has(route)) continue;
    const inbound = inboundLinks.get(route) ?? new Set();
    const hasInbound = [...inbound].some((source) => source !== route);
    const isRoot = route === "/" || site.i18n?.locales.some((locale) => route === locale.prefix);
    if (!hasInbound && !isRoot && !seeds.has(route)) {
      pushWarning(warnings, "orphan-page", `orphan page with no inbound links: ${route}`, {
        route,
      });
    }
    if (!reachable.has(route) && !seeds.has(route)) {
      pushWarning(
        warnings,
        "unreachable-page",
        `page is not reachable from navigation or internal links: ${route}`,
        { route },
      );
    }
  }
}

function collectNavSeeds(site: ResolvedConfig, routeSet: Set<string>): Set<string> {
  const seeds = new Set<string>(["/"]);
  for (const route of routeSet) {
    if (route === "/") seeds.add(route);
  }
  for (const item of flattenNavLeafItems(site.themeConfig.nav)) {
    if (item.link) seeds.add(normalizeRoute(item.link));
  }
  for (const group of allSidebarGroups(site.themeConfig.sidebar)) {
    for (const item of flattenSidebarLeafItems(group.items)) {
      if (item.link) seeds.add(normalizeRoute(item.link));
    }
  }
  for (const locale of site.i18n?.locales ?? []) {
    if (locale.prefix) seeds.add(normalizeRoute(locale.prefix));
    for (const item of flattenNavLeafItems(locale.themeConfig.nav)) {
      if (item.link) seeds.add(normalizeRoute(item.link));
    }
    for (const group of allSidebarGroups(locale.themeConfig.sidebar)) {
      for (const item of flattenSidebarLeafItems(group.items)) {
        if (item.link) seeds.add(normalizeRoute(item.link));
      }
    }
  }
  return seeds;
}

function bfsRoutes(seeds: Set<string>, outboundLinks: Map<string, Set<string>>): Set<string> {
  const visited = new Set<string>();
  const queue = [...seeds];
  while (queue.length) {
    const route = queue.shift();
    if (!route || visited.has(route)) continue;
    visited.add(route);
    for (const next of outboundLinks.get(route) ?? []) {
      if (!visited.has(next)) queue.push(next);
    }
  }
  return visited;
}

function checkLocaleRoots(site: ResolvedConfig, routeSet: Set<string>, errors: CheckIssue[]): void {
  const requiredRoots = site.i18n ? site.i18n.locales.map((locale) => locale.prefix || "/") : ["/"];
  for (const rootRoute of requiredRoots) {
    if (routeSet.has(rootRoute)) continue;
    pushError(
      errors,
      "config",
      rootRoute === "/"
        ? "missing root page: add index.md or index.mdx"
        : `missing locale root page: add ${rootRoute.replace(/^\//, "")}/index.md or ${rootRoute.replace(/^\//, "")}/index.mdx`,
      { route: rootRoute },
    );
  }
}

function checkNavTargets(site: ResolvedConfig, warnings: CheckIssue[]): void {
  const inspect = (label: string, items: ReturnType<typeof flattenNavLeafItems>): void => {
    for (const item of items) {
      if (item.link?.trim()) continue;
      pushWarning(warnings, "nav-target", `${label} item "${item.text}" has no link target`);
    }
  };

  inspect("nav", flattenNavLeafItems(site.themeConfig.nav));
  for (const group of allSidebarGroups(site.themeConfig.sidebar)) {
    inspect("sidebar", flattenSidebarLeafItems(group.items));
  }
  for (const locale of site.i18n?.locales ?? []) {
    inspect(`${locale.key} nav`, flattenNavLeafItems(locale.themeConfig.nav));
    for (const group of allSidebarGroups(locale.themeConfig.sidebar)) {
      inspect(`${locale.key} sidebar`, flattenSidebarLeafItems(group.items));
    }
  }
}

function checkRedirectRules(
  site: ResolvedConfig,
  routeSet: Set<string>,
  errors: CheckIssue[],
  warnings: CheckIssue[],
): void {
  for (const issue of validateRedirectsForCheck(site.redirects, routeSet)) {
    if (issue.level === "error") {
      pushError(errors, issue.code, issue.message, { route: issue.path });
    } else {
      pushWarning(warnings, issue.code, issue.message, { route: issue.path });
    }
  }
  checkCanonicalConflicts(site, errors);
}

function checkCanonicalConflicts(site: ResolvedConfig, errors: CheckIssue[]): void {
  for (const [alias, source] of Object.entries(site.rewrites)) {
    const normalizedAlias = normalizeRoute(alias);
    const normalizedSource = normalizeRoute(source);
    if (normalizedAlias === normalizedSource) {
      pushError(
        errors,
        "canonical-conflict",
        `rewrite alias and source are identical: ${normalizedAlias}`,
        { route: normalizedAlias },
      );
    }
  }
}

function checkMissingTranslations(
  site: ResolvedConfig,
  routeSet: Set<string>,
  warnings: CheckIssue[],
): void {
  if (!site.i18n || site.i18n.locales.length < 2) return;

  const keysByLocale = new Map<string, Set<string>>();
  for (const locale of site.i18n.locales) {
    const keys = new Set<string>();
    for (const route of routeSet) {
      if (locale.prefix && route !== locale.prefix && !route.startsWith(`${locale.prefix}/`)) {
        continue;
      }
      if (locale.prefix && route === locale.prefix) {
        keys.add("/");
        continue;
      }
      keys.add(routePathKey(route, site.i18n));
    }
    keysByLocale.set(locale.key, keys);
  }

  const defaultKeys = keysByLocale.get(site.i18n.defaultLocaleKey) ?? new Set<string>();
  for (const [localeKey, keys] of keysByLocale) {
    if (localeKey === site.i18n.defaultLocaleKey) continue;
    for (const key of defaultKeys) {
      if (keys.has(key)) continue;
      pushWarning(
        warnings,
        "missing-translation",
        `locale "${localeKey}" is missing translation for route key ${key}`,
        { route: key },
      );
    }
  }
}

function checkPageChrome(
  site: ResolvedConfig,
  files: ContentFile[],
  routes: Set<string>,
  errors: CheckIssue[],
  warnings: CheckIssue[],
  ignoreDeadLinks: ResolvedConfig["ignoreDeadLinks"],
): void {
  for (const file of files) {
    const meta = readMarkdownMetadata(file.file).meta;
    const rel = path.relative(site.srcDir, file.file);
    const layout = pageLayoutFromMeta(meta);
    if (layout !== "home" && (meta.hero !== undefined || meta.features !== undefined)) {
      pushWarning(
        warnings,
        "layout",
        `${rel} defines home-only frontmatter (hero/features) on layout "${layout}"`,
        { file: rel, route: file.route },
      );
    }

    const hero = parseHero(meta.hero);
    for (const action of hero?.actions ?? []) {
      checkRouteLink(
        `${rel} hero action "${action.text}"`,
        action.link,
        routes,
        errors,
        ignoreDeadLinks,
        rel,
      );
    }

    for (const feature of parseFeatures(meta.features)) {
      if (!feature.link) continue;
      checkRouteLink(
        `${rel} feature "${feature.title}"`,
        feature.link,
        routes,
        errors,
        ignoreDeadLinks,
        rel,
      );
    }
  }
}

function checkSeoDescriptions(
  site: ResolvedConfig,
  files: ContentFile[],
  warnings: CheckIssue[],
): void {
  if (site.site.description.trim()) return;
  const missing = files.filter((file) => {
    const meta = readMarkdownMetadata(file.file);
    return typeof meta.description !== "string" || !meta.description.trim();
  });
  if (missing.length > 0) {
    pushWarning(
      warnings,
      "seo",
      `site.description is empty and ${missing.length} page(s) lack frontmatter description (SEO meta may be missing)`,
    );
  }
}

function checkConfiguredLinks(
  site: ResolvedConfig,
  routes: Set<string>,
  errors: CheckIssue[],
  ignoreDeadLinks: ResolvedConfig["ignoreDeadLinks"],
): void {
  for (const item of flattenNavLeafItems(site.themeConfig.nav)) {
    checkRouteLink(
      `nav item "${item.text}"`,
      item.link,
      routes,
      errors,
      ignoreDeadLinks,
      "themeConfig.nav",
    );
  }
  for (const group of allSidebarGroups(site.themeConfig.sidebar)) {
    for (const item of flattenSidebarLeafItems(group.items)) {
      checkRouteLink(
        `sidebar item "${item.text}"`,
        item.link,
        routes,
        errors,
        ignoreDeadLinks,
        "themeConfig.sidebar",
      );
    }
  }
  for (const locale of site.i18n?.locales ?? []) {
    for (const item of flattenNavLeafItems(locale.themeConfig.nav)) {
      checkRouteLink(
        `${locale.key} nav item "${item.text}"`,
        item.link,
        routes,
        errors,
        ignoreDeadLinks,
        `${locale.key}.nav`,
      );
    }
    for (const group of allSidebarGroups(locale.themeConfig.sidebar)) {
      for (const item of flattenSidebarLeafItems(group.items)) {
        checkRouteLink(
          `${locale.key} sidebar item "${item.text}"`,
          item.link,
          routes,
          errors,
          ignoreDeadLinks,
          `${locale.key}.sidebar`,
        );
      }
    }
  }
}

function checkSearchConfig(site: ResolvedConfig, warnings: CheckIssue[]): void {
  checkOneSearchConfig("themeConfig.search", site.themeConfig.search, undefined, warnings);
  for (const locale of site.i18n?.locales ?? []) {
    if (locale.themeConfig.search === undefined) continue;
    checkOneSearchConfig(
      `${locale.key} themeConfig.search`,
      locale.themeConfig.search,
      locale.key,
      warnings,
    );
  }
}

function checkOneSearchConfig(
  label: string,
  search: SearchConfig | undefined,
  localeKey: string | undefined,
  warnings: CheckIssue[],
): void {
  if (!isAlgoliaSearchEnabled(search)) return;
  const options = algoliaOptionsFromSearch(search);
  if (!options) return;
  const resolved = resolveAlgoliaOptions(options, localeKey);
  if (!validateAlgoliaCredentials(resolved).valid) {
    pushWarning(
      warnings,
      "config",
      `${label}: Algolia search is enabled but appId, apiKey, or indexName is missing`,
    );
  }
}

function checkSocialLinks(site: ResolvedConfig, warnings: CheckIssue[]): void {
  checkOneSocialLinks("themeConfig.socialLinks", site.themeConfig.socialLinks, warnings);
  for (const locale of site.i18n?.locales ?? []) {
    if (!locale.themeConfig.socialLinks?.length) continue;
    checkOneSocialLinks(
      `${locale.key} themeConfig.socialLinks`,
      locale.themeConfig.socialLinks,
      warnings,
    );
  }
}

function checkOneSocialLinks(
  label: string,
  links: SocialLink[] | undefined,
  warnings: CheckIssue[],
): void {
  for (const [index, link] of (links ?? []).entries()) {
    if (!/^https?:\/\//i.test(link.link)) {
      pushWarning(
        warnings,
        "config",
        `${label}[${index}] should use an http(s) URL (got "${link.link}")`,
      );
    }
  }
}

function checkRouteLink(
  label: string,
  link: string | undefined,
  routes: Set<string>,
  errors: CheckIssue[],
  ignoreDeadLinks: ResolvedConfig["ignoreDeadLinks"],
  from: string,
): void {
  if (!link) return;
  if (isExternalHref(link)) return;
  const normalized = normalizeRoute(link);
  if (!routes.has(normalized)) {
    if (shouldIgnoreDeadLink(link, ignoreDeadLinks, { from, route: normalized })) return;
    pushError(errors, "broken-link", `${label} points to missing route ${link} (${normalized})`, {
      route: normalized,
    });
  }
}
