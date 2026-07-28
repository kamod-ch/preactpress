function treeToSidebarItems(nodes) {
    return nodes.map((node) => ({
        text: node.text,
        link: node.link,
        items: node.items?.length ? treeToSidebarItems(node.items) : undefined,
    }));
}
export function sidebarFromManifest(manifest) {
    const groups = [
        {
            text: "API Reference",
            items: [{ text: "Overview", link: manifest.baseRoute }],
        },
    ];
    if (manifest.tree.length) {
        groups.push({
            text: "Symbols",
            items: treeToSidebarItems(manifest.tree),
        });
    }
    return groups;
}
export function mergePathSidebar(existing, baseRoute, generated) {
    const prefix = `${baseRoute.replace(/\/$/, "")}/`;
    if (!existing) {
        return { [prefix]: generated };
    }
    if (Array.isArray(existing)) {
        return [...existing, ...generated];
    }
    return {
        ...existing,
        [prefix]: generated,
    };
}
export function navItemFromManifest(manifest) {
    return { text: "API", link: manifest.baseRoute };
}
//# sourceMappingURL=sidebar.js.map