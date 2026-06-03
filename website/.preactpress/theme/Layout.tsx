import type { ComponentChildren, ComponentType, FunctionalComponent, JSX } from 'preact'
import { useEffect, useMemo, useState } from 'preact/hooks'
import Logo from './Logo.js'
import ThemeToggle from './ThemeToggle.js'
import './site.css'

export interface LayoutProps {
  site: {
    title: string
    description: string
    base: string
    lang: string
    url?: string
  }
  themeConfig: {
    nav?: { text: string; link: string }[]
    sidebar?: { text?: string; items: { text: string; link: string }[] }[]
    outline?: boolean
    search?: boolean
    tags?: boolean
    footer?: string
    githubUrl?: string
    editLink?: { pattern: string; text?: string }
    lastUpdated?: boolean
  }
  routePath: string
  page?:
    | {
        kind: 'markdown'
        title?: string
        description?: string
        tags?: string[]
        meta: Record<string, unknown>
        headings: { id: string; text: string; level: number }[]
        relativePath?: string
        lastUpdated?: string
        html: string
      }
    | {
        kind: 'mdx'
        title?: string
        description?: string
        tags?: string[]
        meta: Record<string, unknown>
        headings: { id: string; text: string; level: number }[]
        relativePath?: string
        lastUpdated?: string
        Component: ComponentType<{
          components?: Record<string, ComponentType<Record<string, unknown>>>
        }>
      }
}

