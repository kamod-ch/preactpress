/**
 * Template IDs shown in the docs site template gallery (and used for previews + live demos).
 * `versions` and `monorepo` are init-only and not listed here.
 */
export const GALLERY_TEMPLATES = [
  { id: "docs", name: "Documentation" },
  { id: "blog", name: "Blog" },
  { id: "product-docs", name: "Product docs" },
  { id: "api-docs", name: "API reference" },
  { id: "saas-docs", name: "SaaS docs" },
  { id: "knowledge-base", name: "Knowledge base" },
  { id: "hono", name: "Product + Docs" },
  { id: "magazine", name: "Magazine" },
  { id: "default", name: "Minimal" },
];

export const GALLERY_TEMPLATE_IDS = GALLERY_TEMPLATES.map((entry) => entry.id);

/** Starters built under dist/demos/<id>/ (the docs site root is the live `docs` starter). */
export const LIVE_DEMO_BUILD_IDS = GALLERY_TEMPLATE_IDS.filter((id) => id !== "docs");

export function normalizePagesBase(pagesBase) {
  if (!pagesBase || pagesBase === "/") return "/";
  let base = String(pagesBase).trim();
  if (!base.startsWith("/")) base = `/${base}`;
  if (!base.endsWith("/")) base = `${base}/`;
  return base;
}

export function demoPublicBase(pagesBase, templateId) {
  const base = normalizePagesBase(pagesBase);
  if (templateId === "docs") return base;
  return `${base}demos/${templateId}/`;
}
