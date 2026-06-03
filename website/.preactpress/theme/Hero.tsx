import type { FunctionalComponent } from 'preact'

const Hero: FunctionalComponent = () => (
  <section class="pp-hero" aria-labelledby="hero-title">
    <div class="pp-hero-glow" aria-hidden="true" />
    <div class="pp-hero-inner">
      <p class="pp-hero-badge">
        <span aria-hidden="true">⚡</span>
        <span>NEW V0.1 RELEASE</span>
      </p>
      <h1 id="hero-title" class="pp-hero-title">
        <span>PreactPress — Vite &amp; Preact Powered</span>
        <strong>Static Site Generator</strong>
      </h1>
      <p class="pp-hero-lead">
        Markdown to beautiful docs in minutes. Fast, lightweight, and developer-focused.
        Experience the velocity of Vite with the efficiency of Preact.
      </p>
      <div class="pp-hero-actions">
        <a class="pp-button pp-button-primary" href="/guide/getting-started">
          Get Started
        </a>
        <a class="pp-button pp-button-secondary" href="https://github.com/your-org/preactpress">
          <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M12 .5A11.5 11.5 0 0 0 .5 12.28c0 5.2 3.35 9.6 8 11.16.58.11.8-.26.8-.57l-.02-2.24c-3.25.72-3.94-1.42-3.94-1.42-.54-1.39-1.31-1.76-1.31-1.76-1.07-.75.08-.73.08-.73 1.18.08 1.8 1.25 1.8 1.25 1.05 1.84 2.76 1.31 3.44 1 .11-.78.41-1.31.75-1.61-2.6-.31-5.33-1.34-5.33-5.94 0-1.31.45-2.38 1.2-3.22-.12-.31-.52-1.56.12-3.18 0 0 .99-.33 3.22 1.23.94-.27 1.94-.4 2.94-.4s2 .13 2.94.4c2.23-1.56 3.22-1.23 3.22-1.23.64 1.62.24 2.87.12 3.18.75.84 1.2 1.91 1.2 3.22 0 4.62-2.73 5.63-5.34 5.93.42.38.8 1.12.8 2.25l-.01 3.33c0 .31.21.69.8.57a11.76 11.76 0 0 0 7.99-11.16A11.5 11.5 0 0 0 12 .5Z" />
          </svg>
          GitHub
        </a>
      </div>
    </div>
  </section>
)

export default Hero
