---
title: Troubleshooting
layout: doc
---

# Troubleshooting

| Symptom                 | Likely cause               | Fix                                 |
| ----------------------- | -------------------------- | ----------------------------------- |
| `401 Unauthorized`      | Invalid or expired API key | Rotate the key in the dashboard     |
| `429 Too Many Requests` | Rate limit exceeded        | Back off with exponential retry     |
| Timeout errors          | Network or large payload   | Increase `timeout` or use batch API |
