import type { SidebarGroup, SidebarItem } from "@preactpress/plugin-typedoc";
import type { ChangelogManifest } from "../types/index.js";

export function sidebarFromChangelogManifest(manifest: ChangelogManifest): SidebarGroup[] {
  const releases = manifest.releases
    .filter((release) => release.route.startsWith(`${manifest.baseRoute}/`))
    .slice(0, 20);

  const items: SidebarItem[] = [
    { text: "Overview", link: manifest.baseRoute },
    ...releases.map((release) => ({
      text: release.version,
      link: release.route,
    })),
  ];

  return [{ text: "Changelog", items }];
}

export function navFromChangelogManifest(manifest: ChangelogManifest): {
  text: string;
  link: string;
} {
  return { text: "Changelog", link: manifest.baseRoute };
}

export function versionSidebarsFromManifest(
  manifest: ChangelogManifest,
  versionPrefixes: string[],
): Record<string, SidebarGroup[]> {
  const result: Record<string, SidebarGroup[]> = {};

  for (const prefix of versionPrefixes) {
    const baseRoute = `${prefix.replace(/\/+$/, "")}${manifest.baseRoute}`;
    const releases = manifest.releases.filter((release) =>
      release.route.startsWith(`${baseRoute}/`),
    );
    if (!releases.length) continue;
    result[`${baseRoute}/`] = [
      {
        text: "Changelog",
        items: [
          { text: "Overview", link: baseRoute },
          ...releases.map((release) => ({ text: release.version, link: release.route })),
        ],
      },
    ];
  }

  return result;
}
