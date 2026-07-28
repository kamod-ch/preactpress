import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import { generateChangelogDocs } from "../src/extract/generate.js";
import { renderChangelogDocs } from "../src/render/markdown.js";
import { renderChangelogAtomFeed } from "../src/render/rss.js";
import {
  parseKeepAChangelog,
  parseReleaseBody,
  releaseMatchesDocVersion,
} from "../src/extract/normalize.js";
import {
  ChangelogOfflineError,
  ChangelogRateLimitError,
} from "../src/types/index.js";
import githubReleases from "../fixtures/github-releases.json";

const fixtureRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../fixtures");

function mockGitHubFetch() {
  return vi.fn(async () =>
    Response.json(githubReleases, {
      headers: {
        etag: '"fixture-etag"',
        "X-RateLimit-Remaining": "59",
      },
    }),
  );
}

describe("parseKeepAChangelog", () => {
  it("parses Keep a Changelog sections with dates and categories", async () => {
    const content = await fs.readFile(path.join(fixtureRoot, "CHANGELOG.md"), "utf8");
    const releases = parseKeepAChangelog(content);
    expect(releases.map((release) => release.version)).toEqual(["2.2.1", "2.2.0", "2.1.0", "Unreleased"]);
    expect(releases[0].date).toBe("2026-07-20");
    const sections = parseReleaseBody(releases[0].body);
    expect(sections.some((section) => section.kind === "fix")).toBe(true);
    expect(sections.some((section) => section.kind === "feature")).toBe(true);
  });
});

describe("generateChangelogDocs (local provider)", () => {
  it("generates overview and release pages from CHANGELOG.md", async () => {
    const result = await generateChangelogDocs(
      { root: fixtureRoot, srcDir: fixtureRoot, cacheDir: path.join(fixtureRoot, ".cache-local") },
      { provider: "local", local: "CHANGELOG.md", route: "/changelog", cache: false },
    );

    expect(result.manifest.provider).toBe("local");
    expect(result.manifest.baseRoute).toBe("/changelog");
    expect(result.pages.some((page) => page.route === "/changelog")).toBe(true);
    expect(result.pages.some((page) => page.route === "/changelog/2-2-1")).toBe(true);

    const releasePage = result.pages.find((page) => page.route === "/changelog/2-2-0");
    expect(releasePage?.markdown).toContain("## Breaking changes");
    expect(releasePage?.markdown).toContain("Migration guide");

    const patchRelease = result.pages.find((page) => page.route === "/changelog/2-2-1");
    expect(patchRelease?.markdown).toContain("@devuser");
  });

  it("merges pending changesets when enabled", async () => {
    const result = await generateChangelogDocs(
      { root: fixtureRoot, srcDir: fixtureRoot, cacheDir: path.join(fixtureRoot, ".cache-changesets") },
      {
        provider: "local",
        local: "CHANGELOG.md",
        route: "/changelog",
        cache: false,
        changesets: { dir: "changesets" },
      },
    );

    expect(result.manifest.releases.some((release) => release.version === "Unreleased")).toBe(true);
    const pending = result.pages.find((page) => page.title === "Pending changesets");
    expect(pending?.markdown).toContain("Add changelog provider interface");
  });

  it("produces stable slugs across runs", async () => {
    const opts = { provider: "local" as const, local: "CHANGELOG.md", route: "/changelog", cache: false };
    const first = await generateChangelogDocs(
      { root: fixtureRoot, srcDir: fixtureRoot, cacheDir: path.join(fixtureRoot, ".cache-a") },
      opts,
    );
    const second = await generateChangelogDocs(
      { root: fixtureRoot, srcDir: fixtureRoot, cacheDir: path.join(fixtureRoot, ".cache-b") },
      opts,
    );
    expect(first.pages.map((page) => page.route).sort()).toEqual(second.pages.map((page) => page.route).sort());
  });
});

