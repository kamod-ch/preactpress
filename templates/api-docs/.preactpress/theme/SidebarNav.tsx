import type { ComponentChildren, FunctionalComponent } from "preact";
import { isActive, withBase } from "@kamod-ch/preactpress/client";

interface SidebarItem {
  text: string;
  link?: string;
  items?: SidebarItem[];
}

interface SidebarGroup {
  text?: string;
  items: SidebarItem[];
}

interface SidebarNavProps {
  groups: SidebarGroup[];
  routePath: string;
  base: string;
}

function renderItems(items: SidebarItem[], routePath: string, base: string): ComponentChildren {
  return items.map((item) => {
    if (item.link) {
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
          {item.items?.length ? <ul>{renderItems(item.items, routePath, base)}</ul> : null}
        </li>
      );
    }
    if (item.items?.length) {
      return (
        <li key={item.text}>
          <span>{item.text}</span>
          <ul>{renderItems(item.items, routePath, base)}</ul>
        </li>
      );
    }
    return null;
  });
}

const SidebarNav: FunctionalComponent<SidebarNavProps> = ({ groups, routePath, base }) => (
  <>
    {groups.map((group, index) => (
      <div class="protocol-sidebar-group" key={`${group.text ?? "group"}:${index}`}>
        {group.text ? <h2>{group.text}</h2> : null}
        <ul>{renderItems(group.items, routePath, base)}</ul>
      </div>
    ))}
  </>
);

export default SidebarNav;
export type { SidebarGroup, SidebarItem };
