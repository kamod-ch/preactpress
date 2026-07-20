---
title: Basic usage
layout: doc
---

# Basic usage

```ts
import { createClient } from "@acme/client";

const client = createClient({ apiKey: process.env.ACME_API_KEY! });

const users = await client.users.list({ limit: 10 });
console.log(users.length);
```
