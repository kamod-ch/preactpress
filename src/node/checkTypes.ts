/** Issue category for scoring, stats, and CI filtering. */
export type CheckIssueCode =
  | "broken-link"
  | "unresolvable-link"
  | "missing-title"
  | "missing-description"
  | "invalid-frontmatter"
  | "duplicate-slug"
  | "duplicate-heading-id"
  | "orphan-page"
  | "nav-target"
  | "unreachable-page"
  | "missing-alt-text"
  | "missing-image"
  | "unknown-code-language"
  | "invalid-redirect"
  | "redirect-loop"
  | "duplicate-redirect"
  | "redirect-collision"
  | "missing-translation"
  | "canonical-conflict"
  | "external-link"
  | "config"
  | "seo"
  | "layout"
  | "draft";

export interface CheckIssue {
  level: "error" | "warning";
  message: string;
  code: CheckIssueCode;
  file?: string;
  route?: string;
}

export interface DocumentationCheckResult {
  score: number;
  errors: CheckIssue[];
  warnings: CheckIssue[];
  stats: Record<string, number>;
  routes: string[];
}

/** @deprecated Combined issue list for backward compatibility. */
export interface CheckResult extends DocumentationCheckResult {
  issues: CheckIssue[];
}

export interface CheckOptions {
  /** Treat warnings as errors for exit code and strict CI gates. */
  strict?: boolean;
  /** Verify external http(s) links (network access only when enabled). */
  external?: boolean;
  /** Output format for stdout. */
  format?: "human" | "json";
  /** Write stable JSON results to this path. */
  output?: string;
}

export function combineIssues(result: DocumentationCheckResult): CheckIssue[] {
  return [...result.errors, ...result.warnings];
}

export function computeCheckScore(errors: CheckIssue[], warnings: CheckIssue[]): number {
  const penalty = errors.length * 5 + warnings.length * 0.5;
  return Math.max(0, Math.min(100, Math.round(100 - penalty)));
}

export function buildCheckStats(
  errors: CheckIssue[],
  warnings: CheckIssue[],
): Record<string, number> {
  return {
    errors: errors.length,
    warnings: warnings.length,
    brokenLinks: countByCode([...errors, ...warnings], "broken-link"),
    orphanPages: countByCode([...errors, ...warnings], "orphan-page"),
    missingMetadata: countByCodes([...errors, ...warnings], [
      "missing-title",
      "missing-description",
    ]),
    unresolvableLinks: countByCode([...errors, ...warnings], "unresolvable-link"),
    unreachablePages: countByCode([...errors, ...warnings], "unreachable-page"),
    invalidRedirects: countByCodes([...errors, ...warnings], [
      "invalid-redirect",
      "redirect-loop",
      "duplicate-redirect",
      "redirect-collision",
    ]),
    missingTranslations: countByCode([...errors, ...warnings], "missing-translation"),
    canonicalConflicts: countByCode([...errors, ...warnings], "canonical-conflict"),
    externalLinks: countByCode([...errors, ...warnings], "external-link"),
  };
}

function countByCode(issues: CheckIssue[], code: CheckIssueCode): number {
  return issues.filter((issue) => issue.code === code).length;
}

function countByCodes(issues: CheckIssue[], codes: CheckIssueCode[]): number {
  return issues.filter((issue) => codes.includes(issue.code)).length;
}
