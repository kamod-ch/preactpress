import fs from "node:fs/promises";
import path from "node:path";
import type { Connect } from "vite";
import type { HeadTag } from "./siteConfig.js";
import { PACKAGE_ROOT } from "./packageRoot.js";

const FAVICON_DIR = path.join(PACKAGE_ROOT, "assets");
const FAVICON_FILES = ["favicon.svg", "favicon.png", "favicon-32.png"] as const;

function faviconPublicUrl(base: string, file: string): string {
  const b = base === "/" ? "" : base.replace(/\/$/, "");
  return `${b}/${file}`;
}

export function hasFaviconHead(head: HeadTag[]): boolean {
  return head.some(
    (tag) =>
      tag[0] === "link" &&
      typeof tag[1].rel === "string" &&
      (tag[1].rel === "icon" ||
        tag[1].rel === "shortcut icon" ||
        tag[1].rel === "apple-touch-icon"),
  );
}

export function defaultFaviconHead(base: string): HeadTag[] {
  const svg = faviconPublicUrl(base, "favicon.svg");
  const png32 = faviconPublicUrl(base, "favicon-32.png");
  const png = faviconPublicUrl(base, "favicon.png");
  return [
    ["link", { rel: "icon", href: svg, type: "image/svg+xml" }],
    ["link", { rel: "icon", href: png32, type: "image/png", sizes: "32x32" }],
    ["link", { rel: "icon", href: png, type: "image/png", sizes: "any" }],
    ["link", { rel: "apple-touch-icon", href: png }],
  ];
}

export function faviconHtmlTags(base: string): string {
  return defaultFaviconHead(base)
    .map(([name, attrs]) => {
      const rendered = Object.entries(attrs)
        .map(([key, value]) => `${key}="${String(value).replaceAll('"', "&quot;")}"`)
        .join(" ");
      return `<${name} ${rendered}>`;
    })
    .join("\n    ");
}

export async function copyFavicons(outDir: string): Promise<void> {
  await fs.mkdir(outDir, { recursive: true });
  for (const file of FAVICON_FILES) {
    await fs.copyFile(path.join(FAVICON_DIR, file), path.join(outDir, file));
  }
}

export function faviconRequestPaths(base: string): Set<string> {
  return new Set(FAVICON_FILES.map((file) => faviconPublicUrl(base, file)));
}

export function createFaviconMiddleware(base: string): Connect.NextHandleFunction {
  const paths = faviconRequestPaths(base);
  const byPath = new Map(
    FAVICON_FILES.map((file) => [faviconPublicUrl(base, file), path.join(FAVICON_DIR, file)]),
  );
  const types: Record<string, string> = {
    ".svg": "image/svg+xml",
    ".png": "image/png",
  };

  return (req, res, next) => {
    const url = req.url?.split("?")[0];
    if (!url || !paths.has(url)) return next();
    const filePath = byPath.get(url);
    if (!filePath) return next();
    const ext = path.extname(filePath);
    void fs
      .readFile(filePath)
      .then((body) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", types[ext] ?? "application/octet-stream");
        res.setHeader("Cache-Control", "public, max-age=86400");
        res.end(body);
      })
      .catch(() => next());
  };
}
