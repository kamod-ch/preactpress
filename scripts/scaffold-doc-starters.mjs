#!/usr/bin/env node
/**
 * Scaffolds product-docs, api-docs, and knowledge-base starter templates.
 * Run from repo root: node scripts/scaffold-doc-starters.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultPkg = JSON.parse(
  await fs.readFile(path.join(root, "templates/default/package.json"), "utf8"),
);

async function write(rel, content) {
  const file = path.join(root, rel);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, content);
}

async function copyIndexHtml(template) {
  const dest = path.join(root, `templates/${template}/index.html`);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.copyFile(path.join(root, "templates/default/index.html"), dest);
}

const pkgJson = (name) =>
  JSON.stringify({ ...defaultPkg, name: `preactpress-${name}-starter` }, null, 2) + "\n";

const readme = (title, purpose, devCmd) => `# ${title}

${purpose}

## Prerequisites

- Node.js 20+
- pnpm (recommended) or npm

## Installation

\`\`\`bash
pnpm dlx @kamod-ch/preactpress init my-site --template ${devCmd}
cd my-site
pnpm install
\`\`\`

## Development

\`\`\`bash
pnpm run dev
\`\`\`

Open **http://localhost:5173**.

## Production build

\`\`\`bash
pnpm run build
pnpm run preview
\`\`\`

## Directory structure

\`\`\`text
.preactpress/config.ts   Site and theme configuration
index.md                 Home page
**/                     Content pages (Markdown / MDX)
public/                  Static assets
\`\`\`

## Add content

Create \`.md\` or \`.mdx\` files anywhere under the content root. Wire navigation in \`.preactpress/config.ts\` under \`themeConfig.nav\` and \`themeConfig.sidebar\`.

## Branding

Edit \`site.title\`, \`site.description\`, and \`themeConfig.logo\` in \`.preactpress/config.ts\`. Colors follow the default theme CSS custom properties (\`--pp-*\`).

## Deployment

Set \`site.url\` to your production URL before building. See [Deploy guide](https://kamod-ch.github.io/preactpress/guide/deploy) in the PreactPress docs.

## PreactPress features used

- Default documentation theme with sidebar, search, and outline
- Markdown callouts, code blocks with syntax highlighting
- Static sitemap and search index
- Dark mode via theme toggle
`;

// --- product-docs ---
await copyIndexHtml("product-docs");
await write("templates/product-docs/package.json", pkgJson("product-docs"));
await write(
  "templates/product-docs/README.md",
  readme(
    "Product documentation starter",
    "Starter for documenting a software product or developer library with PreactPress.",
    "product-docs",
  ),
);

await write(
  "templates/product-docs/.preactpress/config.ts",
  `import { defineConfig } from "@kamod-ch/preactpress/config";

export default defineConfig({
  srcExclude: ["README.md", "components/**"],
  site: {
    title: "Acme SDK",
    description: "Documentation for the Acme SDK — build faster with PreactPress.",
    url: "https://example.com",
    lang: "en",
  },
  themeConfig: {
    outline: true,
    search: true,
    lastUpdated: true,
    tags: true,
    footer: "Built with PreactPress.",
    editLink: {
      pattern: "https://github.com/your-org/your-repo/edit/main/:path",
      text: "Edit this page on GitHub",
    },
    nav: [
      { text: "Docs", link: "/getting-started" },
      { text: "Changelog", link: "/changelog" },
      { text: "v2.0", link: "/getting-started" },
    ],
    sidebar: [
      {
        text: "Introduction",
        items: [
          { text: "Overview", link: "/" },
          { text: "Getting started", link: "/getting-started" },
          { text: "Installation", link: "/installation" },
          { text: "Configuration", link: "/configuration" },
        ],
      },
      {
        text: "Core concepts",
        items: [
          { text: "Architecture", link: "/concepts/architecture" },
          { text: "Data model", link: "/concepts/data-model" },
          { text: "Lifecycle", link: "/concepts/lifecycle" },
        ],
      },
      {
        text: "Features",
        items: [
          { text: "Authentication", link: "/features/authentication" },
          { text: "Webhooks", link: "/features/webhooks" },
          { text: "Batch operations", link: "/features/batch-operations" },
        ],
      },
      {
        text: "Guides",
        items: [
          { text: "First integration", link: "/guides/first-integration" },
          { text: "Error handling", link: "/guides/error-handling" },
          { text: "Performance", link: "/guides/performance" },
        ],
      },
      {
        text: "Integrations",
        items: [
          { text: "Node.js", link: "/integrations/nodejs" },
          { text: "Cloudflare Workers", link: "/integrations/cloudflare" },
        ],
      },
      {
        text: "Operations",
        items: [
          { text: "Deployment", link: "/deployment" },
          { text: "Migration from v1", link: "/migration" },
          { text: "Troubleshooting", link: "/troubleshooting" },
          { text: "FAQ", link: "/faq" },
          { text: "Changelog", link: "/changelog" },
        ],
      },
    ],
  },
  build: {
    sitemap: true,
    robots: true,
  },
});
`,
);

const productPages = {
  "index.md": `---
layout: home
title: Acme SDK
description: Build reliable integrations with the Acme SDK.
hero:
  name: Acme SDK
  text: Developer documentation
  tagline: Install, configure, and ship integrations in minutes — powered by PreactPress.
  actions:
    - theme: brand
      text: Quickstart
      link: /getting-started
    - theme: alt
      text: API reference
      link: /features/authentication
features:
  - icon: ⚡
    title: Fast setup
    details: Install with one command and run your first API call in under five minutes.
  - icon: 🔒
    title: Secure by default
    details: OAuth 2.0, scoped API keys, and webhook signature verification built in.
  - icon: 📦
    title: Typed client
    details: First-class TypeScript types for every endpoint and resource.
---

## Quick links

| Guide | Description |
| ----- | ----------- |
| [Getting started](/getting-started) | Create an account and send your first request |
| [Configuration](/configuration) | Environment variables and client options |
| [Deployment](/deployment) | Run Acme SDK in production |
| [FAQ](/faq) | Common questions from new teams |
`,
  "getting-started.md": `---
title: Getting started
description: Create an account and make your first API call with the Acme SDK.
layout: doc
---

# Getting started

This guide walks you through creating an Acme account, installing the SDK, and verifying your setup.

## Prerequisites

- Node.js 20 or later
- An Acme account ([sign up](https://example.com/signup))

## Install the SDK

\`\`\`bash
pnpm add @acme/sdk
\`\`\`

## Configure your API key

\`\`\`ts
import { createClient } from "@acme/sdk";

const client = createClient({
  apiKey: process.env.ACME_API_KEY!,
});
\`\`\`

::: tip
Store API keys in environment variables — never commit them to version control.
:::

## Verify the connection

\`\`\`ts
const { ok } = await client.ping();
console.log(ok ? "Connected" : "Failed");
\`\`\`

## Next steps

- [Configure client options](/configuration)
- [Understand the data model](/concepts/data-model)
- [Deploy to production](/deployment)
`,
  "installation.md": `---
title: Installation
layout: doc
---

# Installation

The Acme SDK supports Node.js 20+, Deno, and Cloudflare Workers.

## Node.js

\`\`\`bash
npm install @acme/sdk
# or
pnpm add @acme/sdk
\`\`\`

## Deno

\`\`\`ts
import { createClient } from "npm:@acme/sdk";
\`\`\`

## Verify the install

\`\`\`bash
node -e "import('@acme/sdk').then(m => console.log(typeof m.createClient))"
\`\`\`
`,
  "configuration.md": `---
title: Configuration
layout: doc
---

# Configuration

\`createClient\` accepts the following options:

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| \`apiKey\` | \`string\` | — | Required. Your secret API key |
| \`baseUrl\` | \`string\` | \`https://api.acme.dev\` | API base URL |
| \`timeout\` | \`number\` | \`30000\` | Request timeout in milliseconds |
| \`retries\` | \`number\` | \`3\` | Automatic retry count for transient errors |

::: warning Breaking change in v2
The \`region\` option was removed. Set \`baseUrl\` explicitly for regional endpoints.
:::
`,
  "concepts/architecture.md": `---
title: Architecture
layout: doc
---

# Architecture

The Acme SDK is a thin HTTP client over the Acme REST API. Resources map 1:1 to API endpoints.

## Layers

1. **Client** — authentication, retries, and request signing
2. **Resources** — typed methods per API resource (\`users\`, \`projects\`, \`webhooks\`)
3. **Types** — shared TypeScript interfaces generated from the OpenAPI spec
`,
  "concepts/data-model.md": `---
title: Data model
layout: doc
---

# Data model

Every Acme resource has an \`id\`, \`createdAt\`, and \`updatedAt\` timestamp. Optional fields are omitted from responses rather than returned as \`null\`.
`,
  "concepts/lifecycle.md": `---
title: Lifecycle
layout: doc
---

# Lifecycle

Resources progress through well-defined states. Webhooks notify your application when state changes occur.
`,
  "features/authentication.md": `---
title: Authentication
layout: doc
tags: [security, api]
---

# Authentication

Acme supports API keys and OAuth 2.0 client credentials for server-to-server integrations.
`,
  "features/webhooks.md": `---
title: Webhooks
layout: doc
---

# Webhooks

Register webhook endpoints to receive real-time events when resources change.
`,
  "features/batch-operations.md": `---
title: Batch operations
layout: doc
---

# Batch operations

Submit up to 100 operations in a single request with automatic partial-failure handling.
`,
  "guides/first-integration.md": `---
title: First integration
layout: doc
---

# First integration

Step-by-step guide to syncing users from your identity provider into Acme.
`,
  "guides/error-handling.md": `---
title: Error handling
layout: doc
---

# Error handling

All SDK errors extend \`AcmeError\` with a \`code\`, \`status\`, and \`requestId\` for support tickets.
`,
  "guides/performance.md": `---
title: Performance
layout: doc
---

# Performance

Use connection pooling, batch endpoints, and conditional requests (\`If-None-Match\`) to reduce latency.
`,
  "integrations/nodejs.md": `---
title: Node.js
layout: doc
---

# Node.js integration

The SDK uses native \`fetch\` on Node.js 20+. No additional HTTP adapter is required.
`,
  "integrations/cloudflare.md": `---
title: Cloudflare Workers
layout: doc
---

# Cloudflare Workers

Import \`@acme/sdk\` directly in Workers. Set \`ACME_API_KEY\` as a Worker secret.
`,
  "deployment.md": `---
title: Deployment
layout: doc
---

# Deployment

Run the SDK in staging before production. Rotate API keys using the dashboard or CLI.
`,
  "migration.md": `---
title: Migration from v1
layout: doc
---

# Migration from v1

::: warning Breaking changes
v2 renames \`listAll()\` to \`list()\` and removes the deprecated \`legacy\` namespace.
:::

Follow the [upgrade checklist](https://example.com/v2-upgrade) before deploying.
`,
  "troubleshooting.md": `---
title: Troubleshooting
layout: doc
---

# Troubleshooting

| Symptom | Likely cause | Fix |
| ------- | ------------ | --- |
| \`401 Unauthorized\` | Invalid or expired API key | Rotate the key in the dashboard |
| \`429 Too Many Requests\` | Rate limit exceeded | Back off with exponential retry |
| Timeout errors | Network or large payload | Increase \`timeout\` or use batch API |
`,
  "faq.md": `---
title: FAQ
layout: doc
---

# FAQ

## Is there a free tier?

Yes — 1,000 API calls per month on the Starter plan.

## Do you offer SLA guarantees?

Enterprise plans include 99.9% uptime SLA and dedicated support.
`,
  "changelog.md": `---
title: Changelog
layout: doc
---

# Changelog

## v2.0.0 — 2026-01-15

- Added batch operations API
- Removed deprecated \`legacy\` namespace
- Improved TypeScript types for webhooks

## v1.4.2 — 2025-11-02

- Fixed retry logic for \`503\` responses
`,
};

