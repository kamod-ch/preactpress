import { defineConfig } from "@kamod-ch/preactpress/config";
import { mermaidPlugin } from "@preactpress/plugin-mermaid";
import { playgroundPlugin } from "@preactpress/plugin-playground";

const matomoImageTracker =
  '<!-- Matomo Image Tracker--><img referrerpolicy="no-referrer-when-downgrade" src="https://matomo.kamod.ch/matomo.php?idsite=6&amp;rec=1" style="border:0" alt="" /><!-- End Matomo -->';

const includeMatomoImageTracker = process.env.PREACTPRESS_INCLUDE_MATOMO === "true";

export default defineConfig({
  srcExclude: ["README.md", "partials/**", "parts/**", "dist/**"],
  ignoreDeadLinks: ["/preactpress-example.txt"],
  plugins: [mermaidPlugin(), playgroundPlugin()],
  site: {
    title: "PreactPress",
    description: "The documentation framework for Preact libraries, APIs, and AI coding agents",
    url: "https://kamod-ch.github.io/preactpress/",
  },
  ai: {
    llmsTxt: true,
    llmsFullTxt: true,
    copyMarkdown: true,
    contextIndex: true,
  },
  pageReady: {
    fallbackMs: 15000,
  },
  markdown: {
    html: false,
    emoji: true,
    math: true,
  },
  transformHtml(html) {
    if (!includeMatomoImageTracker) return html;
    return html.replace("</body>", `  ${matomoImageTracker}\n  </body>`);
  },
  themeConfig: {
    outline: true,
    search: true,
    lastUpdated: true,
    footer: "Built with PreactPress.",
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/kamod-ch/preactpress",
        ariaLabel: "PreactPress on GitHub",
      },
    ],
  },
  locales: {
    root: {
      label: "English",
      lang: "en",
      themeConfig: {
        nav: [
          { text: "Guide", link: "/guide/getting-started" },
          { text: "Reference", link: "/guide/configuration" },
          { text: "Examples", link: "/markdown-examples" },
        ],
        sidebar: [
          {
            text: "Introduction",
            items: [
              { text: "Overview", link: "/" },
              { text: "What is PreactPress?", link: "/guide/what-is-preactpress" },
              { text: "Getting started", link: "/guide/getting-started" },
              { text: "Starter templates", link: "/guide/templates" },
              { text: "Plugin & theme gallery", link: "/guide/ecosystem" },
              { text: "First five minutes", link: "/guide/first-five-minutes" },
            ],
          },
          {
            text: "Authoring",
            items: [
              { text: "Creating pages", link: "/guide/creating-pages" },
              { text: "Markdown and MDX", link: "/guide/markdown-and-mdx" },
              { text: "Routing and i18n", link: "/guide/routing" },
              { text: "Documentation versioning", link: "/guide/versioning" },
              { text: "Default theme", link: "/guide/default-theme" },
            ],
          },
          {
            text: "Reference",
            items: [
              { text: "Configuration", link: "/guide/configuration" },
              { text: "AI-ready docs", link: "/guide/ai-coding-tools" },
              { text: "Plugins", link: "/guide/plugins" },
              { text: "Plugin & theme gallery", link: "/guide/ecosystem" },
              { text: "Mermaid plugin", link: "/guide/plugin-mermaid" },
              { text: "Playground plugin", link: "/guide/plugin-playground" },
              { text: "TypeDoc plugin", link: "/guide/plugin-typedoc" },
              { text: "OpenAPI plugin", link: "/guide/plugin-openapi" },
              { text: "Component reference", link: "/guide/plugin-component-reference" },
              { text: "Changelog plugin", link: "/guide/plugin-changelog" },
              { text: "CLI and validation", link: "/guide/commands" },
              { text: "Comparison", link: "/guide/comparison" },
              { text: "Known limitations", link: "/guide/limitations" },
              { text: "Release notes", link: "/guide/release-notes" },
              { text: "Migrate from VitePress", link: "/guide/migration/vitepress" },
              { text: "Upgrade PreactPress", link: "/guide/migration/upgrading" },
              { text: "Advanced APIs", link: "/guide/advanced" },
              { text: "Content collections", link: "/guide/content-collections" },
              { text: "Custom themes", link: "/guide/custom-themes" },
              { text: "Deploy", link: "/guide/deploy" },
            ],
          },
          {
            text: "Examples",
            items: [
              { text: "Markdown examples", link: "/markdown-examples" },
              { text: "Interactive MDX", link: "/interactive" },
              { text: "Live playground", link: "/examples/playground" },
              { text: "Preact Signals", link: "/examples/preact-signals" },
              { text: "Mermaid diagrams", link: "/examples/mermaid" },
              { text: "RSS / Atom feed", link: "/examples/rss" },
              { text: "Algolia DocSearch", link: "/examples/algolia-docsearch" },
              { text: "Content loader", link: "/examples/content-loader" },
              { text: "Dynamic routes", link: "/examples/dynamic-routes" },
              { text: "Custom theme", link: "/examples/custom-theme" },
              { text: "GitHub Actions", link: "/examples/github-actions" },
              { text: "Cloudflare Pages", link: "/examples/cloudflare-pages" },
              { text: "Netlify", link: "/examples/netlify" },
              { text: "Vercel", link: "/examples/vercel" },
              { text: "S3-compatible hosts", link: "/examples/s3-deploy" },
              { text: "Own server", link: "/examples/own-server" },
              { text: "Static assets", link: "/examples/static-assets" },
            ],
          },
        ],
      },
    },
    de: {
      label: "Deutsch",
      lang: "de",
      link: "/de/",
      description: "Kleine deutschsprachige i18n-Demo für PreactPress",
      themeConfig: {
        footer: "Erstellt mit PreactPress.",
        nav: [
          { text: "Start", link: "/de" },
          { text: "Einführung", link: "/de/guide/what-is-preactpress" },
          { text: "English docs", link: "/guide/getting-started" },
        ],
        sidebar: [
          {
            text: "i18n-Demo",
            items: [
              { text: "Willkommen", link: "/de" },
              { text: "Was ist PreactPress?", link: "/de/guide/what-is-preactpress" },
              { text: "Erste Schritte", link: "/de/guide/getting-started" },
            ],
          },
        ],
      },
    },
  },
});
