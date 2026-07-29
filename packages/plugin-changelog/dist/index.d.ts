import type { PreactPressPlugin } from "@kamod-ch/preactpress/config";
import type { ChangelogPluginOptions } from "./types/index.js";
export type { ChangelogPluginOptions } from "./types/index.js";
export {
  ChangelogOfflineError,
  ChangelogRateLimitError,
  CHANGELOG_MANIFEST_VERSION,
} from "./types/index.js";
export type {
  ChangelogEntry,
  ChangelogGenerationResult,
  ChangelogManifest,
  ChangelogProviderId,
  ChangelogRelease,
  ChangelogSection,
  ChangelogSectionKind,
  RawChangelogRelease,
} from "./types/index.js";
export { generateChangelogDocs, writeGeneratedPages } from "./extract/generate.js";
export { renderChangelogDocs, renderOverviewPage, renderReleasePage } from "./render/markdown.js";
export {
  sidebarFromChangelogManifest,
  navFromChangelogManifest,
  versionSidebarsFromManifest,
} from "./render/sidebar.js";
export { renderChangelogAtomFeed } from "./render/rss.js";
export {
  resolveProvider,
  githubChangelogProvider,
  localChangelogProvider,
  changesetsChangelogProvider,
} from "./providers/index.js";
export type { ChangelogProvider, ProviderContext } from "./providers/types.js";
export {
  parseKeepAChangelog,
  parseReleaseBody,
  releaseMatchesDocVersion,
} from "./extract/normalize.js";
/** Official PreactPress plugin for changelog pages from local files, GitHub Releases, or Changesets. */
export declare function changelogPlugin(options: ChangelogPluginOptions): PreactPressPlugin;
//# sourceMappingURL=index.d.ts.map
