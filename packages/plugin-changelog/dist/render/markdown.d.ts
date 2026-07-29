import type {
  ChangelogGenerationResult,
  ChangelogManifest,
  ChangelogRelease,
} from "../types/index.js";
declare function renderReleasePage(release: ChangelogRelease): string;
declare function renderOverviewPage(manifest: ChangelogManifest): string;
export declare function renderChangelogDocs(manifest: ChangelogManifest): ChangelogGenerationResult;
export { renderReleasePage, renderOverviewPage };
//# sourceMappingURL=markdown.d.ts.map
