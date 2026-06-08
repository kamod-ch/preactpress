import type { ComponentChildren, ComponentType, FunctionalComponent, JSX } from 'preact'
import { useEffect, useMemo, useState } from 'preact/hooks'
import ThemeToggle from './ThemeToggle.js'
import './magazine.css'

/** Mirrors `preactpress` `LayoutProps` so this example stays self-contained. */
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
        <Tag {...props} id={id} class={`mag-heading ${props.class ?? ''}`.trim()}>
          {children}
          <a class="mag-heading-anchor" href={`#${id}`} aria-label="Abschnitt verlinken">
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
  const title = page?.title ? `${page.title} | ${site.title}` : site.title
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
  const editHref =
    themeConfig.editLink && page?.relativePath
      ? themeConfig.editLink.pattern.replace(/:path/g, page.relativePath)
      : undefined
  const lastUpdated = page?.lastUpdated
    ? new Date(page.lastUpdated).toLocaleDateString(site.lang || 'de', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : undefined
  const hasRail = (themeConfig.sidebar?.length ?? 0) > 0
  const isHome = normalizeLink(routePath) === '/'
  const pageTags = page?.tags ?? []
  const showTags =
    themeConfig.tags !== false && pageTags.length > 0 && !Boolean(page?.meta.tagIndex)
  const today = new Intl.DateTimeFormat(site.lang || 'de', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date())

  useEffect(() => {
    setQuery('')
  }, [routePath])

  return (
    <div class="mag-layout">
      <a class="mag-skip" href="#content">
        Zum Inhalt springen
      </a>
      <div class="mag-topbar">
        <div class="mag-topbar-inner">
          <span>{today}</span>
          <span>{site.description}</span>
        </div>
      </div>
      <header class="mag-masthead">
        <div class="mag-masthead-inner">
          <a class="mag-logo" href={withBase(site.base, '/')}>
            <span class="mag-logo-mark">Wochenausgabe</span>
            <span class="mag-logo-title">{site.title}</span>
          </a>
          <div class="mag-masthead-tools">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <div class="mag-nav-wrap">
        <nav class="mag-nav" aria-label="Hauptnavigation">
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
      </div>
      <div class={`mag-shell${hasRail ? ' has-rail' : ''}`}>
        <main id="content" class="mag-main">
          <article class={`mag-article${isHome ? ' wide' : ''}`}>
            {isHome ? <p class="mag-eyebrow">Schwerpunkte</p> : null}
            <h1 class="mag-doc-title">{page?.title ?? title}</h1>
            {page?.description ? <p class="mag-doc-lead">{page.description}</p> : null}
            {showTags ? (
              <ul class="mag-tags" aria-label="Tags">
                {pageTags.map((tag) => (
                  <li key={tag}>
                    <a href={withBase(site.base, tagRoute(tag))}>{tag}</a>
                  </li>
                ))}
              </ul>
            ) : null}
            {MdxComponent ? (
              <div class="mag-doc-content">
                <MdxComponent components={mdxComponents} />
              </div>
            ) : (
              <div
                class="mag-doc-content"
                dangerouslySetInnerHTML={{ __html: page?.kind === 'markdown' ? page.html : '' }}
              />
            )}
            {previous || next ? (
              <nav class="mag-pager" aria-label="Seitennavigation">
                {previous ? (
                  <a class="previous" href={withBase(site.base, previous.link)}>
                    <span>Zurück</span>
                    {previous.text}
                  </a>
                ) : (
                  <span />
                )}
                {next ? (
                  <a class="next" href={withBase(site.base, next.link)}>
                    <span>Weiter</span>
                    {next.text}
                  </a>
                ) : null}
              </nav>
            ) : null}
            {themeConfig.lastUpdated || editHref ? (
              <footer class="mag-doc-meta">
                {themeConfig.lastUpdated && lastUpdated ? <span>Stand: {lastUpdated}</span> : null}
                {editHref ? (
                  <span>
                    {themeConfig.lastUpdated && lastUpdated ? ' · ' : null}
                    <a href={editHref}>{themeConfig.editLink?.text ?? 'Seite bearbeiten'}</a>
                  </span>
                ) : null}
              </footer>
            ) : null}
          </article>
        </main>
        {hasRail ? (
          <aside class="mag-rail" aria-label="Seitenleiste">
            <div class="mag-rail-panel">
              {themeConfig.search ? (
                <div class="mag-search">
                  <label>
                    <span>Filter</span>
                    <input
                      type="search"
                      value={query}
                      placeholder="Artikel suchen…"
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
                      const active = isActive(routePath, it.link)
                      return (
                        <li key={it.link}>
                          <a
                            class={active ? 'active' : ''}
                            href={withBase(site.base, it.link)}
                            aria-current={active ? 'page' : undefined}
                          >
                            {it.text}
                          </a>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </aside>
        ) : null}
      </div>
      {themeConfig.footer ? <footer class="mag-footer">{themeConfig.footer}</footer> : null}
    </div>
  )
}

export default Layout