describe("generateChangelogDocs (github provider)", () => {
  it("maps GitHub Releases into categorized pages", async () => {
    const fetch = mockGitHubFetch();
    const result = await generateChangelogDocs(
      { root: fixtureRoot, srcDir: fixtureRoot, cacheDir: path.join(fixtureRoot, ".cache-github") },
      {
        provider: "github",
        repository: "kamod-ch/preactpress",
        route: "/changelog",
        cache: false,
        token: "test-token",
        fetch,
      } as Parameters<typeof generateChangelogDocs>[1] & { fetch: typeof fetch },
    );

    expect(fetch).toHaveBeenCalledOnce();
    expect(result.manifest.repository).toBe("kamod-ch/preactpress");
    expect(result.manifest.releases.some((release) => release.version === "2.2.1")).toBe(true);
    expect(result.manifest.releases.find((release) => release.version === "2.2.0")?.migrationGuideUrl).toContain(
      "migrate-2.2",
    );
    expect(result.manifest.releases.find((release) => release.version === "2.2.1")?.contributors).toContain(
      "maintainer",
    );
  });

  it("uses cached payload when offline", async () => {
    const cacheDir = path.join(fixtureRoot, ".cache-offline");
    const fetch = mockGitHubFetch();
    await generateChangelogDocs(
      { root: fixtureRoot, srcDir: fixtureRoot, cacheDir },
      {
        provider: "github",
        repository: "kamod-ch/preactpress",
        route: "/changelog",
        cache: true,
        token: "test-token",
        fetch,
      } as Parameters<typeof generateChangelogDocs>[1] & { fetch: typeof fetch },
    );

    const offline = await generateChangelogDocs(
      { root: fixtureRoot, srcDir: fixtureRoot, cacheDir },
      {
        provider: "github",
        repository: "kamod-ch/preactpress",
        route: "/changelog",
        offline: true,
        token: "test-token",
      },
    );

    expect(offline.manifest.releases.length).toBeGreaterThan(0);
  });

  it("throws a readable rate-limit error", async () => {
    const fetch = vi.fn(async () =>
      new Response("rate limited", {
        status: 403,
        headers: {
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.floor(Date.now() / 1000) + 3600),
        },
      }),
    );

    await expect(
      generateChangelogDocs(
        { root: fixtureRoot, srcDir: fixtureRoot, cacheDir: path.join(fixtureRoot, ".cache-rate-limit") },
        {
          provider: "github",
          repository: "kamod-ch/preactpress",
          route: "/changelog",
          cache: false,
          fetch,
        } as Parameters<typeof generateChangelogDocs>[1] & { fetch: typeof fetch },
      ),
    ).rejects.toBeInstanceOf(ChangelogRateLimitError);
  });

  it("throws offline error without cache", async () => {
    await expect(
      generateChangelogDocs(
        { root: fixtureRoot, srcDir: fixtureRoot, cacheDir: path.join(fixtureRoot, ".cache-no-remote") },
        {
          provider: "github",
          repository: "kamod-ch/preactpress",
          route: "/changelog",
          offline: true,
        },
      ),
    ).rejects.toBeInstanceOf(ChangelogOfflineError);
  });
});

describe("version integration", () => {
  it("matches releases to documentation major versions", () => {
    expect(releaseMatchesDocVersion("2.2.1", "2.0")).toBe(true);
    expect(releaseMatchesDocVersion("1.4.2", "2.0")).toBe(false);
  });

  it("generates version-scoped routes when enabled", async () => {
    const result = await generateChangelogDocs(
      {
        root: fixtureRoot,
        srcDir: fixtureRoot,
        cacheDir: path.join(fixtureRoot, ".cache-version"),
        versions: {
          enabled: true,
          current: "2.0",
          versions: [
            {
              value: "2.0",
              label: "2.x",
              prefix: "/versions/2.0",
              isCurrent: true,
              isAlias: false,
            },
          ],
        },
      },
      {
        provider: "local",
        local: "CHANGELOG.md",
        route: "/changelog",
        cache: false,
        versionIntegration: true,
      },
    );

    expect(result.pages.some((page) => page.route.startsWith("/versions/2.0/changelog/"))).toBe(true);
  });
});

describe("renderChangelogDocs", () => {
  it("re-renders pages from an existing manifest", async () => {
    const generated = await generateChangelogDocs(
      { root: fixtureRoot, srcDir: fixtureRoot, cacheDir: path.join(fixtureRoot, ".cache-rerender") },
      { provider: "local", local: "CHANGELOG.md", route: "/changelog", cache: false },
    );
    const rendered = renderChangelogDocs(generated.manifest);
    expect(rendered.pages.length).toBe(generated.pages.length);
  });
});

describe("renderChangelogAtomFeed", () => {
  it("emits Atom entries for dated releases", async () => {
    const generated = await generateChangelogDocs(
      { root: fixtureRoot, srcDir: fixtureRoot, cacheDir: path.join(fixtureRoot, ".cache-feed") },
      { provider: "local", local: "CHANGELOG.md", route: "/changelog", cache: false },
    );
    const xml = renderChangelogAtomFeed(generated.manifest, {
      siteUrl: "https://example.com",
      siteTitle: "PreactPress",
      limit: 2,
    });
    expect(xml).toContain("<feed");
    expect(xml).toContain("2.2.1");
    expect(xml).toContain("https://example.com/changelog/");
  });
});

describe("error types", () => {
  it("has stable error names", () => {
    expect(new ChangelogRateLimitError("github", "limited").name).toBe("ChangelogRateLimitError");
    expect(new ChangelogOfflineError("github", "offline").name).toBe("ChangelogOfflineError");
  });
});
