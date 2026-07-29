import type {
  RedirectEntry,
  RedirectStatus,
  RedirectsConfig,
  ResolvedRedirect,
  ResolvedRedirects,
} from "./siteConfig.js";
import { normalizeRoute } from "../shared/route.js";
import { ConfigError } from "./configError.js";

const REDIRECT_OPTION_KEYS = new Set(["entries", "generateHtmlFallbacks", "generateRedirectsFile"]);

export interface RedirectValidationIssue {
  level: "error" | "warning";
  code: "invalid-redirect" | "redirect-loop" | "duplicate-redirect" | "redirect-collision";
  message: string;
  path?: string;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isRouteMap(value: Record<string, unknown>): boolean {
  const keys = Object.keys(value);
  if (keys.length === 0) return true;
  return (
    keys.every((key) => key.startsWith("/")) && keys.every((key) => typeof value[key] === "string")
  );
}

export function isRedirectsOptions(value: unknown): value is {
  entries?: Record<string, string> | RedirectEntry[];
  generateHtmlFallbacks?: boolean;
  generateRedirectsFile?: boolean;
} {
  if (!isPlainObject(value)) return false;
  return Object.keys(value).some((key) => REDIRECT_OPTION_KEYS.has(key));
}

/** Normalize any supported redirects config shape into raw entries plus options. */
export function parseRedirectsInput(input: RedirectsConfig | undefined): {
  entries: RedirectEntry[];
  generateHtmlFallbacks: boolean;
  generateRedirectsFile: boolean;
} {
  if (input === undefined) {
    return { entries: [], generateHtmlFallbacks: true, generateRedirectsFile: true };
  }

  if (Array.isArray(input)) {
    return { entries: input, generateHtmlFallbacks: true, generateRedirectsFile: true };
  }

  if (isRedirectsOptions(input)) {
    const entries = normalizeEntries(input.entries);
    return {
      entries,
      generateHtmlFallbacks: input.generateHtmlFallbacks ?? true,
      generateRedirectsFile: input.generateRedirectsFile ?? true,
    };
  }

  if (isPlainObject(input) && isRouteMap(input)) {
    return {
      entries: Object.entries(input).map(([from, to]) => ({ from, to: String(to) })),
      generateHtmlFallbacks: true,
      generateRedirectsFile: true,
    };
  }

  throw new ConfigError(
    'expected a route map (`{ "/from": "/to" }`), rule array, or options object with "entries"',
    "redirects",
  );
}

function normalizeEntries(
  entries: Record<string, string> | RedirectEntry[] | undefined,
): RedirectEntry[] {
  if (!entries) return [];
  if (Array.isArray(entries)) return entries;
  return Object.entries(entries).map(([from, to]) => ({ from, to }));
}

export function isExternalRedirectTarget(target: string): boolean {
  return /^(?:[a-z]+:)?\/\//i.test(target) || /^(?:mailto|tel):/i.test(target);
}

export function normalizeRedirectRoute(route: string): string {
  return normalizeRoute(route);
}

export function resolveRedirectTargetUrl(
  target: string,
  routeSet: ReadonlySet<string>,
  rulesByFrom: ReadonlyMap<string, ResolvedRedirect>,
): { target: string; external: boolean } {
  if (isExternalRedirectTarget(target)) {
    return { target, external: true };
  }

  let current = normalizeRedirectRoute(target);
  const visited = new Set<string>();

  while (rulesByFrom.has(current)) {
    if (visited.has(current)) break;
    visited.add(current);
    const nextRule = rulesByFrom.get(current)!;
    if (nextRule.external) return { target: nextRule.to, external: true };
    current = normalizeRedirectRoute(nextRule.to);
  }

  return { target: current, external: false };
}

export function resolveRedirectsConfig(
  input: RedirectsConfig | undefined,
  contentRoutes: string[] = [],
): ResolvedRedirects {
  const parsed = parseRedirectsInput(input);
  const contentRouteSet = new Set(contentRoutes.map(normalizeRedirectRoute));
  const normalizedEntries = parsed.entries.map((entry, index) => ({
    from: normalizeRedirectRoute(entry.from),
    to: entry.to.trim(),
    status: (entry.status ?? 301) as RedirectStatus,
    index,
  }));

  const seen = new Map<string, number>();
  for (const entry of normalizedEntries) {
    const previous = seen.get(entry.from);
    if (previous !== undefined) {
      throw new ConfigError(
        `duplicate redirect source "${entry.from}" (also declared at index ${previous})`,
        `redirects[${entry.index}].from`,
      );
    }
    seen.set(entry.from, entry.index);
    if (contentRouteSet.has(entry.from)) {
      throw new ConfigError(
        `redirect source "${entry.from}" conflicts with an existing content route`,
        `redirects[${entry.index}].from`,
      );
    }
    if (entry.from === normalizeRedirectRoute(entry.to)) {
      throw new ConfigError(
        `redirect from and to are identical: ${entry.from}`,
        `redirects[${entry.index}]`,
      );
    }
  }

  const rules: ResolvedRedirect[] = normalizedEntries.map((entry) => ({
    from: entry.from,
    to: entry.to,
    status: entry.status,
    external: isExternalRedirectTarget(entry.to),
    target: entry.to,
  }));

  const rulesByFrom = new Map(rules.map((rule) => [rule.from, rule]));
  const routeSet = new Set(contentRoutes.map(normalizeRedirectRoute));

  for (const rule of rules) {
    const resolved = resolveRedirectTargetUrl(rule.to, routeSet, rulesByFrom);
    rule.external = resolved.external;
    rule.target = resolved.target;
  }

  detectRedirectLoops(rules);

  return {
    rules,
    generateHtmlFallbacks: parsed.generateHtmlFallbacks,
    generateRedirectsFile: parsed.generateRedirectsFile,
    fromRoutes: new Set(rules.map((rule) => rule.from)),
  };
}

export function detectRedirectLoops(rules: ResolvedRedirect[]): void {
  const graph = new Map(rules.map((rule) => [rule.from, rule]));

  for (const rule of rules) {
    const visited = new Set<string>([rule.from]);
    let current = normalizeRedirectRoute(rule.to);
    while (graph.has(current)) {
      if (visited.has(current)) {
        throw new ConfigError(`redirect loop detected starting at ${rule.from}`, "redirects");
      }
      visited.add(current);
      const next = graph.get(current)!;
      if (next.external) break;
      current = normalizeRedirectRoute(next.to);
    }
  }
}

export function validateRedirectsForCheck(
  redirects: ResolvedRedirects,
  routeSet: ReadonlySet<string>,
): RedirectValidationIssue[] {
  const issues: RedirectValidationIssue[] = [];

  for (const rule of redirects.rules) {
    if (rule.external) continue;
    const target = normalizeRedirectRoute(rule.target);
    if (!routeSet.has(target)) {
      issues.push({
        level: "warning",
        code: "invalid-redirect",
        message: `redirect target does not exist: ${rule.from} -> ${rule.to} (${target})`,
        path: rule.from,
      });
    }
  }

  try {
    detectRedirectLoops(redirects.rules);
  } catch (err) {
    issues.push({
      level: "error",
      code: "redirect-loop",
      message: err instanceof Error ? err.message : String(err),
    });
  }

  return issues;
}

export function redirectFromRoutes(redirects: ResolvedRedirects): Set<string> {
  return redirects.fromRoutes;
}

export function filterRoutesForDiscovery(routes: string[], redirects: ResolvedRedirects): string[] {
  const excluded = redirectFromRoutes(redirects);
  return routes.filter((route) => !excluded.has(route));
}
