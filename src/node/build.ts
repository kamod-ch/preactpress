import path from "node:path";
import fs from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { build as viteBuild, mergeConfig } from "vite";
import preact from "@preact/preset-vite";
import { applySiteBaseOverride, resolveConfigForBuild } from "./config.js";
import type { SiteConfig } from "./siteConfig.js";
import { absoluteUrl, escapeHtml, pageHtml } from "./html.js";
import { PACKAGE_ROOT } from "./packageRoot.js";
import { preactPressMdxPlugin } from "./mdx.js";
import { scanAllContentFiles } from "./content.js";
import { hydrateRoutePage } from "./pageHydration.js";
import { listMarkdownRoutes, preactPressPlugin } from "./plugin.js";
import { resolvePreactEsm } from "./resolveDeps.js";
import { copyFavicons } from "./favicon.js";
import { getHighlighter } from "./markdown.js";
import { contentChunkPath } from "../shared/contentChunk.js";
import { excerptFromHtml } from "../shared/pageMeta.js";
import { PREACTPRESS_THEME_BOOT_SCRIPT, PREACTPRESS_THEME_SCRIPT } from "../shared/theme.js";
import type { PageView } from "../client/types.js";
import {
  fileExists,
  hashContent,
  readBuildCache,
  removeStaleRouteOutputs,
  writeBuildCache,
  type BuildCache,
} from "./buildCache.js";
import { writeAtomFeed } from "./feed.js";
import { localeFromRoute, localizedRouteForLocale } from "../shared/locale.js";
import { localizedRouteForVersion, versionFromRoute, canonicalRouteForPage } from "../shared/version.js";
import { workspaceFromRoute } from "../shared/workspace.js";
import { serializablePageForClient } from "../shared/aiMarkdown.js";
import { applyTransformHtml, applyTransformPageData, invokeBuildEnd } from "./hooks.js";
import { invokePluginsBuildStart } from "./pluginRuntime.js";
import { writeRedirectOutputs } from "./redirectOutputs.js";
import { redirectFromRoutes } from "./redirects.js";

export { publicUrl } from "./html.js";

const CLIENT_ALIAS = "preactpress/app";

function clientEntry(): string {
  return path.join(PACKAGE_ROOT, "src/client/entry-client.tsx");
}

function ssrEntry(): string {
  return path.join(PACKAGE_ROOT, "src/client/entry-ssr.tsx");
}

async function readManifest(
  outDir: string,
): Promise<Record<string, { file?: string; css?: string[]; isEntry?: boolean }>> {
  const candidates = [
    path.join(outDir, "manifest.json"),
    path.join(outDir, ".vite", "manifest.json"),
  ];
  for (const p of candidates) {
    try {
      const raw = await fs.readFile(p, "utf8");
      return JSON.parse(raw) as Record<
        string,
        { file?: string; css?: string[]; isEntry?: boolean }
      >;
    } catch {
      /* try next */
    }
  }
  throw new Error("preactpress: could not read Vite client manifest");
}

export function pickMainEntry(
  manifest: Record<string, { file?: string; css?: string[]; isEntry?: boolean }>,
): { file: string; css: string[] } {
  const main = manifest["main"];
  if (main?.file?.endsWith(".js")) {
    return { file: main.file, css: main.css ?? [] };
  }
  for (const chunk of Object.values(manifest)) {
    if (chunk.isEntry && chunk.file?.endsWith(".js")) {
      return { file: chunk.file, css: chunk.css ?? [] };
    }
  }
  throw new Error("preactpress: no entry chunk in manifest");
}

export function routeToOutPath(route: string, cleanUrls = true): string {
  if (route === "/") return "index.html";
  const clean = route.replace(/^\//, "");
  if (cleanUrls) return path.join(clean, "index.html");
  return `${clean}.html`;
}

export async function mapConcurrent<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const out: R[] = Array.from({ length: items.length }) as R[];
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const index = next;
      next += 1;
      out[index] = await fn(items[index], index);
    }
  });
  await Promise.all(workers);
  return out;
}

