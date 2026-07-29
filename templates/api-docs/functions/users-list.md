---
title: users.list
description: List users through the Acme TypeScript SDK.
layout: doc
---

# users.list

```ts
client.users.list(options?: ListOptions): Promise<User[]>
```

Returns a paginated list of users. Pass `cursor` for subsequent pages.
