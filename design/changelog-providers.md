# Design: GitLab and Gitea changelog providers (spike)

**Status:** Spike complete — no new production providers.  
**Reference implementation:** `packages/plugin-changelog/src/providers/github.ts` (`resolveToken`, conditional fetch, cache fallback, normalization via `parseReleaseBody`).

## 1. Capability matrix

| Capability         | GitHub                            | GitLab                          | Gitea                            |
| ------------------ | --------------------------------- | ------------------------------- | -------------------------------- |
| List releases API  | `/repos/{owner}/{repo}/releases`  | `/projects/:id/releases`        | `/repos/{owner}/{repo}/releases` |
| Self-hosted base   | `api.github.com`                  | `https://gitlab.example/api/v4` | `https://gitea.example/api/v1`   |
| Auth header        | `Authorization: Bearer` / `token` | `PRIVATE-TOKEN`                 | `Authorization: token`           |
| Pagination         | `Link` header                     | `X-Total-Pages` / `page` query  | `page` + `limit`                 |
| ETag / 304         | Yes                               | `ETag` on some endpoints        | Often `Last-Modified` only       |
| Prerelease         | `prerelease` flag                 | `upcoming_release` / tag        | `prerelease` boolean             |
| Rate limit headers | `x-ratelimit-*`                   | `RateLimit-*`                   | `X-RateLimit-*`                  |

## 2. Config examples (additive)

```yaml
changelog:
  provider: gitlab
  project: "group/project"
  baseUrl: https://gitlab.com/api/v4
  tokenEnv: GITLAB_TOKEN

changelog:
  provider: gitea
  owner: org
  repo: site
  baseUrl: https://gitea.example/api/v1
  tokenEnv: GITEA_TOKEN
```

Project id for GitLab may be numeric URL-encoded path (`group%2Fproject`).

## 3. Shared adapter boundaries

| Layer             | Responsibility                                     |
| ----------------- | -------------------------------------------------- |
| `httpJson` helper | Timeouts, max bytes, SSRF-safe base URL validation |
| `paginate`        | Follow next links with hard page cap               |
| `remoteCache`     | Existing `readRemoteCache` / `writeRemoteCache`    |
| Provider mapper   | Forge JSON → `RawChangelogRelease`                 |

## 4. Errors & offline

Reuse `ChangelogOfflineError`, `ChangelogRateLimitError` from `packages/plugin-changelog/src/types/index.ts`. On 401/403 → fail with actionable message (no token logging). On network error with `offline: true` → cache hit required.

## 5. Security

- Never persist or log tokens.
- `baseUrl` must be HTTPS (except explicit `http://localhost` in tests).
- Do not forward cookies or ambient credentials to arbitrary hosts.
- Cap pagination (e.g. 20 pages) and response size (e.g. 5 MiB).

## 6. Test matrix (mocked `fetch`, temp cache dir)

| Case                  | Expect                                            |
| --------------------- | ------------------------------------------------- |
| Pagination            | merges ordered releases                           |
| 304                   | uses cache body                                   |
| 401/403               | typed error                                       |
| Rate limit            | `ChangelogRateLimitError` with reset when present |
| Stale cache + offline | serve cache                                       |
| Offline miss          | `ChangelogOfflineError`                           |
| Malformed JSON        | parse error                                       |
| Self-hosted baseUrl   | requests hit custom host only                     |
| Prerelease/draft      | mapped flags on `RawChangelogRelease`             |

## 7. Implementation order

1. Extract shared HTTP/pagination from `github.ts`.
2. GitLab provider + tests.
3. Gitea provider + tests.
4. README and manifest examples (additive fields only).

## 8. Open questions

| Item                        | Default                           |
| --------------------------- | --------------------------------- |
| GitLab `upcoming_release`   | Treat as prerelease               |
| Gitea draft releases        | Skip unless `includeDrafts: true` |
| Group-level GitLab releases | Require explicit `project` id     |

**Migration:** All new fields optional; `provider: github` remains default.