for (const [file, content] of Object.entries(productPages)) {
  await write(`templates/product-docs/${file}`, content + "\n");
}

await write(
  "templates/product-docs/components/PageFeedback.tsx",
  `/** @jsx h */
import { h } from "preact";
import { useState } from "preact/hooks";

export default function PageFeedback() {
  const [submitted, setSubmitted] = useState(false);
  if (submitted) {
    return <p class="pp-feedback-thanks" role="status">Thanks for your feedback.</p>;
  }
  return (
    <div class="pp-feedback" role="group" aria-label="Page feedback">
      <p>Was this page helpful?</p>
      <div class="pp-feedback-actions">
        <button type="button" onClick={() => setSubmitted(true)}>Yes</button>
        <button type="button" onClick={() => setSubmitted(true)}>No</button>
      </div>
    </div>
  );
}
`,
);

console.log("Scaffolded product-docs");

// --- api-docs ---
await copyIndexHtml("api-docs");
await write("templates/api-docs/package.json", pkgJson("api-docs"));
await write(
  "templates/api-docs/README.md",
  readme(
    "API documentation starter",
    "Reference-style starter for documenting a JavaScript or TypeScript API with PreactPress.",
    "api-docs",
  ),
);

await write(
  "templates/api-docs/.preactpress/config.ts",
  `import { defineConfig } from "@kamod-ch/preactpress/config";

export default defineConfig({
  srcExclude: ["README.md", "components/**"],
  site: {
    title: "Acme Client API",
    description: "JavaScript/TypeScript API reference for the Acme client SDK.",
    url: "https://example.com",
    lang: "en",
  },
  themeConfig: {
    outline: [2, 3],
    search: true,
    lastUpdated: true,
    footer: "Built with PreactPress.",
    editLink: {
      pattern: "https://github.com/your-org/your-repo/edit/main/:path",
    },
    nav: [
      { text: "Overview", link: "/overview" },
      { text: "Functions", link: "/functions/create-client" },
      { text: "Examples", link: "/examples/basic-usage" },
    ],
    sidebar: {
      "/functions/": [
        {
          text: "Client",
          items: [
            { text: "createClient", link: "/functions/create-client" },
            { text: "Client.ping", link: "/functions/client-ping" },
          ],
        },
        {
          text: "Resources",
          items: [
            { text: "users.list", link: "/functions/users-list" },
            { text: "users.create", link: "/functions/users-create" },
          ],
        },
      ],
      "/": [
        {
          text: "Getting started",
          items: [
            { text: "Overview", link: "/" },
            { text: "API overview", link: "/overview" },
            { text: "Installation", link: "/installation" },
            { text: "Authentication", link: "/authentication" },
            { text: "Configuration", link: "/configuration" },
          ],
        },
        {
          text: "Reference",
          items: [
            { text: "Functions", link: "/functions/create-client" },
            { text: "Components", link: "/components/provider" },
            { text: "Hooks", link: "/hooks/use-acme-client" },
            { text: "Types", link: "/types/client-options" },
          ],
        },
        {
          text: "Guides",
          items: [
            { text: "Error handling", link: "/error-handling" },
            { text: "Examples", link: "/examples/basic-usage" },
          ],
        },
      ],
    },
  },
  build: { sitemap: true, robots: true },
});
`,
);

