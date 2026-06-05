import type { FunctionalComponent } from 'preact'
import type { NavItem } from '../../node/siteConfig.js'

interface NavLinksProps {
  items: NavItem[]
  routePath: string
  base: string
  isActive: (routePath: string, link: string) => boolean
  withBase: (base: string, link: string) => string
}

function navItemActive(
  routePath: string,
  item: NavItem,
  isActive: NavLinksProps['isActive']
): boolean {
  if (item.link && isActive(routePath, item.link)) return true
  return (item.items ?? []).some((child) => navItemActive(routePath, child, isActive))
}

const NavLinks: FunctionalComponent<NavLinksProps> = ({
  items,
  routePath,
  base,
  isActive,
  withBase
}) => (
  <>
    {items.map((item) => {
      if (item.items?.length) {
        const active = navItemActive(routePath, item, isActive)
        return (
          <details key={item.text} class={`pp-nav-dropdown${active ? ' active' : ''}`}>
            <summary>{item.text}</summary>
            <div class="pp-nav-dropdown-menu">
              <NavLinks
                items={item.items}
                routePath={routePath}
                base={base}
                isActive={isActive}
                withBase={withBase}
              />
            </div>
          </details>
        )
      }

      if (!item.link) return null

      const active = isActive(routePath, item.link)
      return (
        <a
          key={item.link}
          class={active ? 'active' : ''}
          href={withBase(base, item.link)}
          aria-current={active ? 'page' : undefined}
        >
          {item.text}
        </a>
      )
    })}
  </>
)

export default NavLinks
