import type { OutlineItem } from "./siteConfig.js";
import { slugifySegment, uniqueSlug } from "../shared/slug.js";

const CUSTOM_HEADING_ID_RE = /\s*\{#([\w-]+)\}\s*$/;

export function parseHeadingContent(raw: string): { text: string; customId?: string } {
  const match = raw.match(CUSTOM_HEADING_ID_RE);
  if (!match) {
    return { text: stripHeadingMarkup(raw) };
  }
  const text = stripHeadingMarkup(raw.slice(0, match.index ?? raw.length));
  return { text, customId: match[1] };
}

function stripHeadingMarkup(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, "")
    .replace(/[`*_~[\]]/g, "")
    .trim();
}

export function headingIdFor(
  raw: string,
  existing: OutlineItem[],
  fallbackSlug?: string,
): { id: string; text: string } {
  const { text, customId } = parseHeadingContent(raw);
  const base = customId ?? fallbackSlug ?? slugifySegment(text);
  return { id: uniqueSlug(base, existing), text };
}

export function extractHeadingsFromContent(content: string): OutlineItem[] {
  const headings: OutlineItem[] = [];
  const lines = content.split(/\r?\n/);
  let inFence = false;
  let fenceMarker = "";

  for (const line of lines) {
    const fence = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (fence) {
      const marker = fence[1][0];
      if (!inFence) {
        inFence = true;
        fenceMarker = marker;
      } else if (marker === fenceMarker) {
        inFence = false;
        fenceMarker = "";
      }
      continue;
    }
    if (inFence) continue;

    const heading = line.match(/^ {0,3}(#{2,6})\s+(.+?)\s*#*\s*$/);
    if (!heading) continue;

    const level = heading[1].length;
    const { id, text } = headingIdFor(heading[2], headings);
    if (!text) continue;

    headings.push({ id, text, level });
  }

  return headings;
}

export function renderInlineToc(headings: OutlineItem[]): string {
  const items = headings.filter((heading) => heading.level >= 2 && heading.level <= 3);
  if (!items.length) return "";

  const links = items
    .map(
      (heading) =>
        `<a class="pp-inline-toc-link level-${heading.level}" href="#${heading.id}">${escapeHtml(heading.text)}</a>`,
    )
    .join("");

  return `<nav class="pp-inline-toc" aria-label="Table of contents">${links}</nav>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
