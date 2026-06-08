import type { FunctionalComponent } from 'preact'

interface Feature {
  icon: string
  title: string
  details: string
}

interface FeatureGridProps {
  features: Feature[]
}

const FeatureGrid: FunctionalComponent<FeatureGridProps> = ({ features }) => (
  <section class="hn-features" aria-label="Highlights">
    {features.map((feature) => (
      <article class="hn-feature-card" key={feature.title}>
        <div class="hn-feature-icon" aria-hidden="true">
          {feature.icon}
        </div>
        <h2>{feature.title}</h2>
        <p>{feature.details}</p>
      </article>
    ))}
  </section>
)

export default FeatureGrid
