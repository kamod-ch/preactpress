/** @jsx h */
import { h } from "preact";

const benefits = [
  {
    title: "Preact components in MDX",
    details:
      "Bring interactive examples, demos and product-specific widgets into otherwise simple content.",
    href: "/guide/markdown-and-mdx",
  },
  {
    title: "Documentation features included",
    details:
      "Navigation, sidebars, local search, outlines, tags, i18n and validation are ready in the docs template.",
    href: "/guide/configuration",
  },
  {
    title: "Static deployment anywhere",
    details:
      "Build once and publish the generated files to GitHub Pages, Netlify, Vercel, Cloudflare Pages or any static host.",
    href: "/guide/deploy",
  },
];

export default function BenefitsGrid() {
  return (
    <section class="pp-mkt-section" aria-labelledby="benefits-title">
      <div class="pp-mkt-section-heading">
        <p class="pp-mkt-eyebrow">Three main benefits</p>
        <h2 id="benefits-title">Focused on Preact documentation</h2>
      </div>
      <div class="pp-mkt-card-grid pp-mkt-card-grid-three">
        {benefits.map((benefit, index) => (
          <a class="pp-mkt-card" href={benefit.href} key={benefit.title}>
            <span class="pp-mkt-card-index" aria-hidden="true">
              0{index + 1}
            </span>
            <h3>{benefit.title}</h3>
            <p>{benefit.details}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
