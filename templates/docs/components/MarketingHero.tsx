/** @jsx h */
import { h } from "preact";

const actions = [
  { text: "Get started", href: "/guide/getting-started", theme: "brand" },
  { text: "View demo", href: "#interactive-demo", theme: "alt" },
  {
    text: "GitHub",
    href: "https://github.com/kamod-ch/preactpress",
    theme: "ghost",
    external: true,
  },
];

const workflowLabels = [
  { text: "Markdown", href: "https://www.markdownguide.org/tools/github-pages/" },
  { text: "MDX", href: "https://mdxjs.com/" },
  { text: "Preact", href: "https://preactjs.com/" },
];

export default function MarketingHero() {
  return (
    <section class="pp-mkt-hero" aria-labelledby="preactpress-hero-title">
      <div class="pp-mkt-hero-copy">
        <p class="pp-mkt-eyebrow">PreactPress</p>
        <h1 id="preactpress-hero-title">The documentation framework for Preact</h1>
        <p class="pp-mkt-hero-lead">
          Build fast documentation, blogs and product sites with Markdown, MDX, Preact and Vite.
        </p>
        <div class="pp-mkt-actions">
          {actions.map((action) => (
            <a
              class={`pp-mkt-button pp-mkt-button-${action.theme}`}
              href={action.href}
              key={action.text}
              rel={action.external ? "noopener noreferrer" : undefined}
              target={action.external ? "_blank" : undefined}
            >
              {action.text}
            </a>
          ))}
        </div>
      </div>
      <div class="pp-mkt-hero-panel" aria-label="PreactPress workflow">
        {workflowLabels.map((label) => (
          <a
            class="pp-mkt-panel-label"
            href={label.href}
            key={label.text}
            rel="noopener noreferrer"
            target="_blank"
          >
            {label.text}
          </a>
        ))}
        <span class="pp-mkt-panel-arrow" aria-hidden="true">
          <svg
            class="pp-mkt-panel-arrow-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M12 5v10M8 11l4 4 4-4"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            />
          </svg>
        </span>
        <strong>Static docs</strong>
      </div>
    </section>
  );
}
