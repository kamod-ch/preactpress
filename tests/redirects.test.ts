import { describe, expect, it } from "vitest";
import { ConfigError } from "../src/node/configError.js";
import {
  parseRedirectsInput,
  resolveRedirectTargetUrl,
  resolveRedirectsConfig,
} from "../src/node/redirects.js";
import { renderRedirectHtml, renderRedirectsFile } from "../src/node/redirectOutputs.js";
import type { ResolvedConfig } from "../src/node/siteConfig.js";

describe("redirects", () => {
  it("parses simple route map config", () => {
    const parsed = parseRedirectsInput({
      "/old-guide": "/guide/new-guide",
      "/api/button": "/components/button",
    });
    expect(parsed.entries).toEqual([
      { from: "/old-guide", to: "/guide/new-guide" },
      { from: "/api/button", to: "/components/button" },
    ]);
  });

  it("parses array config with status codes", () => {
    const parsed = parseRedirectsInput([
      { from: "/old-guide", to: "/guide/new-guide", status: 302 },
    ]);
    expect(parsed.entries[0].status).toBe(302);
  });

  it("parses options object config", () => {
    const resolved = resolveRedirectsConfig(
      {
        entries: {
          "/old-guide": "/guide/new-guide",
        },
        generateHtmlFallbacks: false,
        generateRedirectsFile: true,
      },
      ["/guide/new-guide"],
    );
    expect(resolved.generateHtmlFallbacks).toBe(false);
    expect(resolved.rules[0]).toMatchObject({
      from: "/old-guide",
      to: "/guide/new-guide",
      target: "/guide/new-guide",
      status: 301,
    });
  });

  it("resolves redirect chains to the final internal target", () => {
    const resolved = resolveRedirectsConfig(
      {
        "/a": "/b",
        "/b": "/c",
      },
      ["/c"],
    );
    expect(resolved.rules.find((rule) => rule.from === "/a")?.target).toBe("/c");
  });

  it("detects redirect loops", () => {
    expect(() =>
      resolveRedirectsConfig(
        {
          "/a": "/b",
          "/b": "/a",
        },
        ["/"],
      ),
    ).toThrow(ConfigError);
  });

  it("detects duplicate redirect sources", () => {
    expect(() =>
      resolveRedirectsConfig(
        [
          { from: "/dup", to: "/a" },
          { from: "/dup/", to: "/b" },
        ],
        ["/a", "/b"],
      ),
    ).toThrow(/duplicate redirect source/);
  });

  it("rejects redirect sources that collide with content routes", () => {
    expect(() => resolveRedirectsConfig({ "/guide": "/new-guide" }, ["/guide"])).toThrow(
      /conflicts with an existing content route/,
    );
  });

  it("renders platform redirect files and html fallbacks", () => {
    const site = {
      site: { base: "/", lang: "en", title: "Docs", description: "", url: "https://example.com" },
    } as ResolvedConfig;
    const rule = {
      from: "/old-guide",
      to: "/guide/new-guide",
      target: "/guide/new-guide",
      status: 301 as const,
      external: false,
    };
    expect(renderRedirectsFile([rule])).toBe("/old-guide  /guide/new-guide  301\n");
    const html = renderRedirectHtml(site, rule);
    expect(html).toContain('rel="canonical" href="https://example.com/guide/new-guide/"');
    expect(html).toContain('content="0;url=/guide/new-guide"');
    expect(html).toContain('name="robots" content="noindex"');
  });

  it("follows chained internal redirects when resolving targets", () => {
    const rulesByFrom = new Map(
      resolveRedirectsConfig({ "/a": "/b", "/b": "https://example.com" }, []).rules.map((rule) => [
        rule.from,
        rule,
      ]),
    );
    const resolved = resolveRedirectTargetUrl("/b", new Set(["/b"]), rulesByFrom);
    expect(resolved.external).toBe(true);
    expect(resolved.target).toBe("https://example.com");
  });
});
