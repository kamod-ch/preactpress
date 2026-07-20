---
title: Configuration
layout: doc
---

# Configuration

`createClient` accepts the following options:

| Option    | Type     | Default                | Description                                |
| --------- | -------- | ---------------------- | ------------------------------------------ |
| `apiKey`  | `string` | —                      | Required. Your secret API key              |
| `baseUrl` | `string` | `https://api.acme.dev` | API base URL                               |
| `timeout` | `number` | `30000`                | Request timeout in milliseconds            |
| `retries` | `number` | `3`                    | Automatic retry count for transient errors |

::: warning Breaking change in v2
The `region` option was removed. Set `baseUrl` explicitly for regional endpoints.
:::
