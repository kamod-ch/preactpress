function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
function propAnchor(name) {
  return `prop-${name.replace(/[^a-zA-Z0-9_-]+/g, "-").toLowerCase()}`;
}
function renderPropRow(prop) {
  const defaultValue = prop.defaultValue ?? "—";
  const required = prop.required ? "Yes" : "No";
  const description = [
    prop.description ?? "",
    prop.deprecated ? `**Deprecated:** ${prop.deprecated}` : "",
    prop.inheritedFrom ? `_From \`${prop.inheritedFrom}\`_` : "",
  ]
    .filter(Boolean)
    .join(" ");
  return [
    `<tr id="${escapeHtml(propAnchor(prop.name))}">`,
    `<td><code>${escapeHtml(prop.name)}</code></td>`,
    `<td><code>${escapeHtml(prop.type)}</code></td>`,
    `<td><code>${escapeHtml(defaultValue)}</code></td>`,
    `<td>${required}</td>`,
    `<td>${description}</td>`,
    `</tr>`,
  ].join("");
}
/** Render a component reference as static HTML for markdown pages and SSR. */
export function renderComponentReferenceHtml(entry) {
  const source = entry.source
    ? entry.source.url
      ? `<p class="pp-component-source"><a href="${escapeHtml(entry.source.url)}">View source</a> (<code>${escapeHtml(entry.source.file)}:${entry.source.line}</code>)</p>`
      : `<p class="pp-component-source">Source: <code>${escapeHtml(entry.source.file)}:${entry.source.line}</code></p>`
    : "";
  const examples = entry.examples?.length
    ? entry.examples
        .map(
          (example, index) =>
            `<h4 class="pp-component-example-title">Example ${index + 1}</h4><pre class="pp-component-example"><code>${escapeHtml(example)}</code></pre>`,
        )
        .join("")
    : "";
  return [
    `<section class="pp-component-reference" aria-labelledby="component-${escapeHtml(entry.name)}">`,
    `<h3 id="component-${escapeHtml(entry.name)}">${escapeHtml(entry.name)}</h3>`,
    entry.description
      ? `<p class="pp-component-description">${escapeHtml(entry.description)}</p>`
      : "",
    source,
    `<div class="pp-table-wrap"><table class="pp-component-props">`,
    `<thead><tr><th>Prop</th><th>Type</th><th>Default</th><th>Required</th><th>Description</th></tr></thead>`,
    `<tbody>${entry.props.map(renderPropRow).join("")}</tbody>`,
    `</table></div>`,
    examples,
    `</section>`,
  ]
    .filter(Boolean)
    .join("\n");
}
export function componentSearchTags(entry) {
  return [...new Set(entry.tags)];
}
export function lookupComponent(manifest, lookup) {
  if (lookup.component) {
    return manifest.components[lookup.component];
  }
  if (lookup.exportName) {
    return Object.values(manifest.components).find(
      (entry) =>
        entry.exportName === lookup.exportName &&
        (!lookup.source || entry.source?.file.endsWith(lookup.source.replace(/^\.\.\//, ""))),
    );
  }
  return undefined;
}
//# sourceMappingURL=html.js.map
