---
title: Pagination
description: Page through list endpoints with page and limit query parameters.
layout: doc
---

# Pagination

List endpoints return a page of results plus metadata so you can walk the full collection.

## Query parameters

| Parameter | Default | Description                          |
| --------- | ------- | ------------------------------------ |
| `page`    | `1`     | 1-based page index                   |
| `limit`   | `20`    | Page size (maximum `100`)            |

## Response shape

```json
{
  "data": [{ "id": "ctc_01HXYZ", "name": "Ada Lovelace" }],
  "page": 1,
  "limit": 20,
  "total": 42
}
```

## Example

```bash
curl "https://api.acme.dev/v1/contacts?page=2&limit=50" \
  -H "Authorization: Bearer $ACME_API_KEY"
```

When `page * limit >= total`, you have reached the last page.
