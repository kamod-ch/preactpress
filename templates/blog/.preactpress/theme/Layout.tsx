import type { FunctionalComponent } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";
import {
  createMdxHeadingComponents,
  isActive,
  normalizeLink,
  slugifyHeading,
  withBase,
  type LayoutProps,
} from "@kamod-ch/preactpress/client";
import type { ArticlePost } from "@kamod-ch/preactpress/shared";
import ThemeToggle from "./ThemeToggle.js";
import TeaserGrid, { articlesToTeasers } from "./TeaserGrid.js";
import "./blog.css";

function tagRoute(tag: string): string {
  return `/tags/${slugifyHeading(tag)}`;
}

function metaString(meta: Record<string, unknown> | undefined, key: string): string | undefined {
  const value = meta?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

const Layout: FunctionalComponent<LayoutProps> = ({ site, themeConfig, routePath, page }) => {
  const title = page?.title ? `${page.title} | ${site.title}` : site.title;
  const [query, setQuery] = useState("");
  const sidebarItems = (themeConfig.sidebar ?? []).flatMap((group) => group.items);
  const normalizedQuery = query.trim().toLowerCase();
  const visibleSidebar = useMemo(() => {
    if (!normalizedQuery) return themeConfig.sidebar ?? [];
    return (themeConfig.sidebar ?? [])
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => item.text.toLowerCase().includes(normalizedQuery)),
      }))
      .filter((group) => group.items.length > 0);
  }, [normalizedQuery, themeConfig.sidebar]);
  const activeIndex = sidebarItems.findIndex((item) => isActive(routePath, item.link));
  const previous = activeIndex > 0 ? sidebarItems[activeIndex - 1] : undefined;
  const next =
    activeIndex >= 0 && activeIndex < sidebarItems.length - 1
      ? sidebarItems[activeIndex + 1]
      : undefined;
  const MdxComponent = page?.kind === "mdx" ? page.Component : undefined;
  const mdxComponents = createMdxHeadingComponents({
    headingClass: "blog-heading",
    anchorClass: "blog-heading-anchor",
    anchorLabel: "Link to section",
  });
  const editHref =
    themeConfig.editLink && page?.relativePath
      ? themeConfig.editLink.pattern.replace(/:path/g, page.relativePath)
      : undefined;
  const lastUpdated = page?.lastUpdated
    ? new Date(page.lastUpdated).toLocaleDateString(site.lang || "en", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : undefined;
  const isHome = normalizeLink(routePath) === "/";
  const hasRail = !isHome && (themeConfig.sidebar?.length ?? 0) > 0;
  const homeArticles = isHome ? (page?.meta.contentData as ArticlePost[] | undefined) : undefined;
  const homeTeasers = homeArticles?.length ? articlesToTeasers(homeArticles) : undefined;
  const pageTags = page?.tags ?? [];
  const showTags = themeConfig.tags !== false && pageTags.length > 0 && !page?.meta.tagIndex;
  const author = metaString(page?.meta, "author");
  const readTime = metaString(page?.meta, "readTime");
  const category =
    typeof page?.meta.category === "string"
      ? page.meta.category
      : page?.meta.category &&
          typeof page.meta.category === "object" &&
          "name" in page.meta.category &&
          typeof page.meta.category.name === "string"
        ? page.meta.category.name
        : undefined;

  useEffect(() => {
    setQuery("");
  }, [routePath]);

  return (
    <div class="blog-layout">
      <a class="blog-skip" href="#content">
        Skip to content
      </a>
      <header class="blog-header">
        <div class="blog-header-inner">
          <a class="blog-logo" href={withBase(site.base, "/")}>
            <span class="blog-logo-mark">PP</span>
            <span>
              <span class="blog-logo-kicker">Engineering</span>
              <span class="blog-logo-title">{site.title}</span>
            </span>
          </a>
          <div class="blog-header-tools">
            <nav class="blog-nav" aria-label="Main navigation">
              {(themeConfig.nav ?? []).map((item) => {
                const active = isActive(routePath, item.link);
                return (
                  <a
                    key={item.link}
                    class={active ? "active" : ""}
                    href={withBase(site.base, item.link)}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.text}
                  </a>
                );
              })}
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <div class={`blog-shell${hasRail ? " has-rail" : ""}`}>
        <main id="content" class="blog-main">
          <article class={`blog-article${isHome ? " wide" : ""}`}>
            {isHome ? <p class="blog-eyebrow">Latest writing</p> : null}
            <h1 class="blog-doc-title">{page?.title ?? title}</h1>
            {page?.description ? <p class="blog-doc-lead">{page.description}</p> : null}
            {!isHome && (author || readTime || category) ? (
              <p class="blog-post-meta">
                {category ? <span>{category}</span> : null}
                {author ? <span>{author}</span> : null}
                {readTime ? <span>{readTime}</span> : null}
              </p>
            ) : null}
            {showTags ? (
              <ul class="blog-tags" aria-label="Tags">
                {pageTags.map((tag) => (
                  <li key={tag}>
                    <a href={withBase(site.base, tagRoute(tag))}>{tag}</a>
                  </li>
                ))}
              </ul>
            ) : null}
            {homeTeasers?.length ? <TeaserGrid items={homeTeasers} /> : null}
            {MdxComponent ? (
              <div class="blog-doc-content">
                <MdxComponent components={mdxComponents} />
              </div>
            ) : (
              <div
                class="blog-doc-content"
                dangerouslySetInnerHTML={{ __html: page?.kind === "markdown" ? page.html : "" }}
              />
            )}
            {previous || next ? (
              <nav class="blog-pager" aria-label="Page navigation">
                {previous ? (
                  <a class="previous" href={withBase(site.base, previous.link)}>
                    <span>Previous</span>
                    {previous.text}
                  </a>
                ) : (
                  <span />
                )}
                {next ? (
                  <a class="next" href={withBase(site.base, next.link)}>
                    <span>Next</span>
                    {next.text}
                  </a>
                ) : null}
              </nav>
            ) : null}
            {themeConfig.lastUpdated || editHref ? (
              <footer class="blog-doc-meta">
                {themeConfig.lastUpdated && lastUpdated ? <span>Updated {lastUpdated}</span> : null}
                {editHref ? (
                  <span>
                    {themeConfig.lastUpdated && lastUpdated ? " · " : null}
                    <a href={editHref}>{themeConfig.editLink?.text ?? "Edit this page"}</a>
                  </span>
                ) : null}
              </footer>
            ) : null}
          </article>
        </main>
        {hasRail ? (
          <aside class="blog-rail" aria-label="Sidebar">
            <div class="blog-rail-panel">
              {themeConfig.search ? (
                <div class="blog-search">
                  <label>
                    <span>Filter</span>
                    <input
                      type="search"
                      value={query}
                      placeholder="Search articles…"
                      onInput={(event) => setQuery((event.currentTarget as HTMLInputElement).value)}
                    />
                  </label>
                </div>
              ) : null}
              {visibleSidebar.map((group, gi) => (
                <div key={gi}>
                  {group.text ? <h2>{group.text}</h2> : null}
                  <ul>
                    {group.items.map((it) => {
                      const active = isActive(routePath, it.link);
                      return (
                        <li key={it.link}>
                          <a
                            class={active ? "active" : ""}
                            href={withBase(site.base, it.link)}
                            aria-current={active ? "page" : undefined}
                          >
                            {it.text}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </aside>
        ) : null}
      </div>
      {themeConfig.footer ? <footer class="blog-footer">{themeConfig.footer}</footer> : null}
    </div>
  );
};

export default Layout;