const apiComponents = {
  "ApiSignature.tsx": `/** @jsx h */
import { h } from "preact";

type Props = { name: string; signature: string; deprecated?: boolean };

export default function ApiSignature({ name, signature, deprecated }: Props) {
  return (
    <div class={\`pp-api-signature\${deprecated ? " pp-api-signature--deprecated" : ""}\`}>
      {deprecated ? <p class="pp-api-badge">Deprecated</p> : null}
      <code class="pp-api-name">{name}</code>
      <pre class="pp-api-sig"><code>{signature}</code></pre>
    </div>
  );
}
`,
  "ParameterTable.tsx": `/** @jsx h */
import { h } from "preact";

export type Param = {
  name: string;
  type: string;
  required?: boolean;
  description: string;
  default?: string;
};

export default function ParameterTable({ params }: { params: Param[] }) {
  return (
    <div class="pp-api-table-wrap">
      <table class="pp-api-table">
        <thead>
          <tr>
            <th scope="col">Parameter</th>
            <th scope="col">Type</th>
            <th scope="col">Description</th>
          </tr>
        </thead>
        <tbody>
          {params.map((p) => (
            <tr key={p.name}>
              <td>
                <code>{p.name}</code>
                {p.required ? " *" : ""}
              </td>
              <td><code>{p.type}</code></td>
              <td>
                {p.description}
                {p.default ? <> Default: <code>{p.default}</code>.</> : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
`,
  "TypeDefinition.tsx": `/** @jsx h */
import { h } from "preact";

export default function TypeDefinition({ name, code }: { name: string; code: string }) {
  return (
    <figure class="pp-api-type">
      <figcaption><code>{name}</code></figcaption>
      <pre><code>{code}</code></pre>
    </figure>
  );
}
`,
  "CodeExample.tsx": `/** @jsx h */
import { h } from "preact";

export default function CodeExample({ title, lang, code }: { title?: string; lang: string; code: string }) {
  return (
    <figure class="pp-api-example">
      {title ? <figcaption>{title}</figcaption> : null}
      <pre><code class={\`language-\${lang}\`}>{code}</code></pre>
    </figure>
  );
}
`,
  "DeprecatedNotice.tsx": `/** @jsx h */
import { h } from "preact";

export default function DeprecatedNotice({ since, alternative }: { since: string; alternative?: string }) {
  return (
    <p class="pp-api-deprecated" role="note">
      <strong>Deprecated</strong> since {since}.
      {alternative ? <> Use <code>{alternative}</code> instead.</> : null}
    </p>
  );
}
`,
  "api-docs.css": `.pp-api-signature { margin: 1.5rem 0; padding: 1rem; border: 1px solid var(--pp-border); border-radius: 8px; background: var(--pp-code-bg); }
.pp-api-name { font-size: 1.125rem; font-weight: 600; }
.pp-api-sig { margin: 0.5rem 0 0; overflow-x: auto; }
.pp-api-badge { display: inline-block; font-size: 0.75rem; padding: 0.125rem 0.5rem; border-radius: 4px; background: var(--pp-border); margin: 0 0 0.5rem; }
.pp-api-table-wrap { overflow-x: auto; margin: 1rem 0; }
.pp-api-table { width: 100%; border-collapse: collapse; font-size: 0.9375rem; }
.pp-api-table th, .pp-api-table td { border: 1px solid var(--pp-border); padding: 0.5rem 0.75rem; text-align: left; vertical-align: top; }
.pp-api-type figcaption, .pp-api-example figcaption { font-weight: 600; margin-bottom: 0.25rem; }
.pp-api-deprecated { padding: 0.75rem 1rem; border-left: 4px solid #e6a700; background: var(--pp-sidebar-bg); margin: 1rem 0; }
`,
};

