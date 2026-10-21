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

## PreactPress monorepo

From the repository root: `pnpm run dev:saas-docs`, `pnpm run build:saas-docs`. After rebuilding the core package, link it with `node ./scripts/link-local-preactpress.mjs templates/saas-docs` ([Contributing](https://github.com/kamod-ch/preactpress/blob/main/CONTRIBUTING.md#documentation-site-templatesdocs)).

## Structure

```text
index.mdx              Product landing (workspace preview + setup paths)
docs/                  Documentation pages
.preactpress/theme/    Custom product theme (light, indigo)
```

## PreactPress features

- Custom theme with dark mode
- Step-by-step guides with callouts
- Admin role hints
- Search and sidebar navigation
- Static sitemap
