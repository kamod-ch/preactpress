import type { FunctionalComponent } from "preact";
import { withBase } from "@kamod-ch/preactpress/client";

export interface DocCard {
  title: string;
  details: string;
  link: string;
  linkText?: string;
}

interface DocCardGridProps {
  title: string;
  cards: DocCard[];
  base: string;
}

const DocCardGrid: FunctionalComponent<DocCardGridProps> = ({ title, cards, base }) => {
  if (!cards.length) return null;
  return (
    <section class="protocol-card-section" aria-label={title}>
      <h2 class="protocol-section-title">{title}</h2>
      <div class="protocol-card-grid">
        {cards.map((card) => (
          <a class="protocol-card" href={withBase(base, card.link)} key={`${card.title}:${card.link}`}>
            <h3>{card.title}</h3>
            <p>{card.details}</p>
            <span class="protocol-card-more">{card.linkText ?? "Read more →"}</span>
          </a>
        ))}
      </div>
    </section>
  );
};

export default DocCardGrid;
