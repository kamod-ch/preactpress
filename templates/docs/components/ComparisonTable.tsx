/** @jsx h */
import { h } from 'preact'

const products = [
  {
    product: 'PreactPress',
    components: 'Preact + MDX',
    focus: 'Preact documentation'
  },
  {
    product: 'VitePress',
    components: 'Vue',
    focus: 'Vue documentation'
  },
  {
    product: 'Docusaurus',
    components: 'React',
    focus: 'Large documentation portals'
  },
  {
    product: 'Starlight',
    components: 'Astro',
    focus: 'Cross-framework content sites'
  }
]

export default function ComparisonTable() {
  return (
    <section class="pp-mkt-section" aria-labelledby="comparison-title">
      <div class="pp-mkt-section-heading">
        <p class="pp-mkt-eyebrow">Comparison</p>
        <h2 id="comparison-title">Pick the documentation tool that matches your stack</h2>
        <p>
          Each tool has a clear audience. PreactPress is for teams that want documentation built
          around Preact and MDX.
        </p>
      </div>
      <div class="pp-mkt-table-wrap">
        <table class="pp-mkt-table">
          <thead>
            <tr>
              <th scope="col">Product</th>
              <th scope="col">Components</th>
              <th scope="col">Best for</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.product}>
                <th scope="row">{product.product}</th>
                <td>{product.components}</td>
                <td>{product.focus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
