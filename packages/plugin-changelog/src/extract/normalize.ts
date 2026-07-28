import type { ChangelogEntry, ChangelogSection, ChangelogSectionKind, RawChangelogRelease } from "../types/index.js";

const SECTION_KIND_MAP: Record<string, ChangelogSectionKind> = {
  "breaking changes": "breaking",
  breaking: "breaking",
  added: "feature",
  features: "feature",
  feature: "feature",
  fixed: "fix",
  fixes: "fix",
  fix: "fix",
  security: "fix",
};

function normalizeHeading(value: string): string {
  return value.trim().toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, " ");
}

export function sectionKindFromTitle(title: string): ChangelogSectionKind {
  return SECTION_KIND_MAP[normalizeHeading(title)] ?? "other";
}

function parseListItem(line: string): ChangelogEntry | undefined {
  const trimmed = line.trim();
  const match = trimmed.match(/^[-*+]\s+(.*)$/);
  if (!match) return undefined;
  const text = match[1].trim();
  if (!text) return undefined;

  const prMatch = text.match(/\(#(\d+)\)/);
  const issueMatch = text.match(/#(\d+)/);
  const authorMatch = text.match(/@([a-zA-Z0-9-]+)/);

  return {
    text,
    pr: prMatch ? Number(prMatch[1]) : undefined,
    issue: issueMatch ? Number(issueMatch[1]) : undefined,
    author: authorMatch?.[1],
  };
}

export function parseReleaseBody(body: string): ChangelogSection[] {
  const sections: ChangelogSection[] = [];
  let current: ChangelogSection | undefined;

  for (const line of body.split(/\r?\n/)) {
    const heading = line.match(/^#{2,3}\s+(.+)$/);
    if (heading) {
      if (current?.items.length) sections.push(current);
      const title = heading[1].trim();
      current = {
        kind: sectionKindFromTitle(title),
        title,
        items: [],
      };
      continue;
    }

    const item = parseListItem(line);
    if (item) {
      if (!current) {
        current = { kind: "other", title: "Changes", items: [] };
      }
      current.items.push(item);
    }
  }

  if (current?.items.length) sections.push(current);
  return sections;
}

function extractContributors(sections: ChangelogSection[], extra: string[] = []): string[] {
  const set = new Set(extra.filter(Boolean));
  for (const section of sections) {
    for (const item of section.items) {
      if (item.author) set.add(item.author);
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

const MIGRATION_GUIDE_RE = /\[([^\]]*migration[^\]]*)\]\(([^)]+)\)/i;

export function extractMigrationGuideUrl(body: string): string | undefined {
  const match = body.match(MIGRATION_GUIDE_RE);
  return match?.[2];
}

export function normalizeRawRelease(raw: RawChangelogRelease, route: string, slug: string) {
  const sections = parseReleaseBody(raw.body);
  const migrationGuideUrl = extractMigrationGuideUrl(raw.body);

  return {
    version: raw.version,
    slug,
    route,
    date: raw.date,
    title: raw.title,
    description: raw.body.split(/\r?\n\r?\n/)[0]?.trim(),
    sections,
    contributors: extractContributors(sections, raw.contributors),
    sourceUrl: raw.sourceUrl,
    migrationGuideUrl,
    prerelease: raw.prerelease,
    draft: raw.draft,
  };
}

export function parseKeepAChangelog(content: string): RawChangelogRelease[] {
  const releases: RawChangelogRelease[] = [];
  const lines = content.split(/\r?\n/);
  let current: RawChangelogRelease | undefined;
  let bodyLines: string[] = [];

  const flush = () => {
    if (!current) return;
    current.body = bodyLines.join("\n").trim();
    if (current.version.toLowerCase() !== "unreleased" || current.body) {
      releases.push(current);
    }
    current = undefined;
    bodyLines = [];
  };

  for (const line of lines) {
    const releaseMatch = line.match(/^##\s+(?:\[([^\]]+)\]|(.+?))\s*(?:[-–—]\s*(.+))?$/);
    if (releaseMatch) {
      flush();
      const version = (releaseMatch[1] ?? releaseMatch[2] ?? "").trim();
      const date = releaseMatch[3]?.trim();
      current = { version, date, body: "" };
      continue;
    }

    if (current) bodyLines.push(line);
  }

  flush();
  return releases;
}

export function semverMajorMinor(version: string): string | undefined {
  const cleaned = version.replace(/^v/i, "").split("-")[0];
  const parts = cleaned.split(".");
  if (parts.length < 2) return undefined;
  const major = parts[0];
  const minor = parts[1];
  if (!/^\d+$/.test(major) || !/^\d+$/.test(minor)) return undefined;
  return `${major}.${minor}`;
}

export function releaseMatchesDocVersion(releaseVersion: string, docVersion: string): boolean {
  const releaseMm = semverMajorMinor(releaseVersion);
  const docMm = semverMajorMinor(docVersion);
  if (!releaseMm || !docMm) return false;
  const [rMajor, rMinor] = releaseMm.split(".").map(Number);
  const [dMajor] = docMm.split(".").map(Number);
  return rMajor === dMajor;
}
