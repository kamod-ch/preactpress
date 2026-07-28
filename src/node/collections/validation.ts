import type { ZodError } from "zod";

export class CollectionValidationError extends Error {
  readonly file: string;
  readonly issues: Array<{ path: string; message: string }>;

  constructor(file: string, issues: Array<{ path: string; message: string }>) {
    const detail = issues.map((issue) => `  → ${issue.path}: ${issue.message}`).join("\n");
    super(`preactpress: Invalid frontmatter in ${file}\n${detail}`);
    this.name = "CollectionValidationError";
    this.file = file;
    this.issues = issues;
  }
}

export function formatZodError(file: string, error: ZodError): CollectionValidationError {
  const issues = error.issues.map((issue) => ({
    path: issue.path.length > 0 ? issue.path.join(".") : "(root)",
    message: issue.message,
  }));
  return new CollectionValidationError(file, issues);
}
