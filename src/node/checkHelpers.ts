import path from "node:path";
import { fileHrefToRoute } from "./content.js";
import { normalizeRoute } from "../shared/route.js";

const MARKDOWN_LINK_RE = /(?<!!)\[([^\]]*)]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const HTML_HREF_RE = /\bhref=["']([^"']+)["']/g;
const MARKDOWN_IMAGE_RE = /!\[([^\]]*)]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const HTML_IMG_RE = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
const HTML_IMG_ALT_RE = /<img\b[^>]*\balt=["']([^"']*)["'][^>]*>/i;
const FENCE_OPEN_RE = /^ {0,3}(`{3,}|~{3,})(.*)$/;
const H1_RE = /^ {0,3}#\s+(.+?)\s*#*\s*$/;
const CUSTOM_HEADING_ID_RE = /\s*\{#([\w-]+)\}\s*$/;

const CODE_LANG_ALIASES: Record<string, string> = {
  ts: "typescript",
  js: "javascript",
  md: "markdown",
  sh: "bash",
  shell: "bash",
  yml: "yaml",
  text: "plaintext",
  txt: "plaintext",
};

const KNOWN_CODE_LANGUAGES = new Set([
  "plaintext",
  "typescript",
  "javascript",
  "json",
  "markdown",
  "bash",
  "yaml",
  "html",
  "css",
  "tsx",
  "jsx",
  "python",
  "py",
  "rust",
  "go",
  "sql",
  "xml",
  "svg",
  "diff",
  "mermaid",
  "vue",
  "toml",
  "ini",
  "php",
  "ruby",
  "java",
  "csharp",
  "docker",
  "dockerfile",
  "graphql",
  "wasm",
  "svelte",
  "scss",
  "less",
  "jsonc",
  "json5",
  "powershell",
  "kotlin",
  "swift",
  "dart",
  "lua",
  "r",
  "c",
  "cpp",
  "h",
  "hpp",
  "makefile",
  "nginx",
  "apache",
  "http",
  "shell",
  "sh",
  "ts",
  "js",
  "md",
  "yml",
  "txt",
  "text",
]);

export function extractMarkdownLinks(raw: string): string[] {
  const links: string[] = [];
  for (const match of raw.matchAll(MARKDOWN_LINK_RE)) links.push(match[2]);
  for (const match of raw.matchAll(HTML_HREF_RE)) links.push(match[1]);
  return links;
}

export function extractExternalLinks(raw: string): string[] {
  return extractMarkdownLinks(raw).filter((href) => isExternalHref(href));
}

export function extractMarkdownImages(raw: string): Array<{ alt: string; src: string }> {
  const images: Array<{ alt: string; src: string }> = [];
  for (const match of raw.matchAll(MARKDOWN_IMAGE_RE)) {
    images.push({ alt: match[1], src: match[2] });
  }
  for (const match of raw.matchAll(HTML_IMG_RE)) {
    const tag = match[0];
    const altMatch = tag.match(HTML_IMG_ALT_RE);
    images.push({ alt: altMatch?.[1] ?? "", src: match[1] });
  }
  return images;
}

export function extractCodeFenceLanguages(raw: string): Array<{ line: number; lang: string }> {
  const fences: Array<{ line: number; lang: string }> = [];
  const lines = raw.split(/\r?\n/);
  let inFence = false;
  let fenceMarker = "";

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const open = line.match(FENCE_OPEN_RE);
    if (open) {
      const marker = open[1][0];
      if (!inFence) {
        inFence = true;
        fenceMarker = marker;
        fences.push({ line: index + 1, lang: parseFenceLang(open[2] || "") });
      } else if (marker === fenceMarker) {
        inFence = false;
        fenceMarker = "";
      }
    }
  }

  return fences;
}

export function parseFenceLang(info: string): string {
  const trimmed = info.trim();
  if (!trimmed) return "plaintext";
  const match = trimmed.match(/^([\w+#.-]+)(?:\s|$)/);
  return (match?.[1] ?? "plaintext").toLowerCase();
}

export function resolveCodeLanguage(lang: string): string {
  return CODE_LANG_ALIASES[lang] ?? lang;
}

export function isKnownCodeLanguage(lang: string): boolean {
  const resolved = resolveCodeLanguage(lang);
  return KNOWN_CODE_LANGUAGES.has(resolved) || KNOWN_CODE_LANGUAGES.has(lang);
}

export function extractFirstH1(raw: string): string | undefined {
  const content = stripFrontmatter(raw);
  const lines = content.split(/\r?\n/);
  let inFence = false;
  let fenceMarker = "";

  for (const line of lines) {
    const fence = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (fence) {
      const marker = fence[1][0];
      if (!inFence) {
        inFence = true;
        fenceMarker = marker;
      } else if (marker === fenceMarker) {
        inFence = false;
      }
      continue;
    }
    if (inFence) continue;
    const h1 = line.match(H1_RE);
    if (h1) return h1[1].replace(CUSTOM_HEADING_ID_RE, "").trim();
  }
  return undefined;
}

export function extractCustomHeadingIds(raw: string): string[] {
  const content = stripFrontmatter(raw);
  const ids: string[] = [];
  const lines = content.split(/\r?\n/);
  let inFence = false;
  let fenceMarker = "";

  for (const line of lines) {
    const fence = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (fence) {
      const marker = fence[1][0];
      if (!inFence) {
        inFence = true;
        fenceMarker = marker;
      } else if (marker === fenceMarker) {
        inFence = false;
      }
      continue;
    }
    if (inFence) continue;
    const heading = line.match(/^ {0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (!heading) continue;
    const custom = heading[2].match(CUSTOM_HEADING_ID_RE);
    if (custom) ids.push(custom[1]);
  }

  return ids;
}

export function isExternalHref(href: string): boolean {
  return /^(?:[a-z]+:)?\/\//i.test(href) || /^(?:mailto|tel):/i.test(href);
}

export function isInternalHref(href: string): boolean {
  if (!href || href.startsWith("#")) return false;
  return !isExternalHref(href);
}

export function resolveInternalRoute(href: string, fromRoute: string): string | undefined {
  if (!isInternalHref(href)) return undefined;

  const [pathPart] = href.split(/[?#]/, 1);
  if (/\.(?:mdx?|html)$/.test(pathPart)) {
    return fileHrefToRoute(href, fromRoute);
  }

  if (pathPart.startsWith("/")) {
    return normalizeRoute(pathPart);
  }

  const baseDir =
    fromRoute === "/"
      ? "/"
      : fromRoute.endsWith("/")
        ? fromRoute
        : `${fromRoute.replace(/\/[^/]*$/, "")}/`;
  const joined = path.posix.normalize(path.posix.join(baseDir, pathPart));
  return normalizeRoute(joined);
}

export function isStaticAssetHref(href: string): boolean {
  const pathPart = href.split(/[?#]/)[0] ?? href;
  return /\.(?:svg|png|jpe?g|gif|webp|ico|avif|woff2?|ttf|eot|mp4|webm|pdf)$/i.test(pathPart);
}

export function resolveLocalAssetPath(
  src: string,
  contentFile: string,
  srcDir: string,
  siteBase: string,
): string | undefined {
  if (isExternalHref(src) || src.startsWith("data:")) return undefined;
  let assetPath = src;
  if (assetPath.startsWith(siteBase) && siteBase !== "/") {
    assetPath = assetPath.slice(siteBase.length);
  }
  if (assetPath.startsWith("/")) {
    return path.join(srcDir, "public", assetPath.replace(/^\//, ""));
  }
  return path.resolve(path.dirname(contentFile), assetPath);
}

function stripFrontmatter(raw: string): string {
  if (!raw.startsWith("---")) return raw;
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return raw;
  return raw.slice(end + 4);
}

export async function verifyExternalHref(href: string): Promise<boolean> {
  if (!/^https?:\/\//i.test(href)) return true;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(href, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
    });
    return response.ok || response.status === 405 || response.status === 403;
  } catch {
    try {
      const response = await fetch(href, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        headers: { Range: "bytes=0-0" },
      });
      return response.ok || response.status === 206;
    } catch {
      return false;
    }
  } finally {
    clearTimeout(timer);
  }
}
