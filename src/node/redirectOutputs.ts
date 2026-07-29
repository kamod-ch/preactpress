import path from "node:path";
import fs from "node:fs/promises";
import type { ResolvedConfig, ResolvedRedirect, ResolvedRedirects } from "./siteConfig.js";
import { escapeAttr, escapeHtml } from "../shared/escapeHtml.js";
import { publicUrl } from "../shared/url.js";
import { absoluteUrl } from "./html.js";
import type { BuildCache } from "./buildCache.js";
import { fileExists, hashContent } from "./buildCache.js";

function routeToOutPath(route: string, cleanUrls = true): string {
  if (route === "/") return "index.html";
  const clean = route.replace(/^\//, "");
  if (cleanUrls) return path.join(clean, "index.html");
  return `${clean}.html`;
}

export interface RedirectAdapterMetadata {
  netlify: { file: "_redirects"; format: "netlify" };
  cloudflarePages: { file: "_redirects"; format: "cloudflare-pages" };
}

export interface RedirectMetadataFile {
  version: 1;
  rules: Array<{
    from: string;
    to: string;
    status: number;
    target: string;
    external: boolean;
  }>;
  adapters: RedirectAdapterMetadata;
}

function redirectDestinationUrl(site: ResolvedConfig, rule: ResolvedRedirect): string {
  if (rule.external) return rule.to;
  return publicUrl(site.site.base, rule.target === "/" ? "/" : rule.target);
}

function redirectCanonicalUrl(site: ResolvedConfig, rule: ResolvedRedirect): string {
  if (rule.external) return rule.to;
  return absoluteUrl(site, rule.target);
}

export function renderRedirectHtml(site: ResolvedConfig, rule: ResolvedRedirect): string {
  const destination = redirectDestinationUrl(site, rule);
  const canonical = redirectCanonicalUrl(site, rule);
  const safeDestination = escapeAttr(destination);
  const safeCanonical = escapeAttr(canonical);
  const title = escapeHtml(`Redirecting to ${rule.target}`);

  return `<!DOCTYPE html>
<html lang="${escapeAttr(site.site.lang)}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>${title}</title>
    <link rel="canonical" href="${safeCanonical}" />
    <meta http-equiv="refresh" content="0;url=${safeDestination}" />
    <script>location.replace(${JSON.stringify(destination)});</script>
  </head>
  <body>
    <p>Redirecting to <a href="${safeDestination}">${escapeHtml(rule.external ? rule.to : rule.target)}</a>…</p>
  </body>
</html>
`;
}

export function renderRedirectsFile(rules: ResolvedRedirect[]): string {
  return `${rules.map((rule) => `${rule.from}  ${rule.to}  ${rule.status}`).join("\n")}\n`;
}

export function renderRedirectMetadata(redirects: ResolvedRedirects): RedirectMetadataFile {
  return {
    version: 1,
    rules: redirects.rules.map((rule) => ({
      from: rule.from,
      to: rule.to,
      status: rule.status,
      target: rule.target,
      external: rule.external,
    })),
    adapters: {
      netlify: { file: "_redirects", format: "netlify" },
      cloudflarePages: { file: "_redirects", format: "cloudflare-pages" },
    },
  };
}

export async function writeRedirectOutputs(opts: {
  site: ResolvedConfig;
  previousCache: BuildCache;
  nextCache: BuildCache;
}): Promise<void> {
  const { site, previousCache, nextCache } = opts;
  const { redirects } = site;
  if (!redirects.rules.length) return;

  if (redirects.generateHtmlFallbacks) {
    for (const rule of redirects.rules) {
      const html = renderRedirectHtml(site, rule);
      const htmlPath = routeToOutPath(rule.from, site.cleanUrls);
      const htmlFile = path.join(site.outDir, htmlPath);
      const hash = hashContent({ kind: "redirect", rule, html });
      const previous = previousCache.routes[rule.from];
      const unchanged = previous?.contentHash === hash && (await fileExists(htmlFile));

      if (!unchanged) {
        await fs.mkdir(path.dirname(htmlFile), { recursive: true });
        await fs.writeFile(htmlFile, html, "utf8");
      }

      nextCache.routes[rule.from] = {
        contentHash: hash,
        htmlPath,
        mtime: new Date().toISOString(),
      };
    }
  }

  if (redirects.generateRedirectsFile) {
    await fs.writeFile(
      path.join(site.outDir, "_redirects"),
      renderRedirectsFile(redirects.rules),
      "utf8",
    );
  }

  await fs.writeFile(
    path.join(site.outDir, "preactpress-redirects.json"),
    `${JSON.stringify(renderRedirectMetadata(redirects), null, 2)}\n`,
    "utf8",
  );
}
