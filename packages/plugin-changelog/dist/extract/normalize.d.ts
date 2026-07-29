import type {
  ChangelogSection,
  ChangelogSectionKind,
  RawChangelogRelease,
} from "../types/index.js";
export declare function sectionKindFromTitle(title: string): ChangelogSectionKind;
export declare function parseReleaseBody(body: string): ChangelogSection[];
export declare function extractMigrationGuideUrl(body: string): string | undefined;
export declare function normalizeRawRelease(
  raw: RawChangelogRelease,
  route: string,
  slug: string,
): {
  version: string;
  slug: string;
  route: string;
  date: string | undefined;
  title: string | undefined;
  description: string;
  sections: ChangelogSection[];
  contributors: string[];
  sourceUrl: string | undefined;
  migrationGuideUrl: string | undefined;
  prerelease: boolean | undefined;
  draft: boolean | undefined;
};
export declare function parseKeepAChangelog(content: string): RawChangelogRelease[];
export declare function semverMajorMinor(version: string): string | undefined;
export declare function releaseMatchesDocVersion(
  releaseVersion: string,
  docVersion: string,
): boolean;
//# sourceMappingURL=normalize.d.ts.map
