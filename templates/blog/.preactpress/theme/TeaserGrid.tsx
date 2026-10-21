import type { FunctionalComponent } from "preact";
import type { ArticlePost } from "@kamod-ch/preactpress/shared";

export interface TeaserItem {
  href: string;
  kicker: string;
  title: string;
  dek: string;
  byline?: string;
}

export interface TeaserGridProps {
  items: TeaserItem[];
}

export function articlesToTeasers(posts: ArticlePost[]): TeaserItem[] {
  return posts.map((post) => ({
    href: post.route,
    kicker: post.category?.name ?? "Article",
    title: post.title,
    dek: post.description ?? "",
    byline: [post.author?.name, post.readTime].filter(Boolean).join(" · ") || undefined,
  }));
}

const TeaserGrid: FunctionalComponent<TeaserGridProps> = ({ items }) => {
  const [featured, ...rest] = items;
  if (!featured) return null;
  return (
    <div class="blog-feed">
      <a class="blog-featured" href={featured.href}>
        <span class="blog-featured-kicker">{featured.kicker}</span>
        <span class="blog-featured-title">{featured.title}</span>
        {featured.dek ? <span class="blog-featured-dek">{featured.dek}</span> : null}
        {featured.byline ? <span class="blog-post-byline">{featured.byline}</span> : null}
      </a>
      {rest.length > 0 ? (
        <div class="blog-post-list">
          {rest.map((item) => (
            <a key={item.href} class="blog-post-row" href={item.href}>
              <span class="blog-post-kicker">{item.kicker}</span>
              <span class="blog-post-title">{item.title}</span>
              {item.dek ? <span class="blog-post-dek">{item.dek}</span> : null}
              {item.byline ? <span class="blog-post-byline">{item.byline}</span> : null}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default TeaserGrid;
