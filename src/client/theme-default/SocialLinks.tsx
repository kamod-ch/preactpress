import type { FunctionalComponent } from 'preact'
import type { SocialLink } from '../../shared/socialIcons.js'
import { socialIconSvg, socialLinkLabel } from '../../shared/socialIcons.js'

export interface SocialLinksProps {
  links: SocialLink[]
}

const SocialLinks: FunctionalComponent<SocialLinksProps> = ({ links }) => {
  if (!links.length) return null

  return (
    <nav class="pp-social-links" aria-label="Social links">
      {links.map((item, index) => {
        const svg = socialIconSvg(item.icon)
        const label = socialLinkLabel(item.icon, item.ariaLabel)
        return (
          <a
            key={`${item.link}-${index}`}
            class="pp-social-link"
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
          >
            {svg ? (
              <span class="pp-social-icon" dangerouslySetInnerHTML={{ __html: svg }} />
            ) : (
              <span class="pp-social-icon pp-social-icon-fallback" aria-hidden="true">
                ↗
              </span>
            )}
          </a>
        )
      })}
    </nav>
  )
}

export default SocialLinks
