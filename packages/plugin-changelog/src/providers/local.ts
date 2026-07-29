import fs from "node:fs/promises";
import path from "node:path";
import type { RawChangelogRelease } from "../types/index.js";
import { parseKeepAChangelog } from "../extract/normalize.js";
import type { ChangelogProvider, ProviderContext } from "./types.js";

export const localChangelogProvider: ChangelogProvider = {
  id: "local",

  async computeSourceHash(context) {
    const abs = path.resolve(context.root, context.localPath ?? "CHANGELOG.md");
    const stat = await fs.stat(abs);
    return `local:${abs}:${stat.mtimeMs}:${stat.size}`;
  },

  async fetchRawReleases(context) {
    const rel = context.localPath ?? "CHANGELOG.md";
    const abs = path.resolve(context.root, rel);
    const raw = await fs.readFile(abs, "utf8");
    const releases = parseKeepAChangelog(raw);
    const sourceUrl = path.relative(context.root, abs) || rel;
    return releases.map((release) => ({
      ...release,
      sourceUrl: release.sourceUrl ?? `#${release.version}`,
    }));
  },
};
