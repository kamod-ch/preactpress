---
title: Quickstart
description: Create an API key and make your first authenticated request in minutes.
layout: doc
---

# Quickstart

Follow these steps to send your first request to the Acme Messaging API.

## 1. Create an API key

Open [developer settings](https://app.example.com/settings/developers) and create a secret API key. Store it in an environment variable:

```bash
export ACME_API_KEY=sk_live_...
```

## 2. Call the REST API

```bash
curl https://api.acme.dev/v1/contacts \
  -H "Authorization: Bearer $ACME_API_KEY" \
  -H "Accept: application/json"
```

## 3. Or use the TypeScript SDK

```bash
pnpm add @acme/client
```

```ts
import { createClient } from "@acme/client";

const client = createClient({ apiKey: process.env.ACME_API_KEY! });
const contacts = await client.users.list();
console.log(contacts);
```

## Next steps

- [Authentication](/authentication)
- [Pagination](/pagination)
- [Contacts resource](/resources/tags/contacts)
- [`createClient` reference](/functions/create-client)
