---
title: Component reference
description: Preact component props documentation with @preactpress/plugin-component-reference
---

# Component reference

Document Preact component props with static TypeScript extraction:

```md
<ComponentReference component="Button" />
```

Or with explicit source:

```mdx
<ComponentReference source="../../src/components/Button.tsx" exportName="Button" />
```

Register MDX components in your theme:

```tsx
import { createComponentReferenceComponents } from "@preactpress/plugin-component-reference/mdx";
import manifest from "../../.preactpress/component-manifest.json";
import "@preactpress/plugin-component-reference/style.css";

const mdxComponents = {
  ...createMdxHeadingComponents(...),
  ...createComponentReferenceComponents(manifest),
};
```

See the [package README](https://github.com/kamod-ch/preactpress/tree/main/packages/plugin-component-reference).
