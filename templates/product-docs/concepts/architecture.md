---
title: Architecture
layout: doc
---

# Architecture

The Acme SDK is a thin HTTP client over the Acme REST API. Resources map 1:1 to API endpoints.

## Layers

1. **Client** — authentication, retries, and request signing
2. **Resources** — typed methods per API resource (`users`, `projects`, `webhooks`)
3. **Types** — shared TypeScript interfaces generated from the OpenAPI spec
