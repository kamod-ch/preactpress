export function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
export function escapeAttr(value) {
  return escapeHtml(value).replaceAll("'", "&#39;");
}
/** Accessible static fallback HTML for a Mermaid diagram block. */
export function renderMermaidFenceHtml(source) {
  const trimmed = source.trim();
  const escaped = escapeHtml(trimmed);
  const attr = escapeAttr(trimmed);
  return [
    `<figure class="pp-mermaid" data-mermaid-source="${attr}" role="figure" aria-label="Mermaid diagram">`,
    `<pre class="pp-mermaid-fallback" aria-hidden="false"><code>${escaped}</code></pre>`,
    `<noscript><pre class="pp-mermaid-noscript"><code>${escaped}</code></pre></noscript>`,
    `</figure>`,
  ].join("");
}
//# sourceMappingURL=fence.js.map
