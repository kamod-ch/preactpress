import type { FunctionalComponent } from "preact";
import type { ResolvedWorkspace } from "../../node/siteConfig.js";
import { withBase } from "../theme-utils.js";

const WorkspaceSwitcher: FunctionalComponent<{
  base: string;
  label: string;
  current?: ResolvedWorkspace;
  workspaces: ResolvedWorkspace[];
  localizeWorkspace: (workspace: ResolvedWorkspace) => string;
}> = ({ base, label, current, workspaces, localizeWorkspace }) => {
  if (workspaces.length <= 1) return null;

  return (
    <details class="pp-workspace-switcher">
      <summary>{current?.name ?? label}</summary>
      <div class="pp-workspace-menu" role="menu">
        {workspaces.map((item) => {
          const active = item.id === current?.id;
          return (
            <a
              key={item.id}
              href={withBase(base, localizeWorkspace(item))}
              aria-current={active ? "page" : undefined}
              class={active ? "active" : ""}
              role="menuitem"
            >
              <span>{item.name}</span>
              {item.packageVersion ? (
                <span class="pp-workspace-badge">{item.packageVersion}</span>
              ) : null}
            </a>
          );
        })}
      </div>
    </details>
  );
};

export default WorkspaceSwitcher;
