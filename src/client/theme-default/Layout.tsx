import type { ComponentChildren, FunctionalComponent, JSX } from 'preact'
import type { LayoutProps } from '../types.js'
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
        <Tag id={id} {...props}>
          {children}
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
  const sidebarItems = (themeConfig.sidebar ?? []).flatMap((group) => group.items)
  const activeIndex = sidebarItems.findIndex((item) => isActive(routePath, item.link))
  const previous = activeIndex > 0 ? sidebarItems[activeIndex - 1] : undefined
  const next =
    activeIndex >= 0 && activeIndex < sidebarItems.length - 1
      ? sidebarItems[activeIndex + 1]
      : undefined
  const showOutline = themeConfig.outline !== false && Boolean(page?.headings.length)
  const MdxComponent = page?.kind === 'mdx' ? page.Component : undefined
  const mdxComponents = createMdxHeadingComponents()

  return (
    <div class="pp-layout">
      <a class="pp-skip-link" href="#content">
        Skip to content
      </a>
      <header class="pp-nav">
        <div class="pp-nav-inner">
          <a class="pp-title" href={withBase(site.base, '/')}>
            {site.title}
          </a>
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
        </div>
      </header>
      <div class="pp-body">
        <aside class="pp-sidebar" aria-label="Site navigation">
          <details class="pp-sidebar-panel" open>
            <summary>Navigation</summary>
            {(themeConfig.sidebar ?? []).map((group, gi) => (
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
          </article>
        </main>
        {showOutline ? (
          <aside class="pp-outline" aria-label="On this page">
            <div class="pp-outline-heading">On this page</div>
            <nav>
              {page?.headings.map((heading) => (
                <a
                  key={heading.id}
                  class={`level-${heading.level}`}
                  href={`#${heading.id}`}
                >
                  {heading.text}
                </a>
              ))}
            </nav>
          </aside>
        ) : null}
      </div>
    </div>
  )
}

export default Layout
