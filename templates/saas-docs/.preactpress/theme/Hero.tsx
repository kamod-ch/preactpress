import type { FunctionalComponent } from "preact";
import WorkspacePreview from "./WorkspacePreview.js";

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
}

const Hero: FunctionalComponent<HeroProps> = ({ eyebrow, title, subtitle, actions = [] }) => (
  <section class="sd-hero" aria-labelledby="hero-title">
    <div class="sd-hero-glow" aria-hidden="true" />
    <div class="sd-hero-copy">
      {eyebrow ? <p class="sd-hero-eyebrow">{eyebrow}</p> : null}
      <h1 id="hero-title">{title}</h1>
      <p class="sd-hero-subtitle">{subtitle}</p>
      {actions.length > 0 ? (
        <div class="sd-hero-actions">
          {actions.map((action) => (
            <a
              class={`sd-button sd-button-${action.theme ?? "alt"}`}
              href={action.link}
              key={`${action.text}:${action.link}`}
            >
              {action.text}
            </a>
          ))}
        </div>
      ) : null}
    </div>
    <div class="sd-hero-code">
      <WorkspacePreview />
    </div>
  </section>
);

export default Hero;
