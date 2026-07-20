---
title: Webhooks
layout: doc
---

# Webhooks

Register HTTPS endpoints to receive `workspace.updated`, `member.invited`, and `integration.connected` events.

```json
{
  "type": "member.invited",
  "data": { "email": "alex@example.com", "role": "member" }
}
```

Verify signatures with the signing secret from **Settings → Developers → Webhooks**.
