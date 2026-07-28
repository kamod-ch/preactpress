/** Stable manifest schema version. */
export const CHANGELOG_MANIFEST_VERSION = 1;
export class ChangelogRateLimitError extends Error {
    provider;
    resetAt;
    remaining;
    constructor(provider, message, options) {
        super(message, options);
        this.name = "ChangelogRateLimitError";
        this.provider = provider;
        this.resetAt = options?.resetAt;
        this.remaining = options?.remaining;
    }
}
export class ChangelogOfflineError extends Error {
    provider;
    constructor(provider, message, options) {
        super(message, options);
        this.name = "ChangelogOfflineError";
        this.provider = provider;
    }
}
//# sourceMappingURL=index.js.map