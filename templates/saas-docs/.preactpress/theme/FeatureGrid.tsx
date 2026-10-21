import type { FunctionalComponent } from "preact";

interface Feature {
  icon: string;
  title: string;
  details: string;
  href?: string;
}

interface FeatureGridProps {
  features: Feature[];
}

const FeatureGrid: FunctionalComponent<FeatureGridProps> = ({ features }) => (
  <section class="sd-features" aria-label="Get started">
    {features.map((feature) => {
      const inner = (
        <>
          <div class="sd-feature-icon" aria-hidden="true">
            {feature.icon}
          </div>
          <h2>{feature.title}</h2>
          <p>{feature.details}</p>
        </>
      );
      return feature.href ? (
        <a class="sd-feature-card" href={feature.href} key={feature.title}>
          {inner}
        </a>
      ) : (
        <article class="sd-feature-card" key={feature.title}>
          {inner}
        </article>
      );
    })}
  </section>
);

export default FeatureGrid;
