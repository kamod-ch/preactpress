import type { ComponentChildren, FunctionalComponent, JSX } from 'preact'
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks'
import type { LayoutProps } from '../types.js'
import { slugifyTagSegment, tagIndexPageRoute } from '../../shared/tags.js'
import { slugifySegment } from '../../shared/slug.js'
import { filterHeadingsForOutline, resolvePageChrome } from '../../shared/pageChrome.js'
import { resolvePageHeadMeta, titleTemplateFromMeta } from '../../shared/pageMeta.js'
import { flattenSidebarLeafItems, resolveSidebarForRoute } from '../../shared/sidebar.js'
import { resolveThemeLabels } from '../../shared/themeLabels.js'
import {
  algoliaOptionsFromSearch,
  isAlgoliaSearchEnabled,
  isLocalSearchEnabled,
  resolveAlgoliaOptions
} from '../../shared/search.js'
import { useSiteSearch } from '../useSiteSearch.js'
import AlgoliaSearch from './AlgoliaSearch.js'
import Features from './Features.js'
import Hero from './Hero.js'
import Logo from './Logo.js'
import NavLinks from './NavLinks.js'
import SidebarNav from './SidebarNav.js'
import SocialLinks from './SocialLinks.js'
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

function classNames(...values: Array<string | undefined | false>): string {
  return values.filter(Boolean).join(' ')
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
  return slugifySegment(text)
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
  page,
  i18n,
  locale
}) => {
  const { title } = resolvePageHeadMeta(
    page
      ? {
          title: page.title,
          titleTemplate: titleTemplateFromMeta(page.meta),
          description: page.description,
          kind: page.kind,
          html: page.kind === 'markdown' ? page.html : undefined
        }
      : undefined,
    site
  )
  const labels = resolveThemeLabels(site.lang, themeConfig.labels)
  const localSearch = isLocalSearchEnabled(themeConfig.search)
  const algoliaSearch = isAlgoliaSearchEnabled(themeConfig.search)
  const algoliaOptions = algoliaSearch
    ? resolveAlgoliaOptions(algoliaOptionsFromSearch(themeConfig.search)!, locale?.key)
    : undefined
  const [query, setQuery] = useState('')
  const [activeHeading, setActiveHeading] = useState<string | undefined>()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLElement>(null)
  const activeSidebar = resolveSidebarForRoute(themeConfig.sidebar, routePath, i18n)
  const sidebarItems = activeSidebar.flatMap((group) => flattenSidebarLeafItems(group.items))
  const normalizedQuery = query.trim().toLowerCase()
  const searchResults = useSiteSearch(site.base, query, locale?.key)
  const visibleSidebar = useMemo(() => {
    if (!normalizedQuery || searchResults.length > 0) return activeSidebar
    const filterItems = (items: typeof activeSidebar[0]['items']): typeof items => {
      return items
        .map((item) => {
          const nested = item.items?.length ? filterItems(item.items) : undefined
          const selfMatch = item.text.toLowerCase().includes(normalizedQuery)
          if (nested?.length) return { ...item, items: nested }
          if (selfMatch) return item
          return null
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
    }
    return activeSidebar
      .map((group) => ({ ...group, items: filterItems(group.items) }))
      .filter((group) => group.items.length > 0)
  }, [normalizedQuery, searchResults.length, activeSidebar])
  const activeIndex = sidebarItems.findIndex((item) => isActive(routePath, item.link))
  const previous = activeIndex > 0 ? sidebarItems[activeIndex - 1] : undefined
  const next =
    activeIndex >= 0 && activeIndex < sidebarItems.length - 1
      ? sidebarItems[activeIndex + 1]
      : undefined
  const chrome = resolvePageChrome(page?.meta, themeConfig)
  const outlineKey =
    chrome.outlineLevels === false ? 'false' : `${chrome.outlineLevels[0]}:${chrome.outlineLevels[1]}`
  const outlineHeadings = useMemo(
    () => filterHeadingsForOutline(page?.headings ?? [], chrome.outlineLevels),
    [page?.headings, outlineKey]
  )
  const showOutline = chrome.showAside && outlineHeadings.length > 0
  const pageTags = page?.tags ?? []
  const showTags =
    themeConfig.tags !== false && pageTags.length > 0 && !Boolean(page?.meta.tagIndex)
  const MdxComponent = page?.kind === 'mdx' ? page.Component : undefined
  const mdxComponents = useMemo(createMdxHeadingComponents, [routePath, MdxComponent])
  const editHref =
    chrome.showEditLink && themeConfig.editLink && page?.relativePath
      ? themeConfig.editLink.pattern.replace(/:path/g, page.relativePath)
      : undefined
  const lastUpdated = page?.lastUpdated
    ? new Date(page.lastUpdated).toLocaleDateString(site.lang, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
    : undefined
  const showPageHeader = !(chrome.isHome && chrome.hero)
  const articleClass = classNames('pp-doc', `pp-doc-${chrome.layout}`, chrome.pageClass)
  const contentClass = chrome.markdownStyles ? 'pp-doc-content' : 'pp-doc-content-plain'
  const outline = showOutline ? (
    <aside
      class={classNames('pp-outline', chrome.aside === 'left' && 'pp-outline-left')}
      aria-label={labels.onThisPage}
    >
      <div class="pp-outline-heading">{labels.onThisPage}</div>
      <nav>
        {outlineHeadings.map((heading) => (
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
  ) : null

  const closeMobileMenu = useCallback((restoreFocus = true) => {
    setMobileMenuOpen(false)
    if (restoreFocus) {
      requestAnimationFrame(() => menuButtonRef.current?.focus())
    }
  }, [])

  useEffect(() => {
    setQuery('')
    setMobileMenuOpen(false)
  }, [routePath])

  useEffect(() => {
    if (!mobileMenuOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusableSelector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'summary',
      '[tabindex]:not([tabindex="-1"])'
    ].join(',')
    const focusFirst = () => {
      const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(focusableSelector)
      focusable?.[0]?.focus()
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeMobileMenu()
        return
      }
      if (event.key !== 'Tab') return

      const focusable = Array.from(
        drawerRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? []
      ).filter((element) => !element.hasAttribute('disabled'))
      if (!focusable.length) {
        event.preventDefault()
        return
      }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    const media = window.matchMedia('(max-width: 900px)')
    const onBreakpointChange = (event: MediaQueryListEvent) => {
      if (!event.matches) closeMobileMenu(false)
    }

    requestAnimationFrame(focusFirst)
    document.addEventListener('keydown', onKeyDown)
    media.addEventListener('change', onBreakpointChange)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
      media.removeEventListener('change', onBreakpointChange)
    }
  }, [closeMobileMenu, mobileMenuOpen])

  useEffect(() => {
    if (!showOutline || !outlineHeadings.length) {
      setActiveHeading(undefined)
      return
    }
    const update = () => {
      const visible = outlineHeadings
        .map((heading) => document.getElementById(heading.id))
        .filter((el): el is HTMLElement => Boolean(el))
        .filter((el) => el.getBoundingClientRect().top <= 96)
      setActiveHeading(visible.at(-1)?.id ?? outlineHeadings[0]?.id)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [outlineHeadings, showOutline])

  return (
    <div class={classNames('pp-layout', !chrome.showNavbar && 'pp-layout-no-nav')}>
      <a class="pp-skip-link" href="#content">
        {labels.skip}
      </a>
      {chrome.showNavbar ? (
        <header class="pp-nav">
        <div class="pp-nav-inner">
          <a class="pp-title" href={withBase(site.base, '/')} aria-label={site.title}>
            <Logo
              class="pp-logo"
              label={site.title}
              src={themeConfig.logo}
              base={site.base}
            />
          </a>
          <div class="pp-nav-right">
            <div class="pp-nav-desktop">
              <nav class="pp-nav-links" aria-label={labels.navigation}>
                <NavLinks
                  items={themeConfig.nav ?? []}
                  routePath={routePath}
                  base={site.base}
                  isActive={isActive}
                  withBase={withBase}
                />
              </nav>
              {themeConfig.socialLinks?.length ? (
                <SocialLinks links={themeConfig.socialLinks} />
              ) : null}
            </div>
            {algoliaSearch && algoliaOptions ? (
              <AlgoliaSearch options={algoliaOptions} base={site.base} />
            ) : null}
            <ThemeToggle />
            <button
              ref={menuButtonRef}
              type="button"
              class="pp-menu-toggle"
              aria-label={labels.menu}
              aria-expanded={mobileMenuOpen}
              aria-controls="pp-mobile-drawer"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span aria-hidden="true" />
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </button>
          </div>
        </div>
        </header>
      ) : null}
      {chrome.showNavbar ? (
        <div class={`pp-mobile-menu${mobileMenuOpen ? ' open' : ''}`}>
          <button
            type="button"
            class="pp-mobile-overlay"
            aria-label={labels.closeMenu}
            tabIndex={-1}
            onClick={() => closeMobileMenu()}
          />
          <aside
            ref={drawerRef}
            id="pp-mobile-drawer"
            class="pp-mobile-drawer"
            aria-label={labels.menu}
            aria-hidden={!mobileMenuOpen}
            inert={!mobileMenuOpen}
          >
            <div class="pp-mobile-drawer-header">
              <strong>{labels.menu}</strong>
              <button
                type="button"
                class="pp-mobile-close"
                aria-label={labels.closeMenu}
                onClick={() => closeMobileMenu()}
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <nav class="pp-mobile-nav" aria-label={labels.navigation}>
              <NavLinks
                items={themeConfig.nav ?? []}
                routePath={routePath}
                base={site.base}
                isActive={isActive}
                withBase={withBase}
              />
            </nav>
            {themeConfig.socialLinks?.length ? (
              <SocialLinks links={themeConfig.socialLinks} />
            ) : null}
            {chrome.showSidebar ? (
              <div class="pp-mobile-docs">
                <strong>{labels.navigation}</strong>
                {localSearch ? (
                  <label class="pp-search">
                    <span>{labels.search}</span>
                    <input
                      type="search"
                      value={query}
                      placeholder={labels.filterPages}
                      onInput={(event) => setQuery((event.currentTarget as HTMLInputElement).value)}
                    />
                  </label>
                ) : null}
                {localSearch && normalizedQuery && searchResults.length > 0 ? (
                  <div class="pp-search-results" role="listbox" aria-label={labels.searchResults}>
                    {searchResults.map((result) => (
                      <a key={result.route} role="option" href={withBase(site.base, result.route)}>
                        <span>{result.title ?? result.route}</span>
                        {result.description || result.excerpt ? (
                          <small>{result.description ?? result.excerpt}</small>
                        ) : null}
                      </a>
                    ))}
                  </div>
                ) : null}
                <SidebarNav
                  groups={visibleSidebar}
                  routePath={routePath}
                  base={site.base}
                  withBase={withBase}
                  isActive={isActive}
                />
              </div>
            ) : null}
          </aside>
        </div>
      ) : null}
      <div class={`pp-body pp-body-${chrome.layout}`}>
        {chrome.showSidebar ? (
          <aside class="pp-sidebar" aria-label={labels.navigation}>
            <details class="pp-sidebar-panel" open>
              <summary>{labels.navigation}</summary>
              {localSearch ? (
                <label class="pp-search">
                  <span>{labels.search}</span>
                  <input
                    type="search"
                    value={query}
                    placeholder={labels.filterPages}
                    onInput={(event) => setQuery((event.currentTarget as HTMLInputElement).value)}
                  />
                </label>
              ) : null}
              {localSearch && normalizedQuery && searchResults.length > 0 ? (
                <div class="pp-search-results" role="listbox" aria-label={labels.searchResults}>
                  {searchResults.map((result) => (
                    <a key={result.route} role="option" href={withBase(site.base, result.route)}>
                      <span>{result.title ?? result.route}</span>
                      {result.description || result.excerpt ? (
                        <small>{result.description ?? result.excerpt}</small>
                      ) : null}
                    </a>
                  ))}
                </div>
              ) : null}
              <SidebarNav
                groups={visibleSidebar}
                routePath={routePath}
                base={site.base}
                withBase={withBase}
                isActive={isActive}
              />
            </details>
          </aside>
        ) : null}
        {chrome.aside === 'left' ? outline : null}
        <main id="content" class="pp-main" tabIndex={-1} aria-live="polite">
          <article class={articleClass}>
            {chrome.hero ? <Hero hero={chrome.hero} base={site.base} /> : null}
            {showPageHeader ? (
              <>
                <h1 class="pp-doc-title">{page?.title ?? title}</h1>
                {page?.description ? (
                  <p class="pp-doc-lead">{page.description}</p>
                ) : null}
              </>
            ) : null}
            {showTags ? (
              <ul class="pp-doc-tags" aria-label="Tags">
                {pageTags.map((tag) => (
                  <li key={tag}>
                    <a
                      class="pp-tag-chip"
                      href={withBase(site.base, tagIndexPageRoute(slugifyTagSegment(tag), locale?.prefix))}
                    >
                      {tag}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
            {chrome.features.length > 0 ? (
              <Features features={chrome.features} base={site.base} />
            ) : null}
            {MdxComponent ? (
              <div class={contentClass}>
                <MdxComponent components={mdxComponents} />
              </div>
            ) : (
              <div
                class={contentClass}
                dangerouslySetInnerHTML={{ __html: page?.kind === 'markdown' ? page.html : '' }}
              />
            )}
            {chrome.showPager && (previous || next) ? (
              <nav class="pp-pager" aria-label="Page navigation">
                {previous ? (
                  <a class="pp-pager-link previous" href={withBase(site.base, previous.link)}>
                    <span>{labels.previous}</span>
                    {previous.text}
                  </a>
                ) : (
                  <span />
                )}
                {next ? (
                  <a class="pp-pager-link next" href={withBase(site.base, next.link)}>
                    <span>{labels.next}</span>
                    {next.text}
                  </a>
                ) : null}
              </nav>
            ) : null}
            {(chrome.showLastUpdated && lastUpdated) || editHref ? (
              <footer class="pp-doc-meta">
                {chrome.showLastUpdated && lastUpdated ? (
                  <span>{labels.lastUpdated} {lastUpdated}</span>
                ) : null}
                {editHref ? (
                  <a href={editHref}>{themeConfig.editLink?.text ?? 'Edit this page'}</a>
                ) : null}
              </footer>
            ) : null}
          </article>
        </main>
        {chrome.aside !== 'left' ? outline : null}
      </div>
      {chrome.showFooter && themeConfig.footer ? (
        <footer class="pp-footer">{themeConfig.footer}</footer>
      ) : null}
    </div>
  )
}

export default Layout
