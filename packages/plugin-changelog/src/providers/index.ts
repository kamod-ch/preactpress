import type { ChangelogProviderId } from "../types/index.js";
import type { ChangelogProvider } from "./types.js";
import { changesetsChangelogProvider } from "./changesets.js";
import { githubChangelogProvider } from "./github.js";
import { localChangelogProvider } from "./local.js";

const PROVIDERS: Record<ChangelogProviderId, ChangelogProvider> = {
  local: localChangelogProvider,
  github: githubChangelogProvider,
  changesets: changesetsChangelogProvider,
};

export function resolveProvider(id: ChangelogProviderId): ChangelogProvider {
  return PROVIDERS[id];
}

export { changesetsChangelogProvider, githubChangelogProvider, localChangelogProvider };
export type {
  ChangelogProvider,
  ProviderContext,
  GitHubReleasePayload,
  GitLabReleasePayload,
} from "./types.js";