for (const [file, content] of Object.entries(apiComponents)) {
  await write(`templates/api-docs/components/${file}`, content);
}

const apiPages = {
  "index.md": `---
layout: home
title: Acme Client API
description: TypeScript API reference for the Acme JavaScript client.
hero:
  name: Acme Client
  text: API Reference
  tagline: Functions, types, hooks, and examples — documented with PreactPress.
  actions:
    - theme: brand
      text: createClient
      link: /functions/create-client
    - theme: alt
      text: Overview
      link: /overview
features:
  - icon: 📘
    title: Typed reference
    details: Every function documents parameters, return types, and error cases.
  - icon: 🔗
    title: Deep links
    details: Headings generate stable anchor IDs for sharing.
  - icon: ⚙️
    title: Extensible
    details: MDX components ready for TypeDoc or OpenAPI integration later.
---
`,
  "overview.md": `---
title: API overview
layout: doc
---

# API overview

The Acme client exposes a fluent API for users, projects, and webhooks. All methods return promises and throw typed \`AcmeError\` instances on failure.
`,
  "installation.md": `---
title: Installation
layout: doc
---

# Installation

\`\`\`bash
pnpm add @acme/client
\`\`\`
`,
  "authentication.md": `---
title: Authentication
layout: doc
---

# Authentication

Pass an API key to \`createClient\` or set \`ACME_API_KEY\` in the environment.
`,
  "configuration.md": `---
title: Configuration
layout: doc
---

# Configuration

See [\`ClientOptions\`](/types/client-options) for all supported client options.
`,
  "error-handling.md": `---
title: Error handling
layout: doc
---

# Error handling

Catch \`AcmeError\` and inspect \`error.code\`, \`error.status\`, and \`error.requestId\`.
`,
  "functions/create-client.mdx": `---
title: createClient
layout: doc
---

import ApiSignature from "../components/ApiSignature.tsx";
import ParameterTable from "../components/ParameterTable.tsx";
import TypeDefinition from "../components/TypeDefinition.tsx";
import CodeExample from "../components/CodeExample.tsx";
import "../components/api-docs.css";

# createClient

Creates an authenticated Acme API client.

<ApiSignature name="createClient" signature="createClient(options: ClientOptions): Client" />

## Parameters

<ParameterTable params={[
  { name: "apiKey", type: "string", required: true, description: "Secret API key from the Acme dashboard." },
  { name: "baseUrl", type: "string", description: "Override the API base URL.", default: "https://api.acme.dev" },
  { name: "timeout", type: "number", description: "Request timeout in ms.", default: "30000" },
]} />

## Returns

\`Client\` — an object with resource namespaces (\`users\`, \`projects\`, \`webhooks\`).

## Example

<CodeExample lang="ts" title="Basic usage" code={\`import { createClient } from "@acme/client";

const client = createClient({ apiKey: process.env.ACME_API_KEY! });
await client.ping();\`} />

## Errors

| Code | Status | When |
| ---- | ------ | ---- |
| \`invalid_api_key\` | 401 | API key is missing or revoked |
| \`rate_limited\` | 429 | Too many requests in the window |

## See also

- [\`Client.ping\`](/functions/client-ping)
- [\`ClientOptions\`](/types/client-options)
`,
  "functions/client-ping.md": `---
title: Client.ping
layout: doc
---

# Client.ping

\`\`\`ts
client.ping(): Promise<{ ok: boolean }>
\`\`\`

Verifies credentials and connectivity. Use in health checks.
`,
  "functions/users-list.md": `---
title: users.list
layout: doc
---

# users.list

\`\`\`ts
client.users.list(options?: ListOptions): Promise<User[]>
\`\`\`

Returns a paginated list of users. Pass \`cursor\` for subsequent pages.
`,
  "functions/users-create.md": `---
title: users.create
layout: doc
---

# users.create

\`\`\`ts
client.users.create(input: CreateUserInput): Promise<User>
\`\`\`

Creates a user. Email must be unique within the workspace.
`,
  "components/provider.md": `---
title: AcmeProvider
layout: doc
---

# AcmeProvider

React/Preact context provider that shares a client instance with child components.

\`\`\`tsx
<AcmeProvider client={client}>
  <Dashboard />
</AcmeProvider>
\`\`\`
`,
  "hooks/use-acme-client.md": `---
title: useAcmeClient
layout: doc
---

# useAcmeClient

\`\`\`ts
useAcmeClient(): Client
\`\`\`

Returns the client from the nearest \`AcmeProvider\`. Throws if used outside a provider.
`,
  "types/client-options.mdx": `---
title: ClientOptions
layout: doc
---

import TypeDefinition from "../components/TypeDefinition.tsx";
import "../components/api-docs.css";

# ClientOptions

<TypeDefinition name="ClientOptions" code={\`interface ClientOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  retries?: number;
}\`} />
`,
  "examples/basic-usage.md": `---
title: Basic usage
layout: doc
---

# Basic usage

\`\`\`ts
import { createClient } from "@acme/client";

const client = createClient({ apiKey: process.env.ACME_API_KEY! });

const users = await client.users.list({ limit: 10 });
console.log(users.length);
\`\`\`
`,
};

