import type { ApiPage } from "@preactpress/plugin-typedoc/types";
/** Stable manifest schema version. */
export declare const CHANGELOG_MANIFEST_VERSION: 1;
export type ChangelogSectionKind = "breaking" | "feature" | "fix" | "other";
export type ChangelogProviderId = "local" | "github" | "changesets";
export interface ChangelogEntry {
    text: string;
    pr?: number;
    issue?: number;
    author?: string;
}
export interface ChangelogSection {
    kind: ChangelogSectionKind;
    title: string;
    items: ChangelogEntry[];
}
/** Normalized release record for documentation pages. */
export interface ChangelogRelease {
    version: string;
    slug: string;
    route: string;
    date?: string;
    title?: string;
    description?: string;
    sections: ChangelogSection[];
    contributors: string[];
    sourceUrl?: string;
    migrationGuideUrl?: string;
    prerelease?: boolean;
    draft?: boolean;
}
/** Structured changelog manifest decoupled from provider internals. */
export interface ChangelogManifest {
    version: typeof CHANGELOG_MANIFEST_VERSION;
    generatedAt: string;
    sourceHash: string;
    source: string;
    provider: ChangelogProviderId;
    repository?: string;
    baseRoute: string;
    outputDir: string;
    releases: ChangelogRelease[];
}
export interface ChangelogGenerationResult {
    manifest: ChangelogManifest;
    pages: ApiPage[];
}
/** Provider-neutral raw release before section normalization. */
export interface RawChangelogRelease {
    version: string;
    date?: string;
    title?: string;
    body: string;
    sourceUrl?: string;
    draft?: boolean;
    prerelease?: boolean;
    contributors?: string[];
}
export interface ChangelogPluginOptions {
    /** Primary data provider. */
    provider: ChangelogProviderId;
    /** GitHub repository `owner/name` (required for `github` provider). */
    repository?: string;
    /** Local Keep a Changelog file path (for `local` provider). Default `CHANGELOG.md`. */
    local?: string;
    /** Route prefix. Default `/changelog`. */
    route?: string;
    /** Output directory relative to `srcDir`. Defaults to route without leading slash. */
    output?: string;
    /** Cache remote responses under `{cacheDir}/changelog`. Default `true`. */
    cache?: boolean;
    /** Build using cache only without network access. Default `false`. */
    offline?: boolean;
    /** GitHub token (falls back to `GITHUB_TOKEN` / `GH_TOKEN`). */
    token?: string;
    /** Merge unpublished Changesets from `.changeset/`. Default `false`. */
    changesets?: boolean | {
        dir?: string;
    };
    /** Duplicate changelog routes under `/versions/{value}/changelog` when versioning is enabled. */
    versionIntegration?: boolean;
    /** Emit Atom RSS feed at `{route}/feed.xml` during `buildEnd`. Default `true`. */
    feed?: boolean | {
        limit?: number;
    };
    /** Injectable fetch (tests / custom runtimes). */
    fetch?: typeof fetch;
}
export declare class ChangelogRateLimitError extends Error {
    readonly provider: ChangelogProviderId;
    readonly resetAt?: string;
    readonly remaining?: number;
    constructor(provider: ChangelogProviderId, message: string, options?: {
        resetAt?: string;
        remaining?: number;
        cause?: unknown;
    });
}
export declare class ChangelogOfflineError extends Error {
    readonly provider: ChangelogProviderId;
    constructor(provider: ChangelogProviderId, message: string, options?: {
        cause?: unknown;
    });
}
//# sourceMappingURL=index.d.ts.map