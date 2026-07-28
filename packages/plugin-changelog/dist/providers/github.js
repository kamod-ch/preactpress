import { ChangelogOfflineError, ChangelogRateLimitError, } from "../types/index.js";
import { readRemoteCache, writeRemoteCache } from "../extract/cache.js";
import { parseReleaseBody } from "../extract/normalize.js";
const GITHUB_API = "https://api.github.com";
function resolveToken(context) {
    return context.token ?? process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
}
function parseRateLimitReset(value) {
    if (!value)
        return undefined;
    const seconds = Number(value);
    if (!Number.isFinite(seconds))
        return undefined;
    return new Date(seconds * 1000).toISOString();
}
function formatRateLimitMessage(remaining, resetAt) {
    const parts = [
        "GitHub API rate limit exceeded.",
        remaining !== undefined ? `Remaining requests: ${remaining}.` : "",
        resetAt ? `Resets at ${resetAt}.` : "",
        "Set GITHUB_TOKEN (or pass `token` in plugin options) for higher limits, or build with cached data using `offline: true`.",
    ];
    return parts.filter(Boolean).join(" ");
}
function mapGitHubRelease(release) {
    const body = release.body ?? "";
    const sections = parseReleaseBody(body);
    const contributors = new Set();
    if (release.author?.login)
        contributors.add(release.author.login);
    for (const section of sections) {
        for (const item of section.items) {
            if (item.author)
                contributors.add(item.author);
        }
    }
    return {
        version: release.tag_name.replace(/^v/, ""),
        title: release.name,
        date: release.published_at,
        body,
        sourceUrl: release.html_url,
        draft: release.draft,
        prerelease: release.prerelease,
        contributors: [...contributors],
    };
}
async function fetchGitHubReleases(context, repository) {
    const fetchFn = context.fetch ?? fetch;
    const token = resolveToken(context);
    const cacheKey = `releases:${repository}`;
    const remoteCacheDir = `${context.cacheDir}/remote-cache`;
    if (context.offline) {
        const cached = await readRemoteCache(remoteCacheDir, "github", cacheKey);
        if (cached)
            return cached.payload;
        throw new ChangelogOfflineError("github", `Offline build requested but no cached GitHub releases found for ${repository}. Run a online build first.`);
    }
    const headers = {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "preactpress-plugin-changelog",
    };
    if (token)
        headers.Authorization = `Bearer ${token}`;
    const cached = await readRemoteCache(remoteCacheDir, "github", cacheKey);
    if (cached?.etag)
        headers["If-None-Match"] = cached.etag;
    const url = `${GITHUB_API}/repos/${repository}/releases?per_page=100`;
    let response;
    try {
        response = await fetchFn(url, { headers });
    }
    catch (error) {
        if (cached)
            return cached.payload;
        throw new ChangelogOfflineError("github", `Failed to fetch GitHub releases for ${repository}. ${error instanceof Error ? error.message : String(error)}`, { cause: error });
    }
    const remaining = response.headers.get("X-RateLimit-Remaining");
    const resetAt = parseRateLimitReset(response.headers.get("X-RateLimit-Reset"));
    const remainingNum = remaining !== null ? Number(remaining) : undefined;
    if (response.status === 403 && remainingNum === 0) {
        if (cached)
            return cached.payload;
        throw new ChangelogRateLimitError("github", formatRateLimitMessage(remainingNum, resetAt), {
            resetAt,
            remaining: remainingNum,
        });
    }
    if (response.status === 304 && cached) {
        return cached.payload;
    }
    if (!response.ok) {
        if (cached)
            return cached.payload;
        if (response.status === 403) {
            throw new ChangelogRateLimitError("github", formatRateLimitMessage(remainingNum, resetAt), { resetAt, remaining: remainingNum });
        }
        throw new Error(`changelogPlugin: GitHub API ${response.status} ${response.statusText} for ${repository}`);
    }
    const payload = (await response.json());
    const etag = response.headers.get("etag") ?? undefined;
    await writeRemoteCache(remoteCacheDir, "github", cacheKey, {
        sourceHash: cacheKey,
        etag,
        payload,
    });
    return payload;
}
export const githubChangelogProvider = {
    id: "github",
    async computeSourceHash(context) {
        const repository = context.repository;
        if (!repository) {
            throw new Error("changelogPlugin: `repository` is required for the github provider.");
        }
        const token = resolveToken(context);
        return `github:${repository}:${token ? "auth" : "anon"}`;
    },
    async fetchRawReleases(context) {
        const repository = context.repository;
        if (!repository) {
            throw new Error("changelogPlugin: `repository` is required for the github provider.");
        }
        const releases = await fetchGitHubReleases(context, repository);
        return releases
            .filter((release) => !release.draft)
            .map(mapGitHubRelease);
    },
};
//# sourceMappingURL=github.js.map