export { check } from "./documentationCheck.js";
export {
  formatCheckJson,
  printCheckResult,
  printDocumentationCheckResult,
  resolveCheckExitCode,
  runCheckCommand,
  writeCheckOutput,
} from "./checkOutput.js";
export type {
  CheckIssue,
  CheckIssueCode,
  CheckOptions,
  CheckResult,
  DocumentationCheckResult,
} from "./checkTypes.js";
