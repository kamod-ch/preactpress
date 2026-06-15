/** @jsx h */
import { h } from 'preact'

const references = [
  {
    name: 'PreactPress documentation',
    description: 'The public reference site you are reading now.',
    href: 'https://kamod-ch.github.io/preactpress/'
  },
  {
    name: 'Kamod UI',
    description: 'Preact + Tailwind components that can be documented and demonstrated with MDX.',
    href: 'https://ui.kamod.ch/'
  },
  {
    name: 'Kamod Hooks',
    description: 'A Preact hooks library with documentation built around the same tooling stack.',
    href: 'https://github.com/kamod-ch/kamod-hooks'
  },
  {
    name: 'Hono starter template',
    description: 'A product-and-docs starter shipped with PreactPress.',
    href: 'https://github.com/kamod-ch/preactpress/tree/main/templates/hono'
  },
  {
    name: 'More Kamod projects',
    description: 'Additional open-source projects from Kamod GmbH.',
    href: 'https://github.com/kamod-ch'
  }
]

export default function References() {
  return (
    <section class="pp-mkt-section pp-mkt-references" aria-labelledby="references-title">
      <div class="pp-mkt-section-heading">
        <p class="pp-mkt-eyebrow">References</p>
        <h2 id="references-title">Used in real Kamod projects</h2>
        <p>
          PreactPress is not only a starter. It is used across Kamod documentation and open-source
          projects.
        </p>
      </div>
      <div class="pp-mkt-reference-list">
        {references.map((reference) => (
          <a
            class="pp-mkt-reference"
            href={reference.href}
            key={reference.name}
            rel="noopener noreferrer"
            target="_blank"
          >
            <span>
              <strong>{reference.name}</strong>
              <small>{reference.description}</small>
            </span>
            <span aria-hidden="true">Open</span>
          </a>
        ))}
      </div>
    </section>
  )
}
