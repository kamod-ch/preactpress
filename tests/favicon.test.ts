import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  createFaviconMiddleware,
  defaultFaviconHead,
  faviconHeadFromConfig,
  faviconRequestPaths,
  hasFaviconHead,
  resolveFaviconHead,
} from "../src/node/favicon.js";

describe("favicon", () => {
  it("detects custom icon head tags", () => {
    expect(hasFaviconHead([])).toBe(false);
    expect(hasFaviconHead([["link", { rel: "icon", href: "/custom.ico" }]])).toBe(true);
    expect(hasFaviconHead([["link", { rel: "apple-touch-icon", href: "/a.png" }]])).toBe(true);
    expect(hasFaviconHead([["link", { rel: "canonical", href: "/" }]])).toBe(false);
  });

  it("builds base-aware default favicon links", () => {
    expect(defaultFaviconHead("/")).toEqual([
      ["link", { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" }],
      ["link", { rel: "icon", href: "/favicon-32.png", type: "image/png", sizes: "32x32" }],
      ["link", { rel: "icon", href: "/favicon.png", type: "image/png", sizes: "any" }],
      ["link", { rel: "apple-touch-icon", href: "/favicon.png" }],
    ]);
    expect(defaultFaviconHead("/docs")[0]).toEqual([
      "link",
      { rel: "icon", href: "/docs/favicon.svg", type: "image/svg+xml" },
    ]);
  });

  it("builds favicon links from convenience config", () => {
    expect(faviconHeadFromConfig("/brand/icon.svg", "/docs")).toEqual([
      ["link", { rel: "icon", href: "/docs/brand/icon.svg", type: "image/svg+xml" }],
    ]);
    expect(
      faviconHeadFromConfig(
        {
          svg: "brand/icon.svg",
          png32: "/brand/icon-32.png",
          apple: "https://cdn.example/icon.png",
        },
        "/docs",
      ),
    ).toEqual([
      ["link", { rel: "icon", href: "/docs/brand/icon.svg", type: "image/svg+xml" }],
      ["link", { rel: "icon", href: "/docs/brand/icon-32.png", type: "image/png", sizes: "32x32" }],
      ["link", { rel: "apple-touch-icon", href: "https://cdn.example/icon.png" }],
    ]);
  });

  it("lets explicit head tags override convenience and default favicons", () => {
    expect(
      resolveFaviconHead({
        base: "/docs",
        favicon: "/brand/icon.svg",
        userHead: [["link", { rel: "icon", href: "/custom.ico" }]],
      }),
    ).toEqual([]);
    expect(resolveFaviconHead({ base: "/docs", favicon: false })).toEqual([]);
  });

  it("lists dev middleware paths for each favicon file", () => {
    expect(faviconRequestPaths("/docs")).toEqual(
      new Set(["/docs/favicon.svg", "/docs/favicon.png", "/docs/favicon-32.png"]),
    );
  });

  it("serves same-name public favicons before bundled defaults in dev", async () => {
    const publicDir = await fs.mkdtemp(path.join(os.tmpdir(), "preactpress-favicon-"));
    await fs.writeFile(path.join(publicDir, "favicon.svg"), "<svg>custom</svg>", "utf8");
    const middleware = createFaviconMiddleware("/docs", publicDir);

    const body = await new Promise<string>((resolve, reject) => {
      middleware(
        { url: "/docs/favicon.svg" } as never,
        {
          statusCode: 0,
          setHeader() {},
          end(value: Buffer | string) {
            resolve(value.toString());
          },
        } as never,
        () => reject(new Error("middleware unexpectedly called next()")),
      );
    });

    await fs.rm(publicDir, { recursive: true, force: true });
    expect(body).toBe("<svg>custom</svg>");
  });
});
