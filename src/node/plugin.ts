import { resolveFileLastUpdated } from "./lastUpdated.js";
import path from "node:path";
import type { Plugin, ViteDevServer } from "vite";
import type { SiteConfig } from "./siteConfig.js";
import { readMarkdownFile, readMarkdownMetadata } from "./markdown.js";
import { siteConfigToClientJson } from "./config.js";
import { PREACTPRESS_THEME_BOOT_SCRIPT, PREACTPRESS_THEME_SCRIPT } from "../shared/theme.js";
import { createFaviconMiddleware, faviconHtmlTags } from "./favicon.js";
import { createDevSsrMiddleware } from "./devSsr.js";
import {
  CONTENT_EXTENSIONS,
  mdFileToRoute,
  scanContentFiles,
  type ContentFile,
  type ContentKind,
} from "./content.js";
import { resolveDynamicRoutes, type DynamicRouteEntry } from "./dynamicRoutes.js";
import { resolvePageDataMap } from "./pageDataLoaders.js";
import { renderMarkdown } from "./markdown.js";
import { collectTagIndexPages, renderTagIndexHtml, listTagIndexRoutes } from "./tagIndex.js";
import { resolvePageTags } from "../shared/tags.js";
import { isDraftPage, pageImageFromMeta, pageTypeFromMeta } from "../shared/pageMeta.js";
import { localeFromRoute } from "../shared/locale.js";
import { applyRouteRewrites } from "../shared/rewrites.js";

const VIRTUAL_LAYOUT = "\0virtual:preactpress-layout";
const VIRTUAL_PAGES = "\0virtual:preactpress-pages";
const VIRTUAL_SITE = "\0virtual:preactpress-site";
export { mdFileToRoute };

export async function listMarkdownRoutes(site: SiteConfig): Promise<string[]> {
  const files = (await scanContentFiles(site))
    .filter((file) => !isDraftPage(readMarkdownMetadata(file.file).meta))
    .map((file) => file.route);
  const dynamicRoutes = (await resolveDynamicRoutes(site)).map((entry) => entry.route);
  const routeSet = new Set([...files, ...dynamicRoutes]);
  const tagRoutes = await listTagIndexRoutes(site, routeSet);
  return [...routeSet, ...tagRoutes].sort();
}

