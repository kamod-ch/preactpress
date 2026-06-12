import type { ComponentChildren, FunctionalComponent, JSX } from 'preact'
import { useEffect, useMemo, useState } from 'preact/hooks'
import type { LayoutProps } from '@kamod-ch/preactpress/client'
import Logo from './Logo.js'
import ThemeToggle from './ThemeToggle.js'
import './hono.css'

interface SidebarItem {
  text: string
  link?: string
  items?: SidebarItem[]
}

interface SidebarGroup {
  text?: string
  items: SidebarItem[]
}

type SocialLink = NonNullable<LayoutProps['themeConfig']['socialLinks']>[number]

const GITHUB_SVG =
  '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>GitHub</title><path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.404 1.02.005 2.04.137 3 .404 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>'

function withBase(base: string, link: string): string {
  if (/^(?:[a-z]+:)?\/\//i.test(link) || /^(?:data|mailto|tel):/i.test(link) || link.startsWith('#')) {
    return link
  }
  const b = base === '/' ? '' : base.replace(/\/$/, '')
  const l = link.startsWith('/') ? link : `/${link}`
  return `${b}${l}`
}

function normalizeLink(link: string): string {
  const clean = link.split(/[?#]/, 1)[0] || '/'
  const prefixed = clean.startsWith('/') ? clean : `/${clean}`
  return prefixed.replace(/\/$/, '') || '/'
}

function isActive(routePath: string, link: string | undefined): boolean {
  if (!link || /^(?:[a-z]+:)?\/\//i.test(link)) return false
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

function resolveSidebar(
  sidebar: LayoutProps['themeConfig']['sidebar'],
  routePath: string
): SidebarGroup[] {
  if (!sidebar) return []
  if (Array.isArray(sidebar)) return sidebar

  const route = normalizeLink(routePath)
  const entries = Object.entries(sidebar)
    .map(([prefix, groups]) => ({ prefix: normalizeLink(prefix), groups }))
    .filter(({ prefix }) => prefix !== '/')
    .sort((a, b) => b.prefix.length - a.prefix.length)

  for (const { prefix, groups } of entries) {
    if (route === prefix || route.startsWith(`${prefix}/`)) return groups
  }

  return sidebar['/'] ?? sidebar[''] ?? []
}

function flattenItems(items: SidebarItem[]): Array<{ text: string; link: string }> {
  const out: Array<{ text: string; link: string }> = []
  for (const item of items) {
    if (item.link) out.push({ text: item.text, link: item.link })
    if (item.items?.length) out.push(...flattenItems(item.items))
  }
  return out
}

function flattenSidebarItems(sidebar: SidebarGroup[]): Array<{ text: string; link: string }> {
  return sidebar.flatMap((group) => flattenItems(group.items))
}

function socialIconSvg(icon: SocialLink['icon']): string | undefined {
  if (typeof icon === 'object') return icon.svg
  return icon.toLowerCase() === 'github' ? GITHUB_SVG : undefined
}

function socialLinkLabel(icon: SocialLink['icon'], ariaLabel?: string): string {
  if (ariaLabel) return ariaLabel
  return typeof icon === 'string' ? icon : 'Social link'
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
        <Tag {...props} id={id} class={`hn-heading ${props.class ?? ''}`.trim()}>
          {children}
          <a class="hn-heading-anchor" href={`#${id}`} aria-label="Link to section">
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

function isHomeRoute(routePath: string, prefix: string | undefined): boolean {
  return normalizeLink(routePath) === normalizeLink(prefix || '/')
}

const Layout: FunctionalComponent<LayoutProps> = ({
  site,
  themeConfig,
  routePath,
  page,
  locale,
  locales = [],
  localizeRoute
}) => {
  const [query, setQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isHome = isHomeRoute(routePath, locale?.prefix)
  const activeSidebar = resolveSidebar(themeConfig.sidebar, routePath)
  const sidebarItems = flattenSidebarItems(activeSidebar)
  const normalizedQuery = query.trim().toLowerCase()
  const visibleSidebar = useMemo(() => {
    if (!normalizedQuery) return activeSidebar
    return activeSidebar
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => item.text.toLowerCase().includes(normalizedQuery))
      }))
      .filter((group) => group.items.length > 0)
  }, [activeSidebar, normalizedQuery])
  const activeIndex = sidebarItems.findIndex((item) => isActive(routePath, item.link))
  const previous = activeIndex > 0 ? sidebarItems[activeIndex - 1] : undefined
  const next =
    activeIndex >= 0 && activeIndex < sidebarItems.length - 1 ? sidebarItems[activeIndex + 1] : undefined
  const mdxComponents = createMdxHeadingComponents()
  const MdxComponent = page?.kind === 'mdx' ? page.Component : undefined
  const pageTags = page?.tags ?? []
  const showTags = themeConfig.tags !== false && pageTags.length > 0 && !Boolean(page?.meta.tagIndex)
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
  const contentClass = isHome ? 'hn-home-content' : 'hn-doc-content'
  const renderedContent = MdxComponent ? (
    <div class={contentClass}>
      <MdxComponent components={mdxComponents} />
    </div>
  ) : (
    <div class={contentClass} dangerouslySetInnerHTML={{ __html: page?.kind === 'markdown' ? page.html : '' }} />
  )

  useEffect(() => {
    setQuery('')
    if (window.matchMedia('(max-width: 820px)').matches) {
      setSidebarOpen(false)
    }
  }, [routePath])

  useEffect(() => {
    const media = window.matchMedia('(max-width: 820px)')
    const syncSidebar = () => setSidebarOpen(!media.matches)
    syncSidebar()
    media.addEventListener('change', syncSidebar)
    return () => media.removeEventListener('change', syncSidebar)
  }, [])

  return (
    <div class={`hn-site${isHome ? ' is-home' : ''}`}>
      <a class="hn-skip" href="#content">
        Skip to content
      </a>
      <header class="hn-header">
        <div class="hn-header-inner">
          <a class="hn-brand" href={withBase(site.base, locale?.prefix || '/')} aria-label={site.title}>
            <Logo label={site.title} />
          </a>
          <div class="hn-header-actions">
            <nav class="hn-nav" aria-label="Main navigation">
              {(themeConfig.nav ?? []).map((item) =>
                item.link ? (
                  <a
                    key={item.link}
                    class={isActive(routePath, item.link) ? 'active' : ''}
                    href={withBase(site.base, item.link)}
                    aria-current={isActive(routePath, item.link) ? 'page' : undefined}
                  >
                    {item.text}
                  </a>
                ) : null
              )}
            </nav>
            {themeConfig.socialLinks?.length ? (
              <div class="hn-social" aria-label="Social links">
                {themeConfig.socialLinks.map((link) => {
                  const svg = socialIconSvg(link.icon)
                  return (
                    <a
                      href={withBase(site.base, link.link)}
                      aria-label={socialLinkLabel(link.icon, link.ariaLabel)}
                      key={`${socialLinkLabel(link.icon, link.ariaLabel)}:${link.link}`}
                    >
                      {svg ? <span dangerouslySetInnerHTML={{ __html: svg }} /> : socialLinkLabel(link.icon, link.ariaLabel)}
                    </a>
                  )
                })}
              </div>
            ) : null}
            {locales.length > 1 && localizeRoute ? (
              <details class="hn-locale-switcher">
                <summary>{locale?.label ?? 'Language'}</summary>
                <div class="hn-locale-menu">
                  {locales.map((item) => {
                    const active = item.key === locale?.key
                    return (
                      <a
                        key={item.key}
                        href={withBase(site.base, localizeRoute(item))}
                        aria-current={active ? 'page' : undefined}
                        class={active ? 'active' : ''}
                      >
                        {item.label}
                      </a>
                    )
                  })}
                </div>
              </details>
            ) : null}
            <ThemeToggle />
          </div>
        </div>
      </header>
      {isHome ? (
        <main id="content" class="hn-home-main">
          {renderedContent}
        </main>
      ) : (
        <div class="hn-doc-shell">
          <aside class="hn-sidebar" aria-label="Documentation navigation">
            <details
              class="hn-sidebar-panel"
              open={sidebarOpen}
              onToggle={(event) => setSidebarOpen(event.currentTarget.open)}
            >
              <summary>Documentation menu</summary>
              {themeConfig.search ? (
                <label class="hn-search">
                  <span>Search pages</span>
                  <input
                    type="search"
                    value={query}
                    placeholder="Filter documentation..."
                    onInput={(event) => setQuery(event.currentTarget.value)}
                  />
                </label>
              ) : null}
              {visibleSidebar.map((group, groupIndex) => (
                <div class="hn-sidebar-group" key={`${group.text ?? 'group'}:${groupIndex}`}>
                  {group.text ? <h2>{group.text}</h2> : null}
                  <ul>
                    {group.items.map((item) =>
                      item.link ? (
                        <li key={item.link}>
                          <a
                            class={isActive(routePath, item.link) ? 'active' : ''}
                            href={withBase(site.base, item.link)}
                            aria-current={isActive(routePath, item.link) ? 'page' : undefined}
                          >
                            {item.text}
                          </a>
                        </li>
                      ) : null
                    )}
                  </ul>
                </div>
              ))}
            </details>
          </aside>
          <main id="content" class="hn-doc-main">
            <article class="hn-doc">
              <h1 class="hn-doc-title">{page?.title ?? site.title}</h1>
              {page?.description ? <p class="hn-doc-lead">{page.description}</p> : null}
              {showTags ? (
                <ul class="hn-tags" aria-label="Tags">
                  {pageTags.map((tag) => (
                    <li key={tag}>
                      <a href={withBase(site.base, tagRoute(tag))}>{tag}</a>
                    </li>
                  ))}
                </ul>
              ) : null}
              {renderedContent}
              {previous || next ? (
                <nav class="hn-pager" aria-label="Page navigation">
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
                <footer class="hn-doc-meta">
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
            <aside class="hn-outline" aria-label="On this page">
              <div class="hn-outline-panel">
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
      {themeConfig.footer ? <footer class="hn-footer">{themeConfig.footer}</footer> : null}
    </div>
  )
}

export default Layout
