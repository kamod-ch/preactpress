---
title: Webhooks
description: Receive signed event payloads when contacts, conversations, or messages change.
layout: doc
---

# Webhooks

Register an HTTPS endpoint to receive real-time events from Acme.

## Configure an endpoint

1. Open [developer settings → Webhooks](https://app.example.com/settings/webhooks).
2. Add your public URL (for example `https://example.com/webhooks/acme`).
3. Copy the signing secret and verify the `Acme-Signature` header on every request.

## Event envelope

```json
{
  "id": "evt_01HXYZ",
  "type": "message.created",
  "created_at": "2026-07-28T12:00:00Z",
  "data": {
    "id": "msg_01HXYZ",
    "conversation_id": "cnv_01HXYZ"
  }
}
```

## Event types

| Type                     | Description                          |
| ------------------------ | ------------------------------------ |
| `contact.created`        | A contact was created                |
| `conversation.opened`    | A conversation became open           |
| `message.created`        | A message was sent or received       |
| `attachment.uploaded`    | A file attachment finished uploading |

Respond with `2xx` within 5 seconds. Failed deliveries are retried with exponential backoff.
