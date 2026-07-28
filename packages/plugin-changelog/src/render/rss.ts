import type { ChangelogManifest, ChangelogRelease } from "../types/index.js";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function releaseSummary(release: ChangelogRelease): string {
  const parts: string[] = [];
  if (release.description) parts.push(release.description.slice(0, 280));
  const counts = {
    breaking: release.sections.filter((section) => section.kind === "breaking").length,
    feature: release.sections.filter((section) => section.kind === "feature").length,
    fix: release.sections.filter((section) => section.kind === "fix").length,
  };
  const meta = [
    counts.breaking ? `${counts.breaking} breaking section(s)` : "",
    counts.feature ? `${counts.feature} feature section(s)` : "",
    counts.fix ? `${counts.fix} fix section(s)` : "",
  ].filter(Boolean);
  if (meta.length) parts.push(meta.join(", "));
  return parts.join(" — ") || release.version;
}

export interface ChangelogFeedOptions {
  siteUrl: string;
  siteTitle: string;
  limit?: number;
}

export function renderChangelogAtomFeed(
  manifest: ChangelogManifest,
  options: ChangelogFeedOptions,
): string {
  const baseUrl = options.siteUrl.replace(/\/+$/, "");
  const entries = manifest.releases
    .filter((release) => release.route.startsWith(`${manifest.baseRoute}/`) && release.date && !release.draft)
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
    .slice(0, options.limit ?? manifest.releases.length)
    .map((release) => {
      const url = `${baseUrl}${release.route}/`;
      const updated = release.date ?? new Date().toISOString();
      return [
        "  <entry>",
        `    <title>${escapeXml(release.title ?? release.version)}</title>`,
        `    <link href="${escapeXml(url)}" />`,
        `    <id>${escapeXml(url)}</id>`,
        `    <updated>${escapeXml(updated)}</updated>`,
        `    <summary>${escapeXml(releaseSummary(release))}</summary>`,
        "  </entry>",
      ].join("\n");
    })
    .join("\n");

  const updated =
    manifest.releases.find((release) => release.date)?.date ?? new Date().toISOString();
  const feedUrl = `${baseUrl}${manifest.baseRoute}/feed.xml`;

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom">',
    `  <title>${escapeXml(`${options.siteTitle} Changelog`)}</title>`,
    `  <id>${escapeXml(feedUrl)}</id>`,
    `  <link href="${escapeXml(feedUrl)}" />`,
    `  <updated>${escapeXml(updated)}</updated>`,
    entries,
    "</feed>",
    "",
  ].join("\n");
}
