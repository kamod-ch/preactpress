export function sidebarFromChangelogManifest(manifest) {
  const releases = manifest.releases
    .filter((release) => release.route.startsWith(`${manifest.baseRoute}/`))
    .slice(0, 20);
  const items = [
    { text: "Overview", link: manifest.baseRoute },
    ...releases.map((release) => ({
      text: release.version,
      link: release.route,
    })),
  ];
  return [{ text: "Changelog", items }];
}
export function navFromChangelogManifest(manifest) {
  return { text: "Changelog", link: manifest.baseRoute };
}
export function versionSidebarsFromManifest(manifest, versionPrefixes) {
  const result = {};
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
//# sourceMappingURL=sidebar.js.map
