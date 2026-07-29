import { changesetsChangelogProvider } from "./changesets.js";
import { githubChangelogProvider } from "./github.js";
import { localChangelogProvider } from "./local.js";
const PROVIDERS = {
  local: localChangelogProvider,
  github: githubChangelogProvider,
  changesets: changesetsChangelogProvider,
};
export function resolveProvider(id) {
  return PROVIDERS[id];
}
export { changesetsChangelogProvider, githubChangelogProvider, localChangelogProvider };
//# sourceMappingURL=index.js.map
