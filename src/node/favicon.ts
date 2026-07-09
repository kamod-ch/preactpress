import fs from "node:fs/promises";
import path from "node:path";
import type { Connect } from "vite";
import type { FaviconConfig, HeadTag } from "./siteConfig.js";
import { PACKAGE_ROOT } from "./packageRoot.js";

const FAVICON_DIR = path.join(PACKAGE_ROOT, "assets");
const FAVICON_FILES = ["favicon.svg", "favicon.png", "favicon-32.png"] as const;

function faviconPublicUrl(base: string, file: string): string {
  return resolveFaviconHref(base, file);
}

function isExternalHref(href: string): boolean {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(href);
}

function resolveFaviconHref(base: string, href: string): string {
  if (isExternalHref(href)) return href;
  const b = base === "/" ? "" : base.replace(/\/$/, "");
  return `${b}/${href.replace(/^\/+/, "")}`;
}

function iconType(href: string): string | undefined {
  const clean = href.split(/[?#]/)[0]?.toLowerCase() ?? "";
  if (clean.endsWith(".svg")) return "image/svg+xml";
  if (clean.endsWith(".png")) return "image/png";
  if (clean.endsWith(".ico")) return "image/x-icon";
  return undefined;
}

function singleFaviconHead(base: string, href: string): HeadTag[] {
  const resolved = resolveFaviconHref(base, href);
  return [["link", { rel: "icon", href: resolved, type: iconType(resolved) }]];
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

export function faviconHeadFromConfig(config: string | FaviconConfig, base: string): HeadTag[] {
  if (typeof config === "string") return singleFaviconHead(base, config);
  const tags: HeadTag[] = [];
  if (config.svg) {
    tags.push([
      "link",
      { rel: "icon", href: resolveFaviconHref(base, config.svg), type: "image/svg+xml" },
    ]);
  }
  if (config.ico) {
    tags.push([
      "link",
      {
        rel: "icon",
        href: resolveFaviconHref(base, config.ico),
        type: "image/x-icon",
        sizes: "any",
      },
    ]);
  }
  if (config.png32) {
    tags.push([
      "link",
      {
        rel: "icon",
        href: resolveFaviconHref(base, config.png32),
        type: "image/png",
        sizes: "32x32",
      },
    ]);
  }
  if (config.png) {
    tags.push([
      "link",
      { rel: "icon", href: resolveFaviconHref(base, config.png), type: "image/png", sizes: "any" },
    ]);
  }
  if (config.apple) {
    tags.push(["link", { rel: "apple-touch-icon", href: resolveFaviconHref(base, config.apple) }]);
  }
  if (config.manifest) {
    tags.push(["link", { rel: "manifest", href: resolveFaviconHref(base, config.manifest) }]);
  }
  if (config.maskIcon) {
    tags.push([
      "link",
      {
        rel: "mask-icon",
        href: resolveFaviconHref(base, config.maskIcon),
        color: config.maskIconColor,
      },
    ]);
  }
  return tags.length > 0 ? tags : defaultFaviconHead(base);
}

export function resolveFaviconHead(opts: {
  base: string;
  favicon?: string | FaviconConfig | false;
  userHead?: HeadTag[];
}): HeadTag[] {
  if (hasFaviconHead(opts.userHead ?? [])) return [];
  if (opts.favicon === false) return [];
  if (opts.favicon) return faviconHeadFromConfig(opts.favicon, opts.base);
  return defaultFaviconHead(opts.base);
}

export function faviconHtmlTags(tagsOrBase: HeadTag[] | string): string {
  const tags = typeof tagsOrBase === "string" ? defaultFaviconHead(tagsOrBase) : tagsOrBase;
  return tags
    .filter(
      (tag) =>
        tag[0] === "link" &&
        typeof tag[1].rel === "string" &&
        ["icon", "shortcut icon", "apple-touch-icon", "mask-icon", "manifest"].includes(tag[1].rel),
    )
    .map(([name, attrs]) => {
      const rendered = Object.entries(attrs)
        .filter(([, value]) => value != null && value !== false)
        .map(([key, value]) =>
          value === true ? key : `${key}="${String(value).replaceAll('"', "&quot;")}"`,
        )
        .join(" ");
      return `<${name}${rendered ? ` ${rendered}` : ""}>`;
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

export function createFaviconMiddleware(
  base: string,
  publicDir?: string,
): Connect.NextHandleFunction {
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
    const publicFilePath = publicDir ? path.join(publicDir, path.basename(filePath)) : undefined;
    const responsePath = publicFilePath ?? filePath;
    const ext = path.extname(responsePath);
    void fs
      .readFile(publicFilePath ?? filePath)
      .then((body) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", types[ext] ?? "application/octet-stream");
        res.setHeader("Cache-Control", "public, max-age=86400");
        res.end(body);
      })
      .catch(() => {
        if (!publicFilePath) return next();
        void fs
          .readFile(filePath)
          .then((body) => {
            res.statusCode = 200;
            res.setHeader(
              "Content-Type",
              types[path.extname(filePath)] ?? "application/octet-stream",
            );
            res.setHeader("Cache-Control", "public, max-age=86400");
            res.end(body);
          })
          .catch(() => next());
      });
  };
}