export function preactPressPlugin(site: SiteConfig): Plugin {
  const routeToFile = new Map<string, ContentFile>();
  const dynamicRoutes = new Map<string, DynamicRouteEntry>();
  let pageDataByRoute = new Map<string, unknown>();
  let ssrPagesModule = "";
  let clientPagesModule = "";

  async function scan(): Promise<void> {
    routeToFile.clear();
    dynamicRoutes.clear();
    for (const file of await scanContentFiles(site)) {
      if (isDraftPage(readMarkdownMetadata(file.file).meta)) continue;
      routeToFile.set(file.route, file);
    }
    for (const entry of await resolveDynamicRoutes(site)) {
      if (entry.kind === "mdx") {
        throw new Error(
          `preactpress: dynamic MDX templates are not supported (${path.relative(site.srcDir, entry.templateFile)})`,
        );
      }
      dynamicRoutes.set(entry.route, entry);
    }
    pageDataByRoute = await resolvePageDataMap(site);
    if (Object.keys(site.rewrites).length > 0) {
      applyRouteRewrites(routeToFile, site.rewrites);
    }
  }

  function attachPageData(route: string, meta: Record<string, unknown>): Record<string, unknown> {
    const data = pageDataByRoute.get(route);
    if (data === undefined) return meta;
    return { ...meta, contentData: data };
  }

  async function buildPagesModule(ssr: boolean): Promise<string> {
    const filesList = [...routeToFile.values()];
    const tagPages = collectTagIndexPages(filesList, site);
    const fileRouteSet = new Set([...routeToFile.keys(), ...dynamicRoutes.keys()]);
    const syntheticTagRoutes = tagPages
      .map((tagPage) => tagPage.route)
      .filter((route) => !fileRouteSet.has(route));
    const routes = [...fileRouteSet, ...syntheticTagRoutes].sort();
    const entries: Record<
      string,
      {
        meta: Record<string, unknown>;
        kind: ContentKind;
        html: string;
        title?: string;
        description?: string;
        tags?: string[];
        image?: string;
        pageType?: "website" | "article";
        headings: { id: string; text: string; level: number }[];
        relativePath?: string;
        lastUpdated?: string;
      }
    > = {};
    const mdxImports: string[] = [];
    const mdxEntries: string[] = [];
    const mdxLoaders: string[] = [];
    const metaEntries: string[] = [];
    let mdxIndex = 0;
    for (const [route, file] of routeToFile) {
      const relativePath = path.relative(site.srcDir, file.file).split(path.sep).join("/");
      const lastUpdated = await resolveFileLastUpdated(file.file, site);
      if (file.kind === "mdx") {
        const r = readMarkdownMetadata(file.file);
        const tags = resolvePageTags(r.meta);
        const image = pageImageFromMeta(r.meta);
        const pageType = pageTypeFromMeta(r.meta);
        const meta = {
          kind: "mdx",
          meta: attachPageData(route, r.meta),
          title: r.title,
          description: r.description,
          tags,
          image,
          pageType,
          headings: r.headings,
          relativePath,
          lastUpdated,
        };
        metaEntries.push(`${JSON.stringify(route)}: ${JSON.stringify(meta)}`);
        mdxLoaders.push(`${JSON.stringify(route)}: () => import(${JSON.stringify(file.file)})`);
        const componentName = `MdxPage${mdxIndex}`;
        mdxIndex += 1;
        if (ssr) {
          mdxImports.push(`import ${componentName} from ${JSON.stringify(file.file)};`);
          mdxEntries.push(
            `${JSON.stringify(route)}: { kind: "mdx", Component: ${componentName}, meta: ${JSON.stringify(meta.meta)}, title: ${JSON.stringify(r.title)}, description: ${JSON.stringify(r.description)}, tags: ${JSON.stringify(tags)}, image: ${JSON.stringify(image)}, pageType: ${JSON.stringify(pageType)}, headings: ${JSON.stringify(r.headings)}, relativePath: ${JSON.stringify(relativePath)}, lastUpdated: ${JSON.stringify(lastUpdated)} }`,
          );
        }
        continue;
      }

      const r = await readMarkdownFile(file.file, {
        ...site.markdown,
        route,
        routes,
        localePrefix: localeFromRoute(route, site.i18n)?.prefix,
        srcDir: site.srcDir,
      });
      entries[route] = {
        kind: "markdown",
        meta: attachPageData(route, r.meta),
        html: r.html,
        title: r.title,
        description: r.description,
        tags: resolvePageTags(r.meta),
        image: pageImageFromMeta(r.meta),
        pageType: pageTypeFromMeta(r.meta),
        headings: r.headings,
        relativePath,
        lastUpdated,
      };
      metaEntries.push(
        `${JSON.stringify(route)}: ${JSON.stringify({
          ...entries[route],
          html: undefined,
        })}`,
      );
    }
    for (const [route, dynamic] of dynamicRoutes) {
      const r = await renderMarkdown(dynamic.source, dynamic.templateFile, {
        ...site.markdown,
        route,
        routes,
        localePrefix: localeFromRoute(route, site.i18n)?.prefix,
        srcDir: site.srcDir,
      });
      const meta = attachPageData(route, {
        ...r.meta,
        params: dynamic.params,
        props: dynamic.props,
      });
      entries[route] = {
        kind: "markdown",
        meta,
        html: r.html,
        title: r.title,
        description: r.description,
        tags: resolvePageTags(r.meta),
        image: pageImageFromMeta(r.meta),
        pageType: pageTypeFromMeta(r.meta),
        headings: r.headings,
        relativePath: path.relative(site.srcDir, dynamic.templateFile).split(path.sep).join("/"),
        lastUpdated: undefined,
      };
      metaEntries.push(
        `${JSON.stringify(route)}: ${JSON.stringify({
          ...entries[route],
          html: undefined,
        })}`,
      );
    }
    for (const tagPage of tagPages) {
      const tr = tagPage.route;
      if (fileRouteSet.has(tr)) continue;
      entries[tr] = {
        kind: "markdown",
        meta: { tagIndex: true, tag: tagPage.label, tagSlug: tagPage.slug },
        html: renderTagIndexHtml(tagPage.slug, tagPage.label, tagPage.items),
        title: `Tag: ${tagPage.label}`,
        description: `Pages tagged “${tagPage.label}”`,
        tags: [tagPage.label],
        image: undefined,
        pageType: "website",
        headings: [],
        relativePath: undefined,
        lastUpdated: undefined,
      };
      metaEntries.push(
        `${JSON.stringify(tr)}: ${JSON.stringify({
          kind: "markdown",
          meta: entries[tr].meta,
          title: entries[tr].title,
          description: entries[tr].description,
          tags: entries[tr].tags,
          image: entries[tr].image,
          pageType: entries[tr].pageType,
          headings: entries[tr].headings,
          relativePath: entries[tr].relativePath,
          lastUpdated: entries[tr].lastUpdated,
        })}`,
      );
    }
    const markdownEntries = Object.entries(entries).map(
      ([route, page]) => `${JSON.stringify(route)}: ${JSON.stringify(page)}`,
    );
    if (ssr) {
      return `${mdxImports.join("\n")}\nexport const routes = ${JSON.stringify(routes)};\nexport const pagesMeta = {};\nexport const mdxLoaders = {};\nexport const pages = {\n${[
        ...markdownEntries,
        ...mdxEntries,
      ]
        .map((entry) => `  ${entry}`)
        .join(",\n")}\n};\n`;
    }
    return `export const routes = ${JSON.stringify(routes)};\nexport const pagesMeta = {\n${metaEntries.map((entry) => `  ${entry}`).join(",\n")}\n};\nexport const mdxLoaders = {\n${mdxLoaders.map((entry) => `  ${entry}`).join(",\n")}\n};\nexport const pages = pagesMeta;\n`;
  }

  function invalidateVirtuals(server: ViteDevServer) {
    ssrPagesModule = "";
    clientPagesModule = "";
    for (const id of [VIRTUAL_PAGES, VIRTUAL_SITE]) {
      const m = server.moduleGraph.getModuleById(id);
      if (m) server.moduleGraph.invalidateModule(m);
    }
  }

  return {
    name: "preactpress",
    enforce: "pre",
    transformIndexHtml(html) {
      if (!html.includes("</head>")) return html;
      const faviconTags = faviconHtmlTags(site.head);
      const tags = [
        ...(faviconTags ? [faviconTags] : []),
        `<script src="${site.site.base === "/" ? "" : site.site.base}/${PREACTPRESS_THEME_SCRIPT}"></script>`,
      ];
      const inject =
        html.includes('rel="icon"') || html.includes("rel='icon'") ? tags.slice(1) : tags;
      return html.replace("</head>", `    ${inject.join("\n    ")}\n  </head>`);
    },
    async buildStart() {
      await scan();
    },
    configureServer(server) {
      server.middlewares.use(createDevSsrMiddleware(site, server));
      server.middlewares.use(
        createFaviconMiddleware(site.site.base, path.join(site.srcDir, "public")),
      );
      server.middlewares.use((req, res, next) => {
        const pathname = req.url?.split("?")[0] ?? "";
        const base = site.site.base === "/" ? "" : site.site.base;
        if (pathname !== `${base}/${PREACTPRESS_THEME_SCRIPT}`) return next();
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/javascript; charset=utf-8");
        res.end(PREACTPRESS_THEME_BOOT_SCRIPT);
      });
      server.watcher.add(site.srcDir);
      server.watcher.on("all", async (_evt, file) => {
        if (typeof file !== "string") return;
        if (
          CONTENT_EXTENSIONS.some((ext) => file.endsWith(ext)) ||
          file.endsWith(".data.ts") ||
          file.endsWith(".paths.ts")
        ) {
          await scan();
          invalidateVirtuals(server);
        }
      });
    },
    resolveId(id) {
      if (id === "virtual:preactpress-layout") return VIRTUAL_LAYOUT;
      if (id === "virtual:preactpress-pages") return VIRTUAL_PAGES;
      if (id === "virtual:preactpress-site") return VIRTUAL_SITE;
      return undefined;
    },
    async load(id, options) {
      if (id === VIRTUAL_LAYOUT) {
        return `export { default } from ${JSON.stringify(site.theme)};\n`;
      }
      if (id === VIRTUAL_SITE) {
        const data = JSON.parse(siteConfigToClientJson(site)) as {
          site: SiteConfig["site"];
          themeConfig: SiteConfig["themeConfig"];
          i18n: SiteConfig["i18n"];
        };
        return `export const site = ${JSON.stringify(data.site)};\nexport const themeConfig = ${JSON.stringify(data.themeConfig)};\nexport const i18n = ${JSON.stringify(data.i18n)};\nexport const mpa = ${JSON.stringify(Boolean((data as { mpa?: boolean }).mpa))};\n`;
      }
      if (id === VIRTUAL_PAGES) {
        if (options?.ssr) {
          if (!ssrPagesModule) ssrPagesModule = await buildPagesModule(true);
          return ssrPagesModule;
        }
        if (!clientPagesModule) clientPagesModule = await buildPagesModule(false);
        return clientPagesModule;
      }
      return undefined;
    },
  };
}
