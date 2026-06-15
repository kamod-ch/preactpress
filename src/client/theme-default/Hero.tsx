import type { FunctionalComponent } from "preact";
import type { Hero as HeroConfig, ThemeableImage } from "../../shared/pageChrome.js";

interface HeroProps {
  hero: HeroConfig;
  base: string;
}

function withBase(base: string, link: string): string {
  if (
    /^(?:[a-z]+:)?\/\//i.test(link) ||
    /^(?:data|mailto|tel):/i.test(link) ||
    link.startsWith("#")
  ) {
    return link;
  }
  const b = base === "/" ? "" : base.replace(/\/$/, "");
  const l = link.startsWith("/") ? link : `/${link}`;
  return `${b}${l}`;
}

function renderImage(image: ThemeableImage | undefined, base: string) {
  if (!image) return null;
  if (typeof image === "string") {
    return <img src={withBase(base, image)} alt="" />;
  }
  if ("src" in image) {
    return <img src={withBase(base, image.src)} alt={image.alt ?? ""} />;
  }
  return (
    <picture>
      <source media="(prefers-color-scheme: dark)" srcSet={withBase(base, image.dark)} />
      <img src={withBase(base, image.light)} alt={image.alt ?? ""} />
    </picture>
  );
}

const Hero: FunctionalComponent<HeroProps> = ({ hero, base }) => (
  <section class="pp-home-hero">
    <div class="pp-home-hero-copy">
      {hero.name ? <p class="pp-home-hero-name">{hero.name}</p> : null}
      {hero.text ? <h1 class="pp-home-hero-text">{hero.text}</h1> : null}
      {hero.tagline ? <p class="pp-home-hero-tagline">{hero.tagline}</p> : null}
      {hero.actions.length > 0 ? (
        <div class="pp-home-hero-actions">
          {hero.actions.map((action) => (
            <a
              key={`${action.text}:${action.link}`}
              class={`pp-home-action pp-home-action-${action.theme}`}
              href={withBase(base, action.link)}
              target={action.target}
              rel={action.rel}
            >
              {action.text}
            </a>
          ))}
        </div>
      ) : null}
    </div>
    {hero.image ? <div class="pp-home-hero-image">{renderImage(hero.image, base)}</div> : null}
  </section>
);

export default Hero;
