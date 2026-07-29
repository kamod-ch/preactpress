---
title: Playground plugin
description: Official @preactpress/plugin-playground for live Preact MDX examples
---

# Playground plugin

PreactPress ships live code playgrounds as an official plugin: `@preactpress/plugin-playground`.

```ts
import { defineConfig } from "@kamod-ch/preactpress/config";
import { playgroundPlugin } from "@preactpress/plugin-playground";

export default defineConfig({
  plugins: [playgroundPlugin()],
});
```

MDX:

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

## Features

- Isolated iframe sandbox (`sandbox="allow-scripts allow-modals"`)
- No React dependency — Preact only
- Lazy-loaded editor UI on pages that use `<Playground />`
- Static HTML fallback for SSR and no-JS environments
- Dependency allowlist with optional workspace URL mapping
- TypeScript/TSX transpilation via Sucrase inside the sandbox
- Multi-file virtual modules, reset/copy controls, StackBlitz export

See the [live showcase](/examples/playground) and the [package README](https://github.com/kamod-ch/preactpress/tree/main/packages/plugin-playground).
