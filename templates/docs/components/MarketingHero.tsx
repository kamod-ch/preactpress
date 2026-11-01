/** @jsx h */
import { h } from "preact";

const demoVideoSrc = "/preactpress-in-30-seconds.mp4";

const actions = [
  { text: "Get started", href: "/guide/getting-started", theme: "brand" },
  { text: "View demo", href: "#interactive-demo", theme: "alt" },
  {
    text: "GitHub",
    href: "https://github.com/kamod-ch/preactpress",
    theme: "ghost",
    external: true,
  },
];

export default function MarketingHero() {
  return (
    <section class="pp-mkt-hero" aria-labelledby="preactpress-hero-title">
      <div class="pp-mkt-hero-copy">
        <p class="pp-mkt-eyebrow">PreactPress</p>
        <h1 id="preactpress-hero-title">
          The documentation framework for Preact libraries, APIs, and AI coding agents
        </h1>
        <p class="pp-mkt-hero-lead">
          Ship library docs with MDX, TypeDoc, live playgrounds, validation, and AI-ready exports —
          all static, all Preact.
        </p>
        <div class="pp-mkt-actions">
          {actions.map((action) => (
            <a
              class={`pp-mkt-button pp-mkt-button-${action.theme}`}
              href={action.href}
              key={action.text}
              rel={action.external ? "noopener noreferrer" : undefined}
              target={action.external ? "_blank" : undefined}
            >
              {action.text}
            </a>
          ))}
        </div>
      </div>
      <figure class="pp-mkt-hero-panel pp-mkt-hero-video-wrap">
        <video
          class="pp-mkt-hero-video"
          src={demoVideoSrc}
          controls
          playsInline
          preload="metadata"
          width={960}
          height={540}
        >
          Your browser does not support embedded video.{" "}
          <a href={demoVideoSrc}>Download PreactPress in 30 seconds (MP4)</a>
        </video>
        <figcaption class="pp-mkt-hero-video-caption">PreactPress in 30 seconds</figcaption>
      </figure>
    </section>
  );
}