export async function build(root?: string, opts: { base?: string } = {}): Promise<void> {
  const site = await resolveConfigForBuild(root);
  if (opts.base) applySiteBaseOverride(site, opts.base);
  const clientOut = path.join(site.cacheDir, "pp-client");
  const ssrOut = path.join(site.cacheDir, "pp-ssr");

  await fs.mkdir(site.outDir, { recursive: true });
  await fs.mkdir(clientOut, { recursive: true });
  await fs.mkdir(ssrOut, { recursive: true });
  await getHighlighter();

  const shared = {
    root: site.srcDir,
    base: site.site.base,
    customLogger: site.logger,
    plugins: [preactPressMdxPlugin(), preact(), preactPressPlugin(site)],
    resolve: {
      alias: [
        { find: CLIENT_ALIAS, replacement: clientEntry() },
        {
          find: /^preact\/jsx-dev-runtime$/,
          replacement: resolvePreactEsm("preact/jsx-dev-runtime"),
        },
        { find: /^preact\/jsx-runtime$/, replacement: resolvePreactEsm("preact/jsx-runtime") },
        { find: /^preact\/devtools$/, replacement: resolvePreactEsm("preact/devtools") },
        { find: /^preact\/hooks$/, replacement: resolvePreactEsm("preact/hooks") },
        { find: /^preact$/, replacement: resolvePreactEsm("preact") },
      ],
    },
  };

  await viteBuild(
    mergeConfig(mergeConfig(shared, site.vite ?? {}), {
      root: site.srcDir,
      base: site.site.base,
      build: {
        manifest: true,
        outDir: clientOut,
        emptyOutDir: true,
        rolldownOptions: {
          input: { main: CLIENT_ALIAS },
        },
      },
    }),
  );

  await viteBuild(
    mergeConfig(mergeConfig(shared, site.vite ?? {}), {
      root: site.srcDir,
      base: site.site.base,
      ssr: {
        /** Bundle with app Preact so SSR does not load a second `preact` via `preact-render-to-string`. */
        noExternal: ["preact-render-to-string"],
      },
      build: {
        ssr: true,
        outDir: ssrOut,
        emptyOutDir: true,
        rolldownOptions: {
          input: ssrEntry(),
          output: {
            format: "esm",
            entryFileNames: "entry-ssr.js",
          },
        },
        copyPublicDir: false,
      },
    }),
  );

  const manifest = await readManifest(clientOut);
  const main = pickMainEntry(manifest);

  const ssrAbs = path.join(ssrOut, "entry-ssr.js");
  const mod = (await import(pathToFileURL(ssrAbs).href)) as {
    resolveRoutePage: (route: string) => PageView;
    renderFromPage: (
      route: string,
      page: PageView,
    ) => {
      body: string;
      title: string;
      description: string;
      tags: string[];
      image?: string;
      pageType: "website" | "article";
      page: PageView;
    };
  };

  await copyClientAssets(clientOut, site.outDir);
  await copyFavicons(site.outDir);
  await copyPublicDir(site.srcDir, site.outDir);
  await writeRuntimeScripts(site.outDir);

  const routes = await listMarkdownRoutes(site);
  site.routes = routes;
  const routeToFile = new Map(
    (await scanAllContentFiles(site)).map((file) => [file.route, file]),
  );
  await invokePluginsBuildStart(site, { command: "build", mode: "production" });
  const requiredRoots = site.i18n ? site.i18n.locales.map((locale) => locale.prefix || "/") : ["/"];
  if (site.versions.enabled) {
    for (const version of site.versions.versions.filter((entry) => !entry.isAlias && entry.prefix)) {
      requiredRoots.push(version.prefix);
    }
  }
  const missingRoot = requiredRoots.find((route) => !routes.includes(route));
  if (missingRoot) {
    const hint = site.versions.enabled
      ? `preactpress: missing index page for route ${missingRoot} (check current/ and versions/*/)`
      : "preactpress: add an index.md or index.mdx at the site root";
    throw new Error(hint);
  }

  const previousCache = await readBuildCache(site.cacheDir);
  const nextCache: BuildCache = { routes: {} };
  const renderedPages = await mapConcurrent(routes, 12, async (route) => {
    let page = await applyTransformPageData(site, route, mod.resolveRoutePage(route));
    page = await hydrateRoutePage(site, route, page, routeToFile.get(route), routes);
    const result = mod.renderFromPage(route, page);
    const html = await applyTransformHtml(
      site,
      await pageHtml({
        site,
        body: result.body,
        title: result.title,
        description: result.description,
        tags: result.tags,
        image: result.image,
        pageType: result.pageType,
        pageData: result.page,
        route,
        mainJs: main.file,
        mainCss: main.css,
      }),
      route,
      result.page,
    );
    const htmlPath = routeToOutPath(route, site.cleanUrls);
    const contentPath = result.page.kind === "markdown" ? contentChunkPath(route) : undefined;
    await writeRouteArtifacts({
      site,
      route,
      html,
      page: result.page,
      htmlPath,
      contentPath,
      previousCache,
      nextCache,
    });
    return { route, page: result.page };
  });

  const notFoundBase = mod.resolveRoutePage("/404");
  const notFoundPage = await applyTransformPageData(
    site,
    "/404",
    await hydrateRoutePage(site, "/404", notFoundBase, routeToFile.get("/404"), routes),
  );
  const notFound = mod.renderFromPage("/404", notFoundPage);
  await writeRouteArtifacts({
    site,
    route: "/404",
    html: await applyTransformHtml(
      site,
      await pageHtml({
        site,
        body: notFound.body,
        title: notFound.title,
        description: notFound.description,
        tags: notFound.tags,
        image: notFound.image,
        pageType: notFound.pageType,
        pageData: notFound.page,
        route: "/404",
        mainJs: main.file,
        mainCss: main.css,
      }),
      "/404",
      notFound.page,
    ),
    page: notFound.page,
    htmlPath: "404.html",
    contentPath: notFound.page.kind === "markdown" ? contentChunkPath("/404") : undefined,
    previousCache,
    nextCache,
  });

  await writeRedirectOutputs({ site, previousCache, nextCache });

  const activeRoutes = new Set([
    ...routes,
    "/404",
    ...site.redirects.rules.map((rule) => rule.from),
  ]);
  await removeStaleRouteOutputs(site.outDir, previousCache, activeRoutes);
  await writeBuildCache(site.cacheDir, nextCache);
  await writeSearchIndex(site, renderedPages, redirectFromRoutes(site.redirects));
  if (site.site.url && site.build.sitemap) {
    await writeSitemap(site, renderedPages, redirectFromRoutes(site.redirects));
  }
  if (site.site.url && site.build.robots) await writeRobots(site);
  if (site.site.url && site.build.feed) {
    await writeAtomFeed(
      site,
      renderedPages,
      typeof site.build.feed === "object" ? site.build.feed.limit : undefined,
    );
  }
  await invokeBuildEnd(site, renderedPages);
}

