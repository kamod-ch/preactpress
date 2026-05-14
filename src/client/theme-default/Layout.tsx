import type { FunctionalComponent } from 'preact'
import type { LayoutProps } from '../types.js'
import './styles.css'

function withBase(base: string, link: string): string {
  if (/^https?:\/\//.test(link)) return link
  const b = base === '/' ? '' : base.replace(/\/$/, '')
  const l = link.startsWith('/') ? link : `/${link}`
  return `${b}${l}`
}

const Layout: FunctionalComponent<LayoutProps> = ({
  site,
  themeConfig,
  routePath,
  page
}) => {
  const title = page?.title ? `${page.title} | ${site.title}` : site.title

  return (
    <div class="pp-layout">
      <header class="pp-nav">
        <div class="pp-nav-inner">
          <a class="pp-title" href={withBase(site.base, '/')}>
            {site.title}
          </a>
          <nav class="pp-nav-links">
            {(themeConfig.nav ?? []).map((item) => (
              <a key={item.link} href={withBase(site.base, item.link)}>
                {item.text}
              </a>
            ))}
          </nav>
        </div>
      </header>
      <div class="pp-body">
        <aside class="pp-sidebar">
          {(themeConfig.sidebar ?? []).map((group, gi) => (
            <div key={gi} class="pp-sidebar-group">
              {group.text ? (
                <div class="pp-sidebar-heading">{group.text}</div>
              ) : null}
              <ul>
                {group.items.map((it) => {
                  const active =
                    routePath === it.link ||
                    (it.link !== '/' && routePath.startsWith(it.link))
                  return (
                    <li key={it.link}>
                      <a class={active ? 'active' : ''} href={withBase(site.base, it.link)}>
                        {it.text}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </aside>
        <main class="pp-main">
          <article class="pp-doc">
            <h1 class="pp-doc-title">{page?.title ?? title}</h1>
            {page?.description ? (
              <p class="pp-doc-lead">{page.description}</p>
            ) : null}
            <div
              class="pp-doc-content"
              dangerouslySetInnerHTML={{ __html: page?.html ?? '' }}
            />
          </article>
        </main>
      </div>
    </div>
  )
}

export default Layout
