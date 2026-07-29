---
title: Basic usage
description: Create a client and list users with the Acme TypeScript SDK.
layout: doc
---

# Basic usage

```ts
import { createClient } from "@acme/client";

const client = createClient({ apiKey: process.env.ACME_API_KEY! });

const users = await client.users.list({ limit: 10 });
console.log(users.length);
```

See also [`createClient`](/functions/create-client) and the [Quickstart](/quickstart).
