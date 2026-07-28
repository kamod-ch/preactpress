import type { FunctionalComponent } from "preact";
import type { LayoutProps } from "../types.js";
import type { ResolvedVersion } from "../../node/siteConfig.js";
import { withBase } from "../theme-utils.js";

const VersionSwitcher: FunctionalComponent<{
  base: string;
  label: string;
  current?: ResolvedVersion;
  versions: ResolvedVersion[];
  localizeVersion: (version: ResolvedVersion) => string;
}> = ({ base, label, current, versions, localizeVersion }) => {
  if (versions.length <= 1) return null;

  return (
    <details class="pp-version-switcher">
      <summary>{current?.label ?? label}</summary>
      <div class="pp-version-menu" role="menu">
        {versions.map((item) => {
          const active = item.key === current?.key || item.value === current?.value;
          const statusLabel =
            item.status === "current" ? "current" : item.status === "archived" ? "archived" : item.status;
          return (
            <a
              key={item.key}
              href={withBase(base, localizeVersion(item))}
              aria-current={active ? "page" : undefined}
              class={active ? "active" : ""}
              data-status={statusLabel}
              role="menuitem"
            >
              <span>{item.label}</span>
              {item.status !== "current" ? (
                <span class="pp-version-badge">{item.status}</span>
              ) : null}
            </a>
          );
        })}
      </div>
    </details>
  );
};

export default VersionSwitcher;
