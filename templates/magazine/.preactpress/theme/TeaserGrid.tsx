import type { FunctionalComponent } from 'preact'

export interface TeaserItem {
  href: string
  kicker: string
  title: string
  dek: string
  readTime?: string
}

export interface TeaserGridProps {
  items: TeaserItem[]
}

const TeaserGrid: FunctionalComponent<TeaserGridProps> = ({ items }) => (
  <div class="mag-teaser-grid">
    {items.map((item) => (
      <a key={item.href} class="mag-teaser-card" href={item.href}>
        <span class="mag-teaser-kicker">{item.kicker}</span>
        <span class="mag-teaser-title">{item.title}</span>
        <span class="mag-teaser-dek">{item.dek}</span>
        {item.readTime ? <span class="mag-teaser-meta">{item.readTime}</span> : null}
      </a>
    ))}
  </div>
)

export default TeaserGrid
