import type { FunctionalComponent } from "preact";
import type { SidebarGroup, SidebarItem } from "../../node/siteConfig.js";

interface SidebarNavProps {
  groups: SidebarGroup[];
  routePath: string;
  withBase: (base: string, link: string) => string;
  base: string;
  isActive: (routePath: string, link: string) => boolean;
}

const SidebarItems: FunctionalComponent<{
  items: SidebarItem[];
  depth: number;
  routePath: string;
  base: string;
  withBase: SidebarNavProps["withBase"];
  isActive: SidebarNavProps["isActive"];
}> = ({ items, depth, routePath, base, withBase, isActive }) => (
  <ul class={depth > 0 ? "pp-sidebar-nested" : undefined}>
    {items.map((item) => {
      const nested = item.items?.length;
      const key = item.link ?? item.text;

      if (nested) {
        return (
          <li key={key} class="pp-sidebar-nested-group">
            <details class="pp-sidebar-nested-panel" open={item.collapsed !== true}>
              <summary>{item.text}</summary>
              <SidebarItems
                items={item.items!}
                depth={depth + 1}
                routePath={routePath}
                base={base}
                withBase={withBase}
                isActive={isActive}
              />
            </details>
          </li>
        );
      }

      if (!item.link) return null;

      const active = isActive(routePath, item.link);
      return (
        <li key={item.link}>
          <a
            class={active ? "active" : ""}
            href={withBase(base, item.link)}
            aria-current={active ? "page" : undefined}
          >
            {item.text}
          </a>
        </li>
      );
    })}
  </ul>
);

const SidebarNav: FunctionalComponent<SidebarNavProps> = ({
  groups,
  routePath,
  withBase,
  base,
  isActive,
}) => (
  <>
    {groups.map((group, gi) => {
      const body = (
        <SidebarItems
          items={group.items}
          depth={0}
          routePath={routePath}
          base={base}
          withBase={withBase}
          isActive={isActive}
        />
      );

      if (group.text) {
        return (
          <details
            key={gi}
            class="pp-sidebar-group pp-sidebar-group-collapsible"
            open={group.collapsed !== true}
          >
            <summary class="pp-sidebar-heading">{group.text}</summary>
            {body}
          </details>
        );
      }

      return (
        <div key={gi} class="pp-sidebar-group">
          {body}
        </div>
      );
    })}
  </>
);

export default SidebarNav;
