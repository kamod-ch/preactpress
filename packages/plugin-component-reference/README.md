# @preactpress/plugin-component-reference

Preact-specific component props documentation for PreactPress.

## Usage

```ts
import { defineConfig } from "@kamod-ch/preactpress/config";
import { componentReferencePlugin } from "@preactpress/plugin-component-reference";

export default defineConfig({
  plugins: [
    componentReferencePlugin({
      tsconfig: "tsconfig.json",
      catalog: [
        { component: "Button", source: "src/components/Button.tsx", exportName: "Button" },
        { component: "Input", source: "src/components/Input.tsx", exportName: "Input" },
      ],
      useTypedocManifest: true,
    }),
  ],
});
```

### Markdown (build-time HTML)

```md
<ComponentReference component="Button" />
```

### MDX (theme registration)

```tsx
// .preactpress/theme/Layout.tsx
import { createComponentReferenceComponents } from "@preactpress/plugin-component-reference/mdx";
import manifest from "../../.preactpress/component-manifest.json";

const componentReference = createComponentReferenceComponents(manifest);

const mdxComponents = {
  ...createMdxHeadingComponents(...),
  ...componentReference,
};
```

```mdx
<ComponentReference component="Button" />
```

### Static extraction

```mdx
<ComponentReference source="../../src/components/Button.tsx" exportName="Button" />
```

## Architecture

| Layer        | Role                                                                  |
| ------------ | --------------------------------------------------------------------- |
| Extraction   | TypeScript compiler API (no runtime execution)                        |
| Data model   | `ComponentManifest` (`@preactpress/plugin-component-reference/types`) |
| Presentation | HTML tables + Preact MDX components                                   |

Reuses `@preactpress/plugin-typedoc` manifest data when `useTypedocManifest: true`.

## Features

- Prop tables with type, default, required, description, deprecated
- Union types, intersections, inherited HTML attributes, `ComponentChildren`
- Deep links (`#prop-variant`)
- Search tags injected via `transformPageData`
- Kamod-UI-style fixture in `fixtures/ui-kit`

## License

MIT