for (const [file, content] of Object.entries(apiPages)) {
  await write(`templates/api-docs/${file}`, content + "\n");
}

console.log("Scaffolded api-docs");

// --- knowledge-base ---
await copyIndexHtml("knowledge-base");
await write("templates/knowledge-base/package.json", pkgJson("knowledge-base"));
await write(
  "templates/knowledge-base/README.md",
  readme(
    "Knowledge base starter",
    "Support and help center starter with search-first UX, categories, and realistic help articles.",
    "knowledge-base",
  ),
);

await write(
  "templates/knowledge-base/index.data.ts",
  `import { createContentLoader } from "@kamod-ch/preactpress/config";
import { articleFromFrontmatter, type ArticlePost } from "@kamod-ch/preactpress/shared";

export default createContentLoader<ArticlePost[]>(["articles/**/*.md"], {
  transform(items) {
    return items
      .map((item) =>
        articleFromFrontmatter({
          route: item.route,
          url: item.url,
          title: item.title,
          description: item.description,
          tags: Array.isArray(item.frontmatter.tags)
            ? item.frontmatter.tags.filter((tag): tag is string => typeof tag === "string")
            : undefined,
          frontmatter: item.frontmatter,
        }),
      )
      .sort((a, b) => a.title.localeCompare(b.title));
  },
});
`,
);

