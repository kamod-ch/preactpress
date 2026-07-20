#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "templates/saas-docs/docs",
);

const pages = {
  "welcome.md": `---
title: Welcome
layout: doc
---

# Welcome to Acme

Acme connects your team's tools into a single workspace. This documentation covers setup, administration, and developer integration.

::: tip New here?
Follow the [Quickstart](/docs/quickstart) to create a workspace and send your first API request.
:::
`,
  "quickstart.md": `---
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

\`\`\`bash
export ACME_API_KEY="sk_live_..."
\`\`\`

## 4. Verify connectivity

\`\`\`bash
curl -H "Authorization: Bearer $ACME_API_KEY" https://api.acme.dev/v1/ping
\`\`\`

![Screenshot placeholder: Acme dashboard with API keys panel](/placeholders/dashboard-api-keys.svg)

## Next steps

- [Invite team members](/docs/team-members)
- [Connect Slack](/docs/integrations)
`,
  "account.md": `---
title: Account
layout: doc
---

# Account settings

Manage profile, password, and notification preferences under **Settings → Account**.
`,
  "workspace.md": `---
title: Workspace
layout: doc
---

# Workspace

A workspace isolates data, billing, and integrations for one organization. Most teams use one workspace per company.
`,
  "team-members.md": `---
title: Team members
layout: doc
---

# Team members

**Admin only** — Invite colleagues from **Settings → Team → Invite**.

1. Enter email addresses
2. Assign a role ([Roles & permissions](/docs/roles-permissions))
3. Send invites (valid 7 days)
`,
  "roles-permissions.md": `---
title: Roles and permissions
layout: doc
---

# Roles and permissions

| Role | Manage billing | Manage integrations | View audit log |
| ---- | -------------- | ------------------- | -------------- |
| Admin | yes | yes | yes |
| Member | no | no | own actions |
| Viewer | no | no | read-only |

::: warning Admin only
Only admins can change roles or remove members.
:::
`,
  "billing.md": `---
title: Billing
layout: doc
---

# Billing

**Admin only** — View invoices and change plans under **Settings → Billing**.

Upgrade instantly; downgrades apply at period end. Contact sales for annual contracts.
`,
  "integrations.md": `---
title: Integrations
layout: doc
---

# Integrations

Connect Slack, GitHub, or custom tools via OAuth or API keys.

## Slack

1. Open **Settings → Integrations → Slack**
2. Authorize the Acme app
3. Choose notification channels

![Screenshot placeholder: Slack integration wizard](/placeholders/integration-slack.svg)
`,
  "security.md": `---
title: Security
layout: doc
---

# Security

Acme encrypts data at rest and in transit. Enable [two-factor authentication](https://help.example.com/privacy/two-factor) for all admin accounts.

SOC 2 Type II report available on Enterprise plans.
`,
  "api.md": `---
title: API
layout: doc
---

# API overview

REST API at \`https://api.acme.dev/v1\`. Authenticate with \`Authorization: Bearer <token>\`.

See the dedicated [API reference starter](https://github.com/kamod-ch/preactpress) for endpoint-level documentation patterns.
`,
  "webhooks.md": `---
title: Webhooks
layout: doc
---

# Webhooks

Register HTTPS endpoints to receive \`workspace.updated\`, \`member.invited\`, and \`integration.connected\` events.

\`\`\`json
{
  "type": "member.invited",
  "data": { "email": "alex@example.com", "role": "member" }
}
\`\`\`

Verify signatures with the signing secret from **Settings → Developers → Webhooks**.
`,
  "troubleshooting.md": `---
title: Troubleshooting
layout: doc
---

# Troubleshooting

| Issue | Fix |
| ----- | --- |
| 401 on API calls | Rotate API key; check \`Authorization\` header |
| Invites not received | Allowlist \`notifications@acme.dev\` |
| Integration disconnected | Re-authorize OAuth in **Settings → Integrations** |

Still stuck? Email [support@example.com](mailto:support@example.com) or visit [status.example.com](https://status.example.com).
`,
  "release-notes.md": `---
title: Release notes
layout: doc
---

# Release notes

## 2026-03-01 — Team roles refresh

- Added Viewer role
- Audit log export for Enterprise

## 2026-01-15 — Webhook retries

- Exponential backoff for failed webhook deliveries
`,
};

for (const [file, content] of Object.entries(pages)) {
  await fs.writeFile(path.join(root, file), content + "\n");
}
console.log("Wrote saas-docs pages");
