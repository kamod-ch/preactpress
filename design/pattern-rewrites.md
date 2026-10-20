# Design: parameterized route rewrites (spike)

**Status:** Spike complete — no production implementation in this document.  
**Consumers today:** `parseRedirectsInput` / `resolveRedirects` in `src/node/redirects.ts`, rewrite helpers in `src/shared/rewrites.ts`, validation in `src/node/validateUserConfig.ts`, static output in build pipeline, tests in `tests/redirects.test.ts` and `tests/rewrites.test.ts`.

## 1. User stories

| Story                | Example                                                            |
| -------------------- | ------------------------------------------------------------------ |
| Version prefix strip | `/docs/:version/*` → `/:version/*` for static hosting under `base` |
| Named segment        | `/blog/:year/:slug` → `/posts/:year/:slug.html`                    |
| Remainder capture    | `/assets/*` → `/cdn/*` preserving tail path                        |

## 2. Syntax (proposed)

- **Colon parameters:** `:name` matches one path segment (no `/`).
- **Wildcard remainder:** trailing `/*` captures zero or more segments into `:rest` (single binding).
- **Escaping:** literal colons as `\:` in static segments; backslash-escape `\` itself.
- **Rejected:** regex in config (hard to static-expand), optional segments `?:name`, and double-star `**` (use `/*` only).

## 3. Precedence (deterministic)

1. **Exact routes** (current map entries) always beat patterns.
2. Among patterns, **higher specificity** wins (more literal segments, then more `:params`, then `/*`).
3. Tie on specificity → **config declaration order** (first wins).
4. Ambiguous equal-specificity patterns targeting overlapping inputs → **build error** (`duplicate-redirect` style code).

## 4. Semantics

| Topic          | Rewrite                                                 | HTTP redirect (`redirects`)                      |
| -------------- | ------------------------------------------------------- | ------------------------------------------------ |
| Status         | Internal URL mapping at build                           | 301/302 entries in `_redirects` / HTML fallbacks |
| Query          | Preserved unless target template sets `?`               | Preserved per host rules                         |
| Encoding       | Normalize with `normalizeRoute` (`src/shared/route.ts`) | Same                                             |
| Trailing slash | Follow site `cleanUrls` / `trailingSlash`               | Same                                             |
| Base / locale  | Patterns are relative to locale root + `base`           | Same                                             |

## 5. Build / check behavior

- Expand patterns against **finite route set** from content scan (no runtime router).
- Unknown target after substitution → `preactpress check` error.
- Loop detection after substitution (reuse chain resolution in `redirects.ts`).
- `_redirects` output: only explicit redirect entries; rewrites affect path generation only.

## 6. Backward compatibility

Existing exact `from`/`to` maps unchanged. Patterns are opt-in via new `rewrites` array entries with `pattern` field (additive).

## 7. Proposed API (sketch)

```ts
type RewriteRule =
  | { from: string; to: string } // exact (today)
  | { pattern: string; to: string }; // new

function matchPattern(pattern: string, path: string): Record<string, string> | null;
function applyRewriteTemplate(to: string, params: Record<string, string>): string;
```

## 8. Test matrix (machine-translatable)

| id             | file                     | input                     | expect               |
| -------------- | ------------------------ | ------------------------- | -------------------- |
| exact-wins     | `tests/rewrites.test.ts` | exact + pattern same path | exact target         |
| ambiguous      | `tests/rewrites.test.ts` | two equal patterns        | error                |
| encoded        | `tests/rewrites.test.ts` | `%20` segment             | round-trip normalize |
| wildcard       | `tests/rewrites.test.ts` | `/a/*` → `/b/:rest`       | tail preserved       |
| loop           | `tests/rewrites.test.ts` | pattern chain             | loop error           |
| missing-target | `tests/rewrites.test.ts` | pattern → unknown route   | check error          |
| locale-base    | `tests/rewrites.test.ts` | `base` + `locales`        | scoped match         |
| perf-1k        | `tests/rewrites.test.ts` | 1k routes, 50 patterns    | < 50ms match budget  |

## 9. Performance

Precompute pattern trie sorted by specificity; match each content route once at build. Target **O(routes × patterns)** with early exit, bounded to low tens of ms for 1k routes.

## 10. Open questions

| Question                           | Recommendation                               |
| ---------------------------------- | -------------------------------------------- |
| Unify redirects + rewrites config? | Keep separate; share `normalizeRoute` only   |
| Host-specific patterns?            | Defer; static export has no per-request host |
| Case sensitivity                   | Lowercase normalize like today               |

**Rejected alternatives:** full regex, middleware hooks at runtime, Netlify-only syntax without escaping rules.