await write(
  "templates/knowledge-base/.preactpress/config.ts",
  `import { defineConfig } from "@kamod-ch/preactpress/config";

export default defineConfig({
  srcExclude: ["README.md", "components/**"],
  site: {
    title: "Acme Help Center",
    description: "Find answers, troubleshoot issues, and contact support.",
    url: "https://help.example.com",
    lang: "en",
  },
  themeConfig: {
    outline: [2, 3],
    search: true,
    tags: true,
    footer: "© Acme — Help Center built with PreactPress.",
    nav: [
      { text: "Help", link: "/" },
      { text: "Getting started", link: "/getting-started/welcome" },
      { text: "Contact", link: "/contact" },
      { text: "Developer docs", link: "https://docs.example.com", target: "_blank" },
    ],
    sidebar: [
      {
        text: "Getting started",
        items: [
          { text: "Welcome", link: "/getting-started/welcome" },
          { text: "Create your account", link: "/getting-started/create-account" },
          { text: "Invite your team", link: "/getting-started/invite-team" },
        ],
      },
      {
        text: "Account & billing",
        items: [
          { text: "Manage subscription", link: "/account/manage-subscription" },
          { text: "Update payment method", link: "/account/payment-method" },
          { text: "Cancel account", link: "/account/cancel" },
        ],
      },
      {
        text: "Troubleshooting",
        items: [
          { text: "Login issues", link: "/troubleshooting/login-issues" },
          { text: "Sync not working", link: "/troubleshooting/sync-issues" },
          { text: "Email notifications", link: "/troubleshooting/email-notifications" },
        ],
      },
      {
        text: "Privacy & security",
        items: [
          { text: "Data retention", link: "/privacy/data-retention" },
          { text: "Two-factor authentication", link: "/privacy/two-factor" },
          { text: "Export your data", link: "/privacy/export-data" },
        ],
      },
    ],
  },
  build: { sitemap: true, robots: true },
});
`,
);

await write(
  "templates/knowledge-base/components/PageFeedback.tsx",
  `/** @jsx h */
import { h } from "preact";
import { useState } from "preact/hooks";

export default function PageFeedback() {
  const [submitted, setSubmitted] = useState(false);
  if (submitted) {
    return <p class="pp-feedback-thanks" role="status">Thanks — we use your feedback to improve these articles.</p>;
  }
  return (
    <div class="pp-feedback" role="group" aria-label="Was this article helpful?">
      <p>Was this article helpful?</p>
      <div class="pp-feedback-actions">
        <button type="button" onClick={() => setSubmitted(true)}>Yes</button>
        <button type="button" onClick={() => setSubmitted(true)}>No</button>
      </div>
      <p class="pp-feedback-cta">Still stuck? <a href="/contact">Contact support</a>.</p>
    </div>
  );
}
`,
);

