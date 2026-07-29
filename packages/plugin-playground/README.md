# @preactpress/plugin-playground

Live Preact code playground for [PreactPress](https://github.com/kamod-ch/preactpress) MDX documentation.

## Install

```bash
pnpm add -D @preactpress/plugin-playground
```

## Setup

```ts
import { defineConfig } from "@kamod-ch/preactpress/config";
import { playgroundPlugin } from "@preactpress/plugin-playground";

export default defineConfig({
  plugins: [playgroundPlugin()],
});
```

## MDX usage

```mdx
<Playground
  code={`
    import { useState } from 'preact/hooks'

    export default function Demo() {
      const [count, setCount] = useState(0)
      return <button onClick={() => setCount(count + 1)}>Count: {count}</button>
    }

`}
/>
```

Multi-file API:

```mdx
<Playground
  files={{
    "/App.tsx": appCode,
    "/components.tsx": componentCode,
  }}
  entry="/App.tsx"
  dependencies={{
    "@preact/signals": "2.3.2",
  }}
/>
```

## Security model

- Preview runs in a sandboxed iframe (`allow-scripts allow-modals` only)
- External packages load from a configurable CDN allowlist (default: Preact ecosystem)
- `workspace` dependencies require explicit URL mapping in plugin options
- Playground UI code is lazy-loaded only on pages that render `<Playground />`
- Invalid examples show errors inside the playground without breaking the host page

## Custom themes

```tsx
import { createPlaygroundComponents } from "@preactpress/plugin-playground/mdx";

const mdxComponents = {
  ...createMdxHeadingComponents({
    /* ... */
  }),
  ...createPlaygroundComponents({
    workspacePackages: {
      "@kamod/ui": "https://esm.sh/...",
    },
  }),
};
```

## License

MIT
