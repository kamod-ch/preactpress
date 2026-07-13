/** @jsx h */
import { h } from "preact";
import CopyableCommand from "./CopyableCommand.tsx";

type TemplateCard = {
  id: "docs" | "hono" | "magazine" | "default";
  name: string;
  useCase: string;
  description: string;
  highlights: string[];
  command: string;
  previewSrc: string;
};

const templates: TemplateCard[] = [
  {
    id: "docs",
    name: "Documentation",
    useCase: "Reference site",
    description:
      "The full reference starter used for this public demo — guides, examples, search, and i18n.",
    highlights: ["Default docs theme", "Full guide + examples", "English / German locales"],
    command: "pnpm dlx @kamod-ch/preactpress init my-docs --template docs",
    previewSrc: "/templates/docs.webp",
  },
  {
    id: "hono",
    name: "Product + Docs",
    useCase: "Product + docs",
    description:
      "A polished marketing landing page paired with a focused documentation area and custom theme.",
    highlights: ["Custom Preact theme", "Product landing + docs", "Built-in i18n demo"],
    command: "pnpm dlx @kamod-ch/preactpress init my-site --template hono",
    previewSrc: "/templates/hono.webp",
  },
  {
    id: "magazine",
    name: "Magazine",
    useCase: "Editorial",
    description:
      "A custom editorial theme for articles, tags, and content-heavy sites with teaser grids.",
    highlights: ["Custom magazine theme", "Article teasers + tags", "Content loader home"],
    command: "pnpm dlx @kamod-ch/preactpress init my-mag --template magazine",
    previewSrc: "/templates/magazine.webp",
  },
  {
    id: "default",
    name: "Minimal",
    useCase: "Quick start",
    description:
      "The smallest starter: a home page, an about page, and one guide — no custom theme.",
    highlights: ["Default docs theme", "Tiny file tree", "Fastest way to try PreactPress"],
    command: "pnpm dlx @kamod-ch/preactpress init my-site",
    previewSrc: "/templates/default.webp",
  },
];

function assetUrl(path: string): string {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

export default function TemplateGallery() {
  return (
    <section class="pp-mkt-section" aria-labelledby="templates-title">
      <div class="pp-mkt-section-heading">
        <p class="pp-mkt-eyebrow">Template gallery</p>
        <h2 id="templates-title">Start with the shape of site you need</h2>
        <p>
          <a class="pp-mkt-section-link" href="/guide/templates">
            Compare all templates →
          </a>
        </p>
      </div>
      <div class="pp-mkt-card-grid pp-mkt-card-grid-four">
        {templates.map((template) => (
          <article class="pp-mkt-card pp-mkt-template" key={template.id}>
            <img
              class="pp-mkt-template-preview"
              src={assetUrl(template.previewSrc)}
              alt={`${template.name} starter preview`}
              loading="lazy"
              width={640}
              height={400}
            />
            <div class="pp-mkt-template-body">
              <p class="pp-mkt-template-tag">{template.useCase}</p>
              <h3>{template.name}</h3>
              <p>{template.description}</p>
              <ul class="pp-mkt-template-highlights">
                {template.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <CopyableCommand command={template.command} />
          </article>
        ))}
      </div>
    </section>
  );
}
