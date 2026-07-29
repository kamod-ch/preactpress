---
title: Authentication
description: Authenticate REST and SDK requests with a bearer API key.
layout: doc
---

# Authentication

All API requests require a bearer token issued from the Acme dashboard.

## REST

```bash
curl https://api.acme.dev/v1/contacts \
  -H "Authorization: Bearer $ACME_API_KEY"
```

## TypeScript SDK

Pass an API key to `createClient`, or set `ACME_API_KEY` in the environment:

```ts
import { createClient } from "@acme/client";

const client = createClient({ apiKey: process.env.ACME_API_KEY! });
```

Rotate compromised keys immediately in [developer settings](https://app.example.com/settings/developers). Never embed secret keys in client-side code.