async function copyClientAssets(fromDir: string, toDir: string): Promise<void> {
  const entries = await fs.readdir(fromDir, { withFileTypes: true });
  for (const ent of entries) {
    if (ent.name === ".vite") continue;
    const src = path.join(fromDir, ent.name);
    const dest = path.join(toDir, ent.name);
    await fs.cp(src, dest, { recursive: true });
  }
}

async function copyPublicDir(srcDir: string, outDir: string): Promise<void> {
  const publicDir = path.join(srcDir, "public");
  try {
    await fs.access(publicDir);
  } catch {
    return;
  }
  await fs.cp(publicDir, outDir, { recursive: true });
}

async function writeRuntimeScripts(outDir: string): Promise<void> {
  await fs.writeFile(
    path.join(outDir, PREACTPRESS_THEME_SCRIPT),
    PREACTPRESS_THEME_BOOT_SCRIPT,
    "utf8",
  );
}

async function writeRouteArtifacts(opts: {
  site: SiteConfig;
  route: string;
  html: string;
  page: PageView;
  htmlPath: string;
  contentPath?: string;
  previousCache: BuildCache;
  nextCache: BuildCache;
}): Promise<void> {
  const hash = hashContent({
    route: opts.route,
    html: opts.html,
    page: serializablePage(opts.page, opts.site),
    contentPath: opts.contentPath,
  });
  const previous = opts.previousCache.routes[opts.route];
  const htmlFile = path.join(opts.site.outDir, opts.htmlPath);
  const contentFile = opts.contentPath ? path.join(opts.site.outDir, opts.contentPath) : undefined;
  const htmlExists = await fileExists(htmlFile);
  const contentExists = contentFile ? await fileExists(contentFile) : true;
  const unchanged = previous?.contentHash === hash && htmlExists && contentExists;

  if (!unchanged) {
    await fs.mkdir(path.dirname(htmlFile), { recursive: true });
    await fs.writeFile(htmlFile, opts.html, "utf8");
    if (contentFile && opts.page.kind === "markdown") {
      await fs.mkdir(path.dirname(contentFile), { recursive: true });
      await fs.writeFile(contentFile, JSON.stringify(serializablePage(opts.page, opts.site)), "utf8");
    }
  }

  opts.nextCache.routes[opts.route] = {
    contentHash: hash,
    htmlPath: opts.htmlPath,
    contentPath: opts.contentPath,
    mtime: new Date().toISOString(),
  };
}

