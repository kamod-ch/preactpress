# Upgrading PreactPress

## 3.x (current)

- **Package:** `@kamod-ch/preactpress@3.x`
- **Preact:** 11.x (peer `>=10`; templates use Preact 11 JSX DOM types)
- **Plugins:** Optional packages under `@preactpress/plugin-*` install beside the core package. Enable them in site config per each plugin README.

### From 2.x

1. Bump `@kamod-ch/preactpress` to the latest 3.x.
2. Upgrade **Preact** and **Vite** to versions supported by your template lockfile.
3. Move optional features (TypeDoc, Mermaid, playground, OpenAPI, changelog, component reference) to official plugins instead of core-only APIs.
4. Run `pnpm run check` (or `preactpress check`) and fix config or content issues reported by stricter validation.

See [CHANGELOG.md](./CHANGELOG.md) for release-by-release notes.

## Verify after upgrade

```bash
pnpm install
pnpm run build
pnpm run check
```

For monorepos consuming plugins, run `pnpm run verify:workspace` from the PreactPress clone when developing plugins locally.
