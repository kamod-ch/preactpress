import fs from "node:fs/promises";
import path from "node:path";
import type { PageView } from "../client/types.js";
import { escapeHtml } from "../shared/escapeHtml.js";
import { absoluteUrl } from "./html.js";
import type { SiteConfig } from "./siteConfig.js";

export async function writeAtomFeed(
  site: SiteConfig,
  pages: Array<{ route: string; page: PageView }>,
  limit?: number,
): Promise<void> {
  const entries = pages
    .filter(({ route }) => route !== "/404")
    .sort((a, b) => (b.page.lastUpdated ?? "").localeCompare(a.page.lastUpdated ?? ""))
    .slice(0, limit ?? pages.length)
    .map(({ route, page }) => {
      const url = absoluteUrl(site, route);
      const updated = page.lastUpdated ?? new Date().toISOString();
      return [
        "  <entry>",
        `    <title>${escapeHtml(page.title ?? site.site.title)}</title>`,
        `    <link href="${escapeHtml(url)}" />`,
        `    <id>${escapeHtml(url)}</id>`,
        `    <updated>${escapeHtml(updated)}</updated>`,
        page.description ? `    <summary>${escapeHtml(page.description)}</summary>` : "",
        "  </entry>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const updated = pages[0]?.page.lastUpdated ?? new Date().toISOString();
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom">',
    `  <title>${escapeHtml(site.site.title)}</title>`,
    `  <id>${escapeHtml(absoluteUrl(site, "/"))}</id>`,
    `  <updated>${escapeHtml(updated)}</updated>`,
    entries,
    "</feed>",
    "",
  ].join("\n");

  await fs.writeFile(path.join(site.outDir, "feed.xml"), xml, "utf8");
}
