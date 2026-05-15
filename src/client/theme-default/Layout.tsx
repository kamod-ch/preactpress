import type { ComponentChildren, FunctionalComponent, JSX } from 'preact'
import { useEffect, useMemo, useState } from 'preact/hooks'
import type { LayoutProps } from '../types.js'
import Logo from './Logo.js'
import ThemeToggle from './ThemeToggle.js'
import './styles.css'

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
          <a class="pp-heading-anchor" href={`#${id}`} aria-label="Link to this section">
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

const Layout: FunctionalComponent<LayoutProps> = ({
  site,
  themeConfig,
  routePath,
  page
}) => {
  const title = page?.title ? `${page.title} | ${site.title}` : site.title
  const [query, setQuery] = useState('')
  const [activeHeading, setActiveHeading] = useState<string | undefined>()
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
  const showOutline = themeConfig.outline !== false && Boolean(page?.headings.length)
  const MdxComponent = page?.kind === 'mdx' ? page.Component : undefined
  const mdxComponents = createMdxHeadingComponents()
  const editHref =
    themeConfig.editLink && page?.relativePath
      ? themeConfig.editLink.pattern.replace(/:path/g, page.relativePath)
      : undefined
  const lastUpdated = page?.lastUpdated
    ? new Date(page.lastUpdated).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
    : undefined

  useEffect(() => {
    setQuery('')
  }, [routePath])

  useEffect(() => {
    if (!page?.headings.length) {
      setActiveHeading(undefined)
      return
    }
    const update = () => {
      const visible = page.headings
        .map((heading) => document.getElementById(heading.id))
        .filter((el): el is HTMLElement => Boolean(el))
        .filter((el) => el.getBoundingClientRect().top <= 96)
      setActiveHeading(visible.at(-1)?.id ?? page.headings[0]?.id)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [page?.headings])

  return (
    <div class="pp-layout">
      <a class="pp-skip-link" href="#content">
        Skip to content
      </a>
      <header class="pp-nav">
        <div class="pp-nav-inner">
          <a class="pp-title" href={withBase(site.base, '/')} aria-label={site.title}>
            <Logo class="pp-logo" label={site.title} />
          </a>
          <div class="pp-nav-right">
            <nav class="pp-nav-links">
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
      <div class="pp-body">
        <aside class="pp-sidebar" aria-label="Site navigation">
          <details class="pp-sidebar-panel" open>
            <summary>Navigation</summary>
            {themeConfig.search ? (
              <label class="pp-search">
                <span>Search</span>
                <input
                  type="search"
                  value={query}
                  placeholder="Filter pages"
                  onInput={(event) => setQuery((event.currentTarget as HTMLInputElement).value)}
                />
              </label>
            ) : null}
            {visibleSidebar.map((group, gi) => (
              <div key={gi} class="pp-sidebar-group">
                {group.text ? (
                  <div class="pp-sidebar-heading">{group.text}</div>
                ) : null}
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
          </details>
        </aside>
        <main id="content" class="pp-main">
          <article class="pp-doc">
            <h1 class="pp-doc-title">{page?.title ?? title}</h1>
            {page?.description ? (
              <p class="pp-doc-lead">{page.description}</p>
            ) : null}
            {MdxComponent ? (
              <div class="pp-doc-content">
                <MdxComponent components={mdxComponents} />
              </div>
            ) : (
              <div
                class="pp-doc-content"
                dangerouslySetInnerHTML={{ __html: page?.kind === 'markdown' ? page.html : '' }}
              />
            )}
            {previous || next ? (
              <nav class="pp-pager" aria-label="Page navigation">
                {previous ? (
                  <a class="pp-pager-link previous" href={withBase(site.base, previous.link)}>
                    <span>Previous</span>
                    {previous.text}
                  </a>
                ) : (
                  <span />
                )}
                {next ? (
                  <a class="pp-pager-link next" href={withBase(site.base, next.link)}>
                    <span>Next</span>
                    {next.text}
                  </a>
                ) : null}
              </nav>
            ) : null}
            {themeConfig.lastUpdated || editHref ? (
              <footer class="pp-doc-meta">
                {themeConfig.lastUpdated && lastUpdated ? (
                  <span>Last updated {lastUpdated}</span>
                ) : null}
                {editHref ? (
                  <a href={editHref}>{themeConfig.editLink?.text ?? 'Edit this page'}</a>
                ) : null}
              </footer>
            ) : null}
          </article>
        </main>
        {showOutline ? (
          <aside class="pp-outline" aria-label="On this page">
            <div class="pp-outline-heading">On this page</div>
            <nav>
              {page?.headings.map((heading) => (
                <a
                  key={heading.id}
                  class={`level-${heading.level}${activeHeading === heading.id ? ' active' : ''}`}
                  href={`#${heading.id}`}
                >
                  {heading.text}
                </a>
              ))}
            </nav>
          </aside>
        ) : null}
      </div>
      {themeConfig.footer ? (
        <footer class="pp-footer">{themeConfig.footer}</footer>
      ) : null}
    </div>
  )
}

export default Layout
