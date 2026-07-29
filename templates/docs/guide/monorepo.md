# Monorepo documentation

PreactPress can aggregate documentation from multiple packages into a single site with shared navigation, per-package sidebars, and workspace-aware search.

## Configuration

```ts
import { defineConfig } from "@kamod-ch/preactpress/config";

export default defineConfig({
  workspaces: [
    {
      name: "UI",
      id: "ui",
      root: "../packages/ui",
      docs: "./docs",
    },
    {
      name: "Icons",
      id: "icons",
      root: "../packages/icons",
      docs: "./docs",
    },
    {
      name: "Hooks",
      id: "hooks",
      root: "../packages/hooks",
      docs: "./docs",
    },
  ],
});
```

Each workspace gets a route prefix (`/ui`, `/icons`, `/hooks`). Markdown files in the package `docs` folder are served under that prefix, so duplicate slugs such as `getting-started.md` in different packages do not collide.

## Features

| Feature               | Behavior                                                         |
| --------------------- | ---------------------------------------------------------------- |
| Workspace switcher    | Header dropdown with package name and version                    |
| Shared navigation     | `themeConfig.nav` applies site-wide                              |
| Sidebar per workspace | Path-prefix sidebars or `workspace.sidebar`                      |
| Search                | Shared index with `workspace` filter                             |
| Package version       | Read from each `package.json`                                    |
| Edit / source links   | Per-workspace patterns or GitHub defaults                        |
| Changelog             | Document in workspace docs or link to `CHANGELOG.md`             |
| Version mode          | `project` uses site `versions`; `package` shows package versions |

## Package manager discovery

Set `autoDiscover: true` to match workspace entries against packages from:

- `pnpm-workspace.yaml`
- npm/Yarn `workspaces` in the root `package.json`

## CLI

Run checks or builds across every documentation site in a monorepo:

```bash
preactpress workspaces check
preactpress workspaces build
```

## Example

See the bundled `templates/monorepo` example with three packages: UI, Icons, and Hooks.
