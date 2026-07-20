---
title: AcmeProvider
layout: doc
---

# AcmeProvider

Preact context provider that shares a client instance with child components.

```tsx
<AcmeProvider client={client}>
  <Dashboard />
</AcmeProvider>
```

## Props

| Prop       | Type                | Description                           |
| ---------- | ------------------- | ------------------------------------- |
| `client`   | `Client`            | Required. Shared Acme client instance |
| `children` | `ComponentChildren` | React/Preact subtree                  |

## See also

- [`useAcmeClient`](/reference/hooks/use-acme-client)
- [`createClient`](/functions/create-client)
