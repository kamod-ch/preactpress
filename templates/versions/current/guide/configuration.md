---
title: Configuration
description: Configure versions in PreactPress
---

# Configuration

```ts
export default defineConfig({
  versions: {
    current: "2.0",
    items: [
      { value: "2.0", label: "2.x", status: "current" },
      { value: "1.0", label: "1.x", status: "archived" },
    ],
  },
});
```
