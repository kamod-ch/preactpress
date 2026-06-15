/** @jsx h */
import { h } from "preact";
import CopyableCommand from "./CopyableCommand.tsx";

const templates = [
  {
    name: "Documentation",
    description: "The full reference starter used for this public demo.",
    command: "pnpm dlx @kamod-ch/preactpress init my-docs --template docs",
  },
  {
    name: "Product + Docs",
    description: "A polished product landing page with a complete documentation area.",
    command: "pnpm dlx @kamod-ch/preactpress init my-site --template hono",
  },
  {
    name: "Magazine",
    description: "A custom editorial theme for articles, tags and content-heavy sites.",
    command: "pnpm dlx @kamod-ch/preactpress init my-mag --template magazine",
  },
  {
    name: "Minimal",
    description: "A small starter with a home page, an about page and one guide.",
    command: "pnpm dlx @kamod-ch/preactpress init my-docs",
  },
];

export default function TemplateGallery() {
  return (
    <section class="pp-mkt-section" aria-labelledby="templates-title">
      <div class="pp-mkt-section-heading">
        <p class="pp-mkt-eyebrow">Template gallery</p>
        <h2 id="templates-title">Start with the shape of site you need</h2>
      </div>
      <div class="pp-mkt-card-grid pp-mkt-card-grid-four">
        {templates.map((template) => (
          <article class="pp-mkt-card pp-mkt-template" key={template.name}>
            <h3>{template.name}</h3>
            <p>{template.description}</p>
            <CopyableCommand command={template.command} />
          </article>
        ))}
      </div>
    </section>
  );
}
