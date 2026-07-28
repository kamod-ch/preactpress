function treeToSidebarItems(nodes) {
    return nodes.map((node) => ({
        text: node.text,
        link: node.link,
        items: node.items?.length ? treeToSidebarItems(node.items) : undefined,
    }));
}
export function sidebarFromOpenApiManifest(manifest) {
    const groups = [
        {
            text: "OpenAPI",
            items: [
                { text: "Overview", link: manifest.baseRoute },
                { text: "Schemas", link: `${manifest.baseRoute}/schemas` },
            ],
        },
    ];
    if (manifest.tree.length) {
        groups.push({
            text: "Endpoints",
            items: treeToSidebarItems(manifest.tree.filter((node) => node.id !== "schemas")),
        });
    }
    return groups;
}
export function navFromOpenApiManifest(manifest) {
    return { text: "API", link: manifest.baseRoute };
}
//# sourceMappingURL=sidebar.js.map