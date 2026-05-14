export interface CheckIssue {
    level: 'error' | 'warning';
    message: string;
}
export interface CheckResult {
    issues: CheckIssue[];
    routes: string[];
}
export declare function check(root?: string): Promise<CheckResult>;
export declare function printCheckResult(result: CheckResult): void;
//# sourceMappingURL=check.d.ts.map