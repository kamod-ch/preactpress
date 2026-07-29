---
title: SDKs
description: Official and community SDKs for the Acme Messaging API.
layout: doc
---

# SDKs

Use an official SDK when you want typed helpers, retries, and consistent error handling.

## TypeScript / JavaScript

```bash
pnpm add @acme/client
```

```ts
import { createClient } from "@acme/client";

const client = createClient({
  apiKey: process.env.ACME_API_KEY!,
  baseUrl: "https://api.acme.dev",
});
```

See [`createClient`](/functions/create-client) for options, return types, and examples.

## Other languages

| Language   | Package        | Status    |
| ---------- | -------------- | --------- |
| TypeScript | `@acme/client` | Official  |
| Python     | `acme-client`  | Beta      |
| Go         | `acme-go`      | Community |

Prefer raw HTTP? Start with the [REST resources](/resources) generated from the OpenAPI specification.

## Examples

- [Basic SDK usage](/examples/basic-usage)
- [REST endpoint MDX helpers](/examples/rest-endpoint)
