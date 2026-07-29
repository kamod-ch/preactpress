export interface SidebarItem {
  text: string;
  link?: string;
  collapsed?: boolean;
  items?: SidebarItem[];
}

export interface SidebarGroup {
  text?: string;
  collapsed?: boolean;
  items: SidebarItem[];
}

export type SidebarConfig = SidebarGroup[] | Record<string, SidebarGroup[]>;
