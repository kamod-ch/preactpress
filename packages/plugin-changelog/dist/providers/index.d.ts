import type { ChangelogProviderId } from "../types/index.js";
import type { ChangelogProvider } from "./types.js";
import { changesetsChangelogProvider } from "./changesets.js";
import { githubChangelogProvider } from "./github.js";
import { localChangelogProvider } from "./local.js";
export declare function resolveProvider(id: ChangelogProviderId): ChangelogProvider;
export { changesetsChangelogProvider, githubChangelogProvider, localChangelogProvider };
export type {
  ChangelogProvider,
  ProviderContext,
  GitHubReleasePayload,
  GitLabReleasePayload,
} from "./types.js";
//# sourceMappingURL=index.d.ts.map
