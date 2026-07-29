---
title: useAcmeClient
description: Access the shared Acme client from Preact components.
layout: doc
---

# useAcmeClient

```ts
useAcmeClient(): Client
```

Returns the client from the nearest `AcmeProvider`. Throws if used outside a provider.

## Example

```tsx
import { useAcmeClient } from "@acme/client/preact";

function UserCount() {
  const client = useAcmeClient();
  // ...
}
```

## See also

- [`AcmeProvider`](/reference/components/provider)
