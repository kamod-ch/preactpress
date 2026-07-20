# SaaS documentation starter

Product documentation for SaaS applications: landing page, onboarding guides, admin workflows, API overview, and support paths.

## Installation

```bash
pnpm dlx @kamod-ch/preactpress init my-saas-docs --template saas-docs
cd my-saas-docs
pnpm install
pnpm run dev
```

## Customize for your product

1. Replace **Acme** branding in `.preactpress/config.ts` and `index.mdx`
2. Update screenshot placeholders in `public/placeholders/`
3. Adjust sidebar groups for your feature areas
4. Link to your status page and support email in `themeConfig.footer`

## Structure

```text
index.mdx              Product landing (Hero + feature grid)
docs/                  Documentation pages
.preactpress/theme/    Custom Preact layout (from hono starter)
```

## PreactPress features

- Custom theme with dark mode
- Step-by-step guides with callouts
- Admin role hints
- Search and sidebar navigation
- Static sitemap
