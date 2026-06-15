import type { HeadTag } from "../node/siteConfig.js";

export function headTagsFromMeta(meta: Record<string, unknown> | undefined): HeadTag[] {
  const raw = meta?.head;
  if (!Array.isArray(raw)) return [];

  const tags: HeadTag[] = [];
  for (const entry of raw) {
    const tag = parseHeadTag(entry);
    if (tag) tags.push(tag);
  }
  return tags;
}

function parseHeadTag(entry: unknown): HeadTag | undefined {
  if (!Array.isArray(entry) || entry.length < 2) return undefined;
  const name = entry[0];
  const attrs = entry[1];
  if (name !== "meta" && name !== "link" && name !== "script") return undefined;
  if (!attrs || typeof attrs !== "object") return undefined;
  const record = attrs as Record<string, string | boolean | undefined>;
  if (entry.length >= 3 && name === "script") {
    return ["script", record, typeof entry[2] === "string" ? entry[2] : ""];
  }
  return [name, record];
}
