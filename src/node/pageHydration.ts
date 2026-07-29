import type { SiteConfig } from "./siteConfig.js";
import type { PageView } from "../client/types.js";
import { readMarkdownFile } from "./markdown.js";
import { localeFromRoute } from "../shared/locale.js";
import { resolvePageTags } from "../shared/tags.js";
import { pageImageFromMeta, pageTypeFromMeta } from "../shared/pageMeta.js";
import type { ContentFile } from "./content.js";

/** Render markdown body when the virtual pages module only carries metadata. */
export async function hydrateRoutePage(
  site: SiteConfig,
  route: string,
  page: PageView,
  file: ContentFile | undefined,
  routes: string[],
): Promise<PageView> {
  if (page.kind !== "markdown" || page.html) return page;
  if (!file) return page;

  const rendered = await readMarkdownFile(file.file, {
    ...site.markdown,
    route,
    routes,
    localePrefix: localeFromRoute(route, site.i18n)?.prefix,
    srcDir: site.srcDir,
    site,
  });

  return {
    kind: "markdown",
    meta: page.meta,
    html: rendered.html,
    markdown: rendered.markdown,
    title: rendered.title ?? page.title,
    description: rendered.description ?? page.description,
    tags: resolvePageTags(rendered.meta),
    image: pageImageFromMeta(rendered.meta),
    pageType: pageTypeFromMeta(rendered.meta),
    headings: rendered.headings,
    relativePath: page.relativePath,
    lastUpdated: page.lastUpdated,
  };
}
