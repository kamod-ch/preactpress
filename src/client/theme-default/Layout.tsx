import type { ComponentChildren, FunctionalComponent, JSX } from 'preact'
import { useEffect, useMemo, useState } from 'preact/hooks'
import type { LayoutProps } from '../types.js'
import { slugifyTagSegment, tagIndexPageRoute } from '../../shared/tags.js'
import { slugifySegment } from '../../shared/slug.js'
import { filterHeadingsForOutline, resolvePageChrome } from '../../shared/pageChrome.js'
import { useSiteSearch } from '../useSiteSearch.js'
import Features from './Features.js'
import Hero from './Hero.js'
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

function classNames(...values: Array<string | undefined | false>): string {
  return values.filter(Boolean).join(' ')
}

function labelsForLang(lang: string) {
  return lang.toLowerCase().startsWith('de')
    ? {
        skip: 'Zum Inhalt springen',
        navigation: 'Navigation',
        search: 'Suche',
        filterPages: 'Seiten filtern',
        searchResults: 'Suchergebnisse',
        previous: 'Zurück',
        next: 'Weiter',
        lastUpdated: 'Zuletzt aktualisiert',
        onThisPage: 'Auf dieser Seite',
        language: 'Sprache'
      }
    : {
        skip: 'Skip to content',
        navigation: 'Navigation',
        search: 'Search',
        filterPages: 'Filter pages',
        searchResults: 'Search results',
        previous: 'Previous',
        next: 'Next',
        lastUpdated: 'Last updated',
        onThisPage: 'On this page',
        language: 'Language'
      }
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
  locale,
  locales = [],
  localizeRoute
}) => {
  const title = page?.title ? `${page.title} | ${site.title}` : site.title
  const labels = labelsForLang(site.lang)
  const [query, setQuery] = useState('')
  const [activeHeading, setActiveHeading] = useState<string | undefined>()
  const sidebarItems = (themeConfig.sidebar ?? []).flatMap((group) => group.items)
  const normalizedQuery = query.trim().toLowerCase()
  const searchResults = useSiteSearch(site.base, query, locale?.key)
  const visibleSidebar = useMemo(() => {
    if (!normalizedQuery || searchResults.length > 0) return themeConfig.sidebar ?? []
    return (themeConfig.sidebar ?? [])
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => item.text.toLowerCase().includes(normalizedQuery))
      }))
      .filter((group) => group.items.length > 0)
  }, [normalizedQuery, searchResults.length, themeConfig.sidebar])
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

  useEffect(() => {
    setQuery('')
  }, [routePath])

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
            {locales.length > 1 && localizeRoute ? (
              <details class="pp-locale-switcher">
                <summary>{locale?.label ?? labels.language}</summary>
                <div class="pp-locale-menu">
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
      ) : null}
      <div class={`pp-body pp-body-${chrome.layout}`}>
        {chrome.showSidebar ? (
          <aside class="pp-sidebar" aria-label={labels.navigation}>
            <details class="pp-sidebar-panel" open>
              <summary>{labels.navigation}</summary>
              {themeConfig.search ? (
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
              {themeConfig.search && normalizedQuery && searchResults.length > 0 ? (
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
