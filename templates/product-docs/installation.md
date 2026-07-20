---
title: Installation
layout: doc
---

# Installation

The Acme SDK supports Node.js 20+, Deno, and Cloudflare Workers.

## Node.js

```bash
npm install @acme/sdk
# or
pnpm add @acme/sdk
```

## Deno

```ts
import { createClient } from "npm:@acme/sdk";
```

## Verify the install

```bash
node -e "import('@acme/sdk').then(m => console.log(typeof m.createClient))"
```
