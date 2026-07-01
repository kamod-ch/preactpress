---
title: Preact Signals
description: Use @preact/signals in MDX components and custom PreactPress themes.
tags:
  - examples
  - mdx
---

PreactPress is built on Preact, so you can use `@preact/signals` in MDX components and custom themes.

Install Signals in your site project:

```sh
pnpm add @preact/signals
```

## Component example

Create a normal Preact component:

```tsx [components/SignalCounter.tsx]
import { signal } from "@preact/signals";

const count = signal(0);

export default function SignalCounter() {
  return (
    <button type="button" onClick={() => count.value++}>
      Count: {count}
    </button>
  );
}
```

Then import it from an MDX page:

```mdx [interactive.mdx]
import SignalCounter from "./components/SignalCounter";

# Signals demo

<SignalCounter />
```

## Derived values

Use `computed` for derived state:

```tsx
import { computed, signal } from "@preact/signals";

const count = signal(0);
const doubled = computed(() => count.value * 2);

export default function DoubledCounter() {
  return (
    <div>
      <button type="button" onClick={() => count.value++}>
        Count: {count}
      </button>
      <p>Doubled: {doubled}</p>
    </div>
  );
}
```

## Custom theme usage

Signals also work inside a custom theme:

```tsx [.preactpress/theme/Layout.tsx]
import type { FunctionalComponent } from "preact";
import { signal } from "@preact/signals";
import type { LayoutProps } from "@kamod-ch/preactpress/client";

const menuOpen = signal(false);

const Layout: FunctionalComponent<LayoutProps> = ({ site, page }) => (
  <div>
    <header>
      <a href="/">{site.title}</a>
      <button type="button" onClick={() => (menuOpen.value = !menuOpen.value)}>
        Menu
      </button>
    </header>

    {menuOpen.value ? <nav>Navigation…</nav> : null}

    <main id="content">
      {page?.kind === "markdown" ? (
        <article dangerouslySetInnerHTML={{ __html: page.html }} />
      ) : page?.kind === "mdx" ? (
        <page.Component />
      ) : null}
    </main>
  </div>
);

export default Layout;
```

No special PreactPress configuration is required beyond installing `@preact/signals`.
