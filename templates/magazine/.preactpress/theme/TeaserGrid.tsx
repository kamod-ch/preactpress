import type { FunctionalComponent } from 'preact'
import type { ArticlePost } from 'preactpress/shared'

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

export function articlesToTeasers(posts: ArticlePost[]): TeaserItem[] {
  return posts.map((post) => ({
    href: post.route,
    kicker: post.category?.name ?? 'Artikel',
    title: post.title,
    dek: post.description ?? '',
    readTime: post.readTime
  }))
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