function withBase(base: string, link: string): string {
  if (/^https?:\/\//.test(link)) return link
  const b = base === '/' ? '' : base.replace(/\/$/, '')
  const l = link.startsWith('/') ? link : `/${link}`
  return `${b}${l}`
}

function normalizeLink(link: string): string {
  const clean = link.split(/[?#]/, 1)[0] || '/'
  const prefixed = clean.startsWith('/') ? clean : `/${clean}`
  return prefixed.replace(/\/$/, '') || '/'
}

function isActive(routePath: string, link: string): boolean {
  if (/^https?:\/\//.test(link)) return false
  const route = normalizeLink(routePath)
  const target = normalizeLink(link)
  return route === target || (target !== '/' && route.startsWith(`${target}/`))
}

function childText(children: ComponentChildren): string {
  if (children == null || typeof children === 'boolean') return ''
  if (typeof children === 'string' || typeof children === 'number') return String(children)
  if (Array.isArray(children)) return children.map(childText).join('')
  if (typeof children === 'object' && 'props' in children) {
    return childText(children.props.children as ComponentChildren)
  }
  return ''
}

function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z0-9#]+;/gi, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'section'
}

function tagRoute(tag: string): string {
  return `/tags/${slugify(tag)}`
}

function createMdxHeadingComponents() {
  const used = new Map<string, number>()
  const heading =
    (Tag: 'h2' | 'h3') =>
    ({ children, ...props }: JSX.HTMLAttributes<HTMLHeadingElement>) => {
      const base = slugify(childText(children))
      const count = used.get(base) ?? 0
      used.set(base, count + 1)
      const id = count === 0 ? base : `${base}-${count + 1}`
      return (
        <Tag {...props} id={id} class={`pp-heading ${props.class ?? ''}`.trim()}>
          {children}
          <a class="pp-heading-anchor" href={`#${id}`} aria-label="Link to section">
            #
          </a>
        </Tag>
      )
    }

  return {
    h2: heading('h2'),
    h3: heading('h3')
  }
}

const Layout: FunctionalComponent<LayoutProps> = ({ site, themeConfig, routePath, page }) => {
  const [query, setQuery] = useState('')
  const sidebarItems = (themeConfig.sidebar ?? []).flatMap((group) => group.items)
  const normalizedQuery = query.trim().toLowerCase()
  const visibleSidebar = useMemo(() => {
    if (!normalizedQuery) return themeConfig.sidebar ?? []
    return (themeConfig.sidebar ?? [])
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => item.text.toLowerCase().includes(normalizedQuery))
      }))
      .filter((group) => group.items.length > 0)
  }, [normalizedQuery, themeConfig.sidebar])
  const activeIndex = sidebarItems.findIndex((item) => isActive(routePath, item.link))
  const previous = activeIndex > 0 ? sidebarItems[activeIndex - 1] : undefined
  const next =
    activeIndex >= 0 && activeIndex < sidebarItems.length - 1
      ? sidebarItems[activeIndex + 1]
      : undefined
  const MdxComponent = page?.kind === 'mdx' ? page.Component : undefined
  const mdxComponents = createMdxHeadingComponents()
  const isHome = normalizeLink(routePath) === '/'
  const pageTags = page?.tags ?? []
  const showTags =
    themeConfig.tags !== false && pageTags.length > 0 && !Boolean(page?.meta.tagIndex)
  const editHref =
    themeConfig.editLink && page?.relativePath
      ? themeConfig.editLink.pattern.replace(/:path/g, page.relativePath)
      : undefined
  const lastUpdated = page?.lastUpdated
    ? new Date(page.lastUpdated).toLocaleDateString(site.lang || 'en', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : undefined
  const outlineItems = themeConfig.outline === false || isHome ? [] : page?.headings ?? []
  const githubUrl = themeConfig.githubUrl ?? 'https://github.com/'

  useEffect(() => {
    setQuery('')
  }, [routePath])

  const contentClass = isHome ? 'pp-home-content' : 'pp-doc-content'
  const renderedContent = MdxComponent ? (
    <div class={contentClass}>
      <MdxComponent components={mdxComponents} />
    </div>
  ) : (
    <div
      class={contentClass}
      dangerouslySetInnerHTML={{ __html: page?.kind === 'markdown' ? page.html : '' }}
    />
  )

  return (
    <div class={`pp-site${isHome ? ' is-home' : ''}`}>
      <a class="pp-skip" href="#content">
        Skip to content
      </a>
      <header class="pp-header">
        <div class="pp-header-inner">
          <a class="pp-brand" href={withBase(site.base, '/')} aria-label={site.title}>
            <Logo class="pp-logo" label={site.title} />
          </a>
          <div class="pp-header-actions">
            <nav class="pp-nav" aria-label="Main navigation">
              {(themeConfig.nav ?? []).map((item) => {
                const active = isActive(routePath, item.link)
                return (
                  <a
                    key={item.link}
                    class={active ? 'active' : ''}
                    href={withBase(site.base, item.link)}
                    aria-current={active ? 'page' : undefined}
                  >
                    {item.text}
                  </a>
                )
              })}
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>
      {isHome ? (
        <main id="content" class="pp-home-main">
          {renderedContent}
        </main>
      ) : (
        <div class="pp-doc-shell">
          <aside class="pp-sidebar" aria-label="Documentation navigation">
            <div class="pp-sidebar-panel">
              {themeConfig.search ? (
                <label class="pp-search">
                  <span>Search pages</span>
                  <input
                    type="search"
                    value={query}
                    placeholder="Filter documentation..."
                    onInput={(event) => setQuery((event.currentTarget as HTMLInputElement).value)}
                  />
                </label>
              ) : null}
              {visibleSidebar.map((group, gi) => (
                <div key={gi} class="pp-sidebar-group">
                  {group.text ? <h2>{group.text}</h2> : null}
                  <ul>
                    {group.items.map((item) => {
                      const active = isActive(routePath, item.link)
                      return (
                        <li key={item.link}>
                          <a
                            class={active ? 'active' : ''}
                            href={withBase(site.base, item.link)}
                            aria-current={active ? 'page' : undefined}
                          >
                            {item.text}
                          </a>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </aside>
          <main id="content" class="pp-doc-main">
            <article class="pp-doc">
              <h1 class="pp-doc-title">{page?.title ?? site.title}</h1>
              {page?.description ? <p class="pp-doc-lead">{page.description}</p> : null}
              {showTags ? (
                <ul class="pp-tags" aria-label="Tags">
                  {pageTags.map((tag) => (
                    <li key={tag}>
                      <a href={withBase(site.base, tagRoute(tag))}>{tag}</a>
                    </li>
                  ))}
                </ul>
              ) : null}
              {renderedContent}
              {previous || next ? (
                <nav class="pp-pager" aria-label="Page navigation">
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
                <footer class="pp-doc-meta">
                  {themeConfig.lastUpdated && lastUpdated ? <span>Updated {lastUpdated}</span> : null}
                  {editHref ? (
                    <span>
                      {themeConfig.lastUpdated && lastUpdated ? ' · ' : null}
                      <a href={editHref}>{themeConfig.editLink?.text ?? 'Edit this page'}</a>
                    </span>
                  ) : null}
                </footer>
              ) : null}
            </article>
          </main>
          {outlineItems.length > 0 ? (
            <aside class="pp-outline" aria-label="On this page">
              <div class="pp-outline-panel">
                <h2>On this page</h2>
                <ul>
                  {outlineItems.map((heading) => (
                    <li key={heading.id} class={`level-${heading.level}`}>
                      <a href={`#${heading.id}`}>{heading.text}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          ) : null}
        </div>
      )}
      {themeConfig.footer ? <footer class="pp-footer">{themeConfig.footer}</footer> : null}
    </div>
  )
}

export default Layout
