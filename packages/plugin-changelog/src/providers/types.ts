import type { ChangelogProviderId, RawChangelogRelease } from "../types/index.js";

export interface ProviderContext {
  root: string;
  cacheDir: string;
  repository?: string;
  localPath?: string;
  changesetsDir?: string;
  token?: string;
  offline?: boolean;
  /** Injectable fetch for tests. */
  fetch?: typeof fetch;
}

/** Provider contract for changelog sources (GitHub, GitLab, Gitea, local files, …). */
export interface ChangelogProvider {
  readonly id: ChangelogProviderId;
  computeSourceHash(context: ProviderContext): Promise<string>;
  fetchRawReleases(context: ProviderContext): Promise<RawChangelogRelease[]>;
}

export interface GitHubReleasePayload {
  tag_name: string;
  name?: string;
  body?: string;
  draft?: boolean;
  prerelease?: boolean;
  published_at?: string;
  html_url?: string;
  author?: { login?: string };
}

export interface GitLabReleasePayload {
  tag_name: string;
  name?: string;
  description?: string;
  released_at?: string;
  _links?: { self?: string };
}