const kbPages = {
  "index.mdx": `---
layout: home
title: How can we help?
description: Search the Acme Help Center for guides, troubleshooting, and account help.
sidebar: false
outline: false
---

import type { ArticlePost } from "@kamod-ch/preactpress/shared";

export const articles = (typeof page !== "undefined" && page?.meta?.contentData) as ArticlePost[] | undefined;

# How can we help?

Use the **search box** in the header to find articles by keyword.

## Popular articles

${""}
<!-- Articles loaded via content loader appear in search; list key entry points below -->

- [Welcome to Acme](/getting-started/welcome)
- [Fix login issues](/troubleshooting/login-issues)
- [Manage your subscription](/account/manage-subscription)
- [Enable two-factor authentication](/privacy/two-factor)

## Browse by category

| Category | Articles |
| -------- | -------- |
| [Getting started](/getting-started/welcome) | Account setup, invites, first project |
| [Account & billing](/account/manage-subscription) | Plans, payments, cancellation |
| [Troubleshooting](/troubleshooting/login-issues) | Login, sync, notifications |
| [Privacy & security](/privacy/two-factor) | 2FA, data export, retention |

## Popular searches

\`password reset\` · \`invite team\` · \`billing\` · \`export data\` · \`2FA\`

::: tip Developer documentation
Building an integration? See the [Acme developer docs](https://docs.example.com) — separate from this help center.
:::
`,
  "contact.md": `---
title: Contact support
layout: doc
sidebar: false
---

# Contact support

Email **support@example.com** or use in-app chat weekdays 9:00–17:00 CET.

Include your workspace ID and steps to reproduce the issue.
`,
  "getting-started/welcome.md": `---
title: Welcome to Acme
layout: doc
tags: [getting-started, popular]
---

# Welcome to Acme

Acme helps teams sync data across tools. This article covers what you need for your first successful sync.

## What you'll need

1. A verified email address
2. Admin access to the source system
3. About 10 minutes

## Related

- [Create your account](/getting-started/create-account)
- [Invite your team](/getting-started/invite-team)
`,
  "getting-started/create-account.md": `---
title: Create your account
layout: doc
tags: [getting-started, account]
---

# Create your account

1. Go to [app.example.com/signup](https://example.com/signup)
2. Enter your work email and choose a password
3. Confirm your email from the inbox link
4. Complete the onboarding wizard

::: tip
Use a shared team inbox for billing notifications if multiple admins manage the account.
:::
`,
  "getting-started/invite-team.md": `---
title: Invite your team
layout: doc
tags: [getting-started, teams]
---

# Invite your team

Open **Settings → Team members → Invite**. Each invite expires after 7 days.

Assign roles on the next screen — see [Roles in the developer docs](https://docs.example.com/roles) for permission details.
`,
  "account/manage-subscription.md": `---
title: Manage your subscription
layout: doc
tags: [billing, popular]
---

# Manage your subscription

View your plan under **Settings → Billing**. Upgrades take effect immediately; downgrades apply at the end of the billing period.
`,
  "account/payment-method.md": `---
title: Update payment method
layout: doc
tags: [billing]
---

# Update payment method

**Settings → Billing → Payment method**. We accept major credit cards and SEPA direct debit for EU customers.
`,
  "account/cancel.md": `---
title: Cancel your account
layout: doc
tags: [billing]
---

# Cancel your account

Cancel under **Settings → Billing → Cancel subscription**. Export your data first — see [Export your data](/privacy/export-data).
`,
  "troubleshooting/login-issues.md": `---
title: Fix login issues
layout: doc
tags: [troubleshooting, popular]
---

# Fix login issues

## Reset your password

1. Click **Forgot password** on the sign-in page
2. Open the email link within 30 minutes
3. Choose a new password (12+ characters recommended)

## Still locked out?

Clear site cookies for \`app.example.com\` or try a private browser window. Contact support if SSO is enabled for your workspace.
`,
  "troubleshooting/sync-issues.md": `---
title: Sync not working
layout: doc
tags: [troubleshooting]
---

# Sync not working

Check the integration status dashboard for error codes. Most sync failures are caused by expired OAuth tokens — reconnect under **Settings → Integrations**.
`,
  "troubleshooting/email-notifications.md": `---
title: Email notifications
layout: doc
tags: [troubleshooting]
---

# Email notifications

Verify notification preferences under **Settings → Notifications**. Add \`notifications@acme.dev\` to your allowlist.
`,
  "privacy/data-retention.md": `---
title: Data retention
layout: doc
tags: [privacy]
---

# Data retention

Active workspace data is retained for the life of your subscription. Deleted records are purged from backups within 30 days.
`,
  "privacy/two-factor.md": `---
title: Two-factor authentication
layout: doc
tags: [privacy, popular, security]
---

# Two-factor authentication

Enable 2FA under **Settings → Security**. We support authenticator apps and hardware security keys.
`,
  "privacy/export-data.md": `---
title: Export your data
layout: doc
tags: [privacy]
---

# Export your data

Request a JSON export from **Settings → Privacy → Export data**. Downloads are available for 72 hours.
`,
};

for (const [file, content] of Object.entries(kbPages)) {
  await write(`templates/knowledge-base/${file}`, content + "\n");
}

console.log("Scaffolded knowledge-base");
console.log("Done.");
