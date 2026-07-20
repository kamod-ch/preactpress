---
title: Quickstart
layout: doc
---

# Quickstart

Complete these steps to go from signup to a working integration.

## 1. Create an account

Sign up at [app.example.com](https://example.com) with your work email.

## 2. Create a workspace

**Admin only** — Open **Settings → Workspace → Create**. Choose a name and region.

## 3. Generate an API key

Navigate to **Settings → Developers → API keys** and copy the key.

```bash
export ACME_API_KEY="sk_live_..."
```

## 4. Verify connectivity

```bash
curl -H "Authorization: Bearer $ACME_API_KEY" https://api.acme.dev/v1/ping
```

![Screenshot placeholder: Acme dashboard with API keys panel](/placeholders/dashboard-api-keys.svg)

## Next steps

- [Invite team members](/docs/team-members)
- [Connect Slack](/docs/integrations)
