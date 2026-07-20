---
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

```bash
pnpm add @acme/sdk
```

## Configure your API key

```ts
import { createClient } from "@acme/sdk";

const client = createClient({
  apiKey: process.env.ACME_API_KEY!,
});
```

::: tip
Store API keys in environment variables — never commit them to version control.
:::

## Verify the connection

```ts
const { ok } = await client.ping();
console.log(ok ? "Connected" : "Failed");
```

## Next steps

- [Configure client options](/configuration)
- [Understand the data model](/concepts/data-model)
- [Deploy to production](/deployment)
