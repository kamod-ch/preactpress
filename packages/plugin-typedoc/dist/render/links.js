function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
/** Resolve cross-links inside type strings and descriptions. */
export function linkifyTypeText(text, manifest, currentRoute) {
  let output = text;
  const symbols = Object.values(manifest.symbols)
    .filter((symbol) => symbol.kind !== "parameter" && symbol.kind !== "enum-member")
    .sort((a, b) => b.qualifiedName.length - a.qualifiedName.length);
  for (const symbol of symbols) {
    const pattern = new RegExp(`\\b${escapeRegExp(symbol.name)}\\b`);
    if (!pattern.test(output)) continue;
    const href = relativeHref(currentRoute, symbol.route);
    output = output.replace(pattern, `[${symbol.name}](${href})`);
  }
  return output;
}
export function renderTypeRef(type, manifest, route) {
  if (!type) return "";
  if (type.slug) {
    const target = manifest.symbols[type.slug];
    if (target) {
      return `[${type.text}](${relativeHref(route, target.route)})`;
    }
  }
  return `\`${type.text.replace(/`/g, "\\`")}\``;
}
export function relativeHref(fromRoute, toRoute) {
  if (fromRoute === toRoute) return "#";
  const fromParts = fromRoute.replace(/^\//, "").split("/");
  const toParts = toRoute.replace(/^\//, "").split("/");
  let common = 0;
  while (
    common < fromParts.length &&
    common < toParts.length &&
    fromParts[common] === toParts[common]
  ) {
    common += 1;
  }
  const ups = fromParts.length - common - 1;
  const prefix = ups > 0 ? "../".repeat(ups) : "./";
  const tail = toParts.slice(common).join("/");
  return `${prefix}${tail || "index"}`;
}
export function symbolAnchor(symbol) {
  return `#${slugifyAnchor(symbol.name)}`;
}
function slugifyAnchor(value) {
  return value.replace(/[^a-zA-Z0-9_-]+/g, "-").toLowerCase();
}
//# sourceMappingURL=links.js.map
