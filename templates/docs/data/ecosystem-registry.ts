import type { EcosystemRegistryItem } from "./ecosystem.types.ts";

const repo = "https://github.com/kamod-ch/preactpress";
const docs = (path: string) => `/guide/${path}`;

/**
 * Static ecosystem registry maintained in the PreactPress repository.
 * Add entries here and open a pull request — see /guide/ecosystem for guidelines.
 */
export const ecosystemRegistry: EcosystemRegistryItem[] = [
  {
    name: "Mermaid",
    package: "@preactpress/plugin-mermaid",
    type: "plugin",
    description:
      "Render Mermaid diagram fences in Markdown and MDX with lazy-loaded client hydration.",
    repository: `${repo}/tree/main/packages/plugin-mermaid`,
    documentation: docs("plugin-mermaid"),
    author: "PreactPress",
    official: true,
    tags: ["diagrams", "markdown", "mdx"],
    preactpressVersion: ">=2.2.0",
  },
  {
    name: "Playground",
    package: "@preactpress/plugin-playground",
    type: "plugin",
    description:
      "Live, editable Preact code playgrounds in MDX with a CSP-friendly sandbox iframe.",
    repository: `${repo}/tree/main/packages/plugin-playground`,
    documentation: docs("plugin-playground"),
    author: "PreactPress",
    official: true,
    tags: ["mdx", "interactive", "sandbox"],
    preactpressVersion: ">=2.2.0",
  },
  {
    name: "TypeDoc",
    package: "@preactpress/plugin-typedoc",
    type: "plugin",
    description:
      "Generate TypeScript API reference pages from TypeDoc and merge them into site navigation.",
    repository: `${repo}/tree/main/packages/plugin-typedoc`,
    documentation: docs("plugin-typedoc"),
    author: "PreactPress",
    official: true,
    tags: ["typescript", "api", "reference"],
    preactpressVersion: ">=2.2.0",
  },
  {
    name: "OpenAPI",
    package: "@preactpress/plugin-openapi",
    type: "plugin",
    description:
      "Document REST APIs from OpenAPI 3.x specs with shared sidebar and search integration.",
    repository: `${repo}/tree/main/packages/plugin-openapi`,
    documentation: docs("plugin-openapi"),
    author: "PreactPress",
    official: true,
    tags: ["openapi", "swagger", "api"],
    preactpressVersion: ">=2.2.0",
  },
  {
    name: "Component reference",
    package: "@preactpress/plugin-component-reference",
    type: "plugin",
    description: "Extract Preact component props and document them with MDX tables and examples.",
    repository: `${repo}/tree/main/packages/plugin-component-reference`,
    documentation: docs("plugin-component-reference"),
    author: "PreactPress",
    official: true,
    tags: ["components", "props", "mdx"],
    preactpressVersion: ">=2.2.0",
  },
  {
    name: "Changelog",
    package: "@preactpress/plugin-changelog",
    type: "plugin",
    description:
      "Pull release notes from local files, GitHub Releases, or Changesets into docs pages.",
    repository: `${repo}/tree/main/packages/plugin-changelog`,
    documentation: docs("plugin-changelog"),
    author: "PreactPress",
    official: true,
    tags: ["changelog", "releases", "github"],
    preactpressVersion: ">=2.2.0",
  },
  {
    name: "Magazine",
    package: "template:magazine",
    type: "theme",
    description: "Editorial layout with article teasers, tag hubs, and a content-loader home page.",
    repository: `${repo}/tree/main/templates/magazine`,
    documentation: docs("templates"),
    author: "PreactPress",
    official: true,
    tags: ["editorial", "articles", "custom-layout"],
    preactpressVersion: ">=2.0.0",
  },
  {
    name: "Hono",
    package: "template:hono",
    type: "theme",
    description:
      "Marketing landing page paired with a focused documentation area and product-style chrome.",
    repository: `${repo}/tree/main/templates/hono`,
    documentation: docs("templates"),
    author: "PreactPress",
    official: true,
    tags: ["marketing", "product", "custom-layout"],
    preactpressVersion: ">=2.0.0",
  },
  {
    name: "Blog",
    package: "template:blog",
    type: "theme",
    description:
      "Technical blog shell with RSS, tags, authors, reading time, and masthead navigation.",
    repository: `${repo}/tree/main/templates/blog`,
    documentation: docs("templates"),
    author: "PreactPress",
    official: true,
    tags: ["blog", "rss", "custom-layout"],
    preactpressVersion: ">=2.0.0",
  },
  {
    name: "SaaS docs",
    package: "template:saas-docs",
    type: "theme",
    description:
      "Product documentation theme with onboarding flows, admin hints, and support CTAs.",
    repository: `${repo}/tree/main/templates/saas-docs`,
    documentation: docs("templates"),
    author: "PreactPress",
    official: true,
    tags: ["saas", "product", "custom-layout"],
    preactpressVersion: ">=2.0.0",
  },
  {
    name: "Documentation",
    package: "template:docs",
    type: "starter",
    description:
      "Full reference starter with guides, examples, search, i18n, and the default docs theme.",
    repository: `${repo}/tree/main/templates/docs`,
    documentation: docs("templates"),
    author: "PreactPress",
    official: true,
    tags: ["docs", "i18n", "search"],
    preactpressVersion: ">=2.0.0",
  },
  {
    name: "Product docs",
    package: "template:product-docs",
    type: "starter",
    description:
      "Library and SDK documentation with guides, concepts, FAQ, and changelog sections.",
    repository: `${repo}/tree/main/templates/product-docs`,
    documentation: docs("templates"),
    author: "PreactPress",
    official: true,
    tags: ["product", "sdk", "guides"],
    preactpressVersion: ">=2.0.0",
  },
  {
    name: "API reference",
    package: "template:api-docs",
    type: "starter",
    description:
      "Protocol-style REST + TypeScript SDK hybrid with OpenAPI-generated resources and MDX API components.",
    repository: `${repo}/tree/main/templates/api-docs`,
    documentation: docs("templates"),
    author: "PreactPress",
    official: true,
    tags: ["api", "openapi", "typescript", "reference"],
    preactpressVersion: ">=2.0.0",
  },
  {
    name: "Knowledge base",
    package: "template:knowledge-base",
    type: "starter",
    description:
      "Support-focused help center with search-first home, categories, and contact CTAs.",
    repository: `${repo}/tree/main/templates/knowledge-base`,
    documentation: docs("templates"),
    author: "PreactPress",
    official: true,
    tags: ["help", "support", "search"],
    preactpressVersion: ">=2.0.0",
  },
  {
    name: "Minimal",
    package: "template:default",
    type: "starter",
    description: "Smallest starter — home, about, and one guide with the default docs theme.",
    repository: `${repo}/tree/main/templates/default`,
    documentation: docs("templates"),
    author: "PreactPress",
    official: true,
    tags: ["minimal", "quick-start"],
    preactpressVersion: ">=2.0.0",
  },
];

export function installCommand(item: EcosystemRegistryItem): string {
  if (item.type === "plugin") {
    return `pnpm add ${item.package}`;
  }

  const templateId = item.package.replace(/^template:/, "");
  const flag = templateId === "default" ? "" : ` --template ${templateId}`;
  return `pnpm dlx @kamod-ch/preactpress init my-site${flag}`;
}

export function allTags(items: EcosystemRegistryItem[]): string[] {
  const tags = new Set<string>();
  for (const item of items) {
    for (const tag of item.tags) tags.add(tag);
  }
  return [...tags].sort((a, b) => a.localeCompare(b));
}
