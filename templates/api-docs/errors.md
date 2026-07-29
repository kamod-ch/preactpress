---
title: Errors
description: HTTP status codes and typed error payloads returned by the Acme API.
layout: doc
---

# Errors

The API returns structured JSON errors. The TypeScript SDK throws typed `AcmeError` instances with the same fields.

## Error body

```json
{
  "error": {
    "code": "invalid_api_key",
    "message": "API key is missing or revoked",
    "request_id": "req_01HXYZ"
  }
}
```

## Common status codes

| Status | Code              | When                                      |
| ------ | ----------------- | ----------------------------------------- |
| `400`  | `bad_request`     | Invalid query or body                     |
| `401`  | `invalid_api_key` | Missing, expired, or revoked API key      |
| `404`  | `not_found`       | Resource ID does not exist                |
| `429`  | `rate_limited`    | Too many requests in the current window   |
| `500`  | `internal_error`  | Unexpected server failure — retry later   |

## SDK handling

```ts
import { AcmeError, createClient } from "@acme/client";

try {
  await createClient({ apiKey: "bad" }).users.list();
} catch (error) {
  if (error instanceof AcmeError) {
    console.error(error.code, error.status, error.requestId);
  }
}
```
