import type { FunctionalComponent } from 'preact'
import type { Feature, FeatureIcon } from '../../shared/pageChrome.js'

interface FeaturesProps {
  features: Feature[]
  base: string
}

function withBase(base: string, link: string): string {
  if (/^(?:[a-z]+:)?\/\//i.test(link) || /^(?:data|mailto|tel):/i.test(link) || link.startsWith('#')) {
    return link
  }
  const b = base === '/' ? '' : base.replace(/\/$/, '')
  const l = link.startsWith('/') ? link : `/${link}`
  return `${b}${l}`
}

function renderIcon(icon: FeatureIcon | undefined, base: string) {
  if (!icon) return null
  if (typeof icon === 'string') return <span class="pp-home-feature-emoji">{icon}</span>
  if ('src' in icon) {
    return (
      <img
        src={withBase(base, icon.src)}
        alt={icon.alt ?? ''}
        width={icon.width}
        height={icon.height}
      />
    )
  }
  return (
    <picture>
      <source media="(prefers-color-scheme: dark)" srcSet={withBase(base, icon.dark)} />
      <img
        src={withBase(base, icon.light)}
        alt={icon.alt ?? ''}
        width={icon.width}
        height={icon.height}
      />
    </picture>
  )
}

const Features: FunctionalComponent<FeaturesProps> = ({ features, base }) => (
  <section class="pp-home-features">
    {features.map((feature) => {
      const content = (
        <>
          {feature.icon ? <div class="pp-home-feature-icon">{renderIcon(feature.icon, base)}</div> : null}
          <h2>{feature.title}</h2>
          <p>{feature.details}</p>
          {feature.link && feature.linkText ? <span>{feature.linkText}</span> : null}
        </>
      )

      return feature.link ? (
        <a
          key={`${feature.title}:${feature.link}`}
          class="pp-home-feature"
          href={withBase(base, feature.link)}
          target={feature.target}
          rel={feature.rel}
        >
          {content}
        </a>
      ) : (
        <div key={feature.title} class="pp-home-feature">
          {content}
        </div>
      )
    })}
  </section>
)

export default Features
