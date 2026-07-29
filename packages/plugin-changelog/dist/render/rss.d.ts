import type { ChangelogManifest } from "../types/index.js";
export interface ChangelogFeedOptions {
  siteUrl: string;
  siteTitle: string;
  limit?: number;
}
export declare function renderChangelogAtomFeed(
  manifest: ChangelogManifest,
  options: ChangelogFeedOptions,
): string;
//# sourceMappingURL=rss.d.ts.map