function serializablePage(page: PageView, site: SiteConfig): unknown {
  const includeMarkdown = site.ai !== false && site.ai.copyMarkdown;
  return serializablePageForClient(page, includeMarkdown);
}

async function writeSitemap(
  site: SiteConfig,
  pages: Array<{ route: string; page: PageView }>,
  excludedRoutes: Set<string> = new Set(),
): Promise<void> {
  const routeSet = new Set(pages.map((page) => page.route));
  const urls = pages
    .filter(({ route }) => !excludedRoutes.has(route))
    .map(({ route, page }) => {
      const canonicalRoute =
        site.versions.enabled
          ? canonicalRouteForPage(route, routeSet, site.i18n, site.versions)
          : route;
      const lastmod = page.lastUpdated
        ? `<lastmod>${escapeHtml(page.lastUpdated.slice(0, 10))}</lastmod>`
        : "";
      const localeAlternates = site.i18n
        ? site.i18n.locales
            .map((locale) => localizedRouteForLocale(route, locale, site.i18n, routeSet))
            .filter((target) => routeSet.has(target))
            .map((target) => {
              const locale = localeFromRoute(target, site.i18n);
              const canonicalTarget =
                site.versions.enabled
                  ? canonicalRouteForPage(target, routeSet, site.i18n, site.versions)
                  : target;
              return locale
                ? `<xhtml:link rel="alternate" hreflang="${escapeHtml(locale.lang)}" href="${escapeHtml(absoluteUrl(site, canonicalTarget))}" />`
                : "";
            })
            .filter(Boolean)
            .join("")
        : "";
      const versionAlternates = site.versions.enabled
        ? site.versions.versions
            .filter((version) => !version.isAlias)
            .map((version) =>
              localizedRouteForVersion(route, version, site.versions, site.i18n, routeSet),
            )
            .filter((target) => routeSet.has(target))
            .map((target) => {
              const version = versionFromRoute(target, site.versions, site.i18n);
              return version
                ? `<xhtml:link rel="alternate" hreflang="version-${escapeHtml(version.value)}" href="${escapeHtml(absoluteUrl(site, target))}" />`
                : "";
            })
            .join("")
        : "";
      return `  <url><loc>${escapeHtml(absoluteUrl(site, canonicalRoute))}</loc>${lastmod}${localeAlternates}${versionAlternates}</url>`;
    })
    .join("\n");
  await fs.writeFile(
    path.join(site.outDir, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`,
    "utf8",
  );
}

async function writeRobots(site: SiteConfig): Promise<void> {
  await fs.writeFile(
    path.join(site.outDir, "robots.txt"),
    `User-agent: *\nAllow: /\nSitemap: ${absoluteUrl(site, "/sitemap.xml").replace(/\/$/, "")}\n`,
    "utf8",
  );
}

async function writeSearchIndex(
  site: SiteConfig,
  pages: Array<{ route: string; page: PageView }>,
  excludedRoutes: Set<string> = new Set(),
): Promise<void> {
  const entries = pages
    .filter(({ route }) => !excludedRoutes.has(route))
    .map(({ route, page }) => ({
      route,
      locale: localeFromRoute(route, site.i18n)?.key,
      version: versionFromRoute(route, site.versions, site.i18n)?.value,
      workspace: workspaceFromRoute(route, site.workspaces, site.i18n, site.versions)?.id,
      title: page.title,
      description: page.description,
      excerpt: page.kind === "markdown" ? excerptFromHtml(page.html) : page.description,
      tags: page.tags ?? [],
    }));
  await fs.writeFile(
    path.join(site.outDir, "preactpress-search.json"),
    JSON.stringify(entries),
    "utf8",
  );
}
