import type { FunctionalComponent } from "preact";
import CodeSnippet from "./CodeSnippet.js";

interface HeroAction {
  text: string;
  link: string;
  theme?: "brand" | "alt";
}

interface HeroProps {
  eyebrow?: string;
  title: string;
  subtitle: string;
  actions?: HeroAction[];
  code: string;
}

const Hero: FunctionalComponent<HeroProps> = ({ eyebrow, title, subtitle, actions = [], code }) => (
  <section class="hn-hero" aria-labelledby="hero-title">
    <div class="hn-hero-glow" aria-hidden="true" />
    <div class="hn-hero-copy">
      {eyebrow ? <p class="hn-hero-eyebrow">{eyebrow}</p> : null}
      <h1 id="hero-title">{title}</h1>
      <p class="hn-hero-subtitle">{subtitle}</p>
      {actions.length > 0 ? (
        <div class="hn-hero-actions">
          {actions.map((action) => (
            <a
              class={`hn-button hn-button-${action.theme ?? "alt"}`}
              href={action.link}
              key={`${action.text}:${action.link}`}
            >
              {action.text}
            </a>
          ))}
        </div>
      ) : null}
    </div>
    <div class="hn-hero-code">
      <CodeSnippet code={code} />
    </div>
  </section>
);

export default Hero;
