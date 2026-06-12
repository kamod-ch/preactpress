import { createContentLoader } from '@kamod-ch/preactpress/config'
import { articleFromFrontmatter, type ArticlePost } from '@kamod-ch/preactpress/shared'

export default createContentLoader<ArticlePost[]>(['article-*.md', 'article-*.mdx'], {
  transform(items) {
    return items.map((item) =>
      articleFromFrontmatter({
        route: item.route,
        url: item.url,
        title: item.title,
        description: item.description,
        tags: Array.isArray(item.frontmatter.tags)
          ? item.frontmatter.tags.filter((tag): tag is string => typeof tag === 'string')
          : undefined,
        frontmatter: item.frontmatter
      })
    )
  }
})
