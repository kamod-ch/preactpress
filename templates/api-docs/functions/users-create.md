---
title: users.create
description: Create a user through the Acme TypeScript SDK.
layout: doc
---

# users.create

```ts
client.users.create(input: CreateUserInput): Promise<User>
```

Creates a user. Email must be unique within the workspace.
