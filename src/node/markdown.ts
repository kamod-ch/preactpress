import fs from "node:fs";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";
import { full as markdownItEmoji } from "markdown-it-emoji";
import mathjax from "markdown-it-mathjax3";
import {
  transformerMetaHighlight,
  transformerNotationDiff,
  transformerNotationErrorLevel,
  transformerNotationFocus,
  transformerNotationHighlight,
} from "@shikijs/transformers";
import type { BundledLanguage } from "shiki";
import { createHighlighter, type Highlighter } from "shiki";
import type { MarkdownConfig, OutlineItem } from "./siteConfig.js";
import { fileHrefToRoute } from "./content.js";
import {
  extractHeadingsFromContent,
  headingIdFor,
  parseHeadingContent,
  renderInlineToc,
} from "./markdownHeadings.js";
import { expandMarkdownIncludes } from "./markdownInclude.js";
import { expandSnippetImports } from "./markdownSnippets.js";
import { normalizeRoute } from "../shared/route.js";
import { escapeHtml } from "../shared/escapeHtml.js";

let highlighter: Highlighter | undefined;

const SHIKI_LANG_MAP: Record<string, string> = {
  ts: "typescript",
  js: "javascript",
  md: "markdown",
  sh: "bash",
  shell: "bash",
  yml: "yaml",
  text: "plaintext",
  txt: "plaintext",
};

const CONTAINER_TYPES = new Set([
  "tip",
  "warning",
  "danger",
  "info",
  "note",
  "important",
  "caution",
  "details",
]);

const CONTAINER_LABELS: Record<string, string> = {
  tip: "TIP",
  warning: "WARNING",
  danger: "DANGER",
  info: "INFO",
  note: "NOTE",
  important: "IMPORTANT",
  caution: "CAUTION",
};

const GFM_ALERT_TYPES = new Set(["note", "tip", "important", "warning", "caution"]);

const CODE_TRANSFORMERS = [
  transformerMetaHighlight(),
  transformerNotationHighlight(),
  transformerNotationDiff(),
  transformerNotationFocus({ classActiveLine: "focused", classActivePre: "has-focused-lines" }),
  transformerNotationErrorLevel(),
];

export async function getHighlighter(): Promise<Highlighter> {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ["github-light", "github-dark"],
      langs: ["plaintext"],
    });
  }
  return highlighter;
}

function resolveShikiLang(langRaw: string): string {
  return SHIKI_LANG_MAP[langRaw] ?? langRaw;
}

function parseFenceInfo(info: string): { lang: string; metaRaw: string; tabTitle?: string } {
  let trimmed = info.trim();
  if (!trimmed) return { lang: "plaintext", metaRaw: "" };

  const tabMatch = trimmed.match(/\s*\[([^\]]+)\]\s*$/);
  const tabTitle = tabMatch?.[1];
  if (tabMatch) trimmed = trimmed.slice(0, tabMatch.index).trim();

  const match = trimmed.match(/^([a-zA-Z0-9#_+.:-]+)([\s\S]*)$/);
  if (!match) return { lang: "plaintext", metaRaw: trimmed, tabTitle };
  return { lang: match[1].toLowerCase(), metaRaw: match[2].trim(), tabTitle };
}

function fenceLangFromInfo(info: string): string {
  return parseFenceInfo(info).lang;
}

async function preloadFenceLanguages(content: string, hi: Highlighter): Promise<void> {
  const langs = new Set<string>();
  let inFence = false;
  for (const line of content.split(/\r?\n/)) {
    const open = line.match(/^ {0,3}(`{3,}|~{3,})(\S*)/);
    if (open) {
      if (!inFence) {
        inFence = true;
        const lang = resolveShikiLang(fenceLangFromInfo(open[2] || "plaintext"));
        langs.add(lang);
      } else {
        inFence = false;
      }
      continue;
    }
  }
  for (const lang of langs) {
    try {
      if (!hi.getLoadedLanguages().includes(lang as BundledLanguage)) {
        await hi.loadLanguage(lang as BundledLanguage);
      }
    } catch {
      /* unknown language — fence renderer falls back to plain <pre> */
    }
  }
}

function highlightFenceSync(hi: Highlighter, langRaw: string, code: string, metaRaw = ""): string {
  const lang = resolveShikiLang(langRaw);
  try {
    return hi.codeToHtml(code, {
      lang: lang as BundledLanguage,
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      meta: metaRaw ? { __raw: metaRaw } : undefined,
      transformers: CODE_TRANSFORMERS,
    });
  } catch {
    return `<pre class="shiki"><code>${escapeHtml(code)}</code></pre>`;
  }
}

export interface RenderedMarkdown {
  meta: Record<string, unknown>;
  html: string;
  title?: string;
  description?: string;
  headings: OutlineItem[];
}

export interface MarkdownMetadata {
  meta: Record<string, unknown>;
  title?: string;
  description?: string;
  headings: OutlineItem[];
}

const DEFAULT_MARKDOWN_CONFIG: Required<MarkdownConfig> = {
  html: false,
  linkify: true,
  typographer: true,
  emoji: true,
  math: false,
};

interface MarkdownRenderEnv {
  highlighter: Highlighter;
  headings: OutlineItem[];
  allHeadings: OutlineItem[];
  codeGroupCounter: number;
  route?: string;
  knownRoutes?: Set<string>;
  localePrefix?: string;
}

const markdownRenderers = new Map<string, MarkdownIt>();

function rendererCacheKey(config: Required<MarkdownConfig>): string {
  return JSON.stringify({
    html: config.html,
    linkify: config.linkify,
    typographer: config.typographer,
    emoji: config.emoji,
    math: config.math,
  });
}

function getMarkdownRenderer(config: Required<MarkdownConfig>): MarkdownIt {
  const key = rendererCacheKey(config);
  const cached = markdownRenderers.get(key);
  if (cached) return cached;

  const md = new MarkdownIt({
    html: config.html,
    linkify: config.linkify,
    typographer: config.typographer,
  });

  if (config.emoji) md.use(markdownItEmoji);
  if (config.math) md.use(mathjax);

  const defaultHeadingOpen =
    md.renderer.rules.heading_open ??
    ((tokens, idx, rendererOptions, _env, self) => self.renderToken(tokens, idx, rendererOptions));
  const defaultLinkOpen =
    md.renderer.rules.link_open ??
    ((tokens, idx, rendererOptions, _env, self) => self.renderToken(tokens, idx, rendererOptions));
  const defaultHeadingClose =
    md.renderer.rules.heading_close ??
    ((tokens, idx, rendererOptions, _env, self) => self.renderToken(tokens, idx, rendererOptions));

  md.renderer.rules.fence = (tokens, idx, _rendererOptions, env): string => {
    const renderEnv = env as MarkdownRenderEnv;
    const token = tokens[idx];
    const info = (token.info || "").trim();
    const { lang: langRaw, metaRaw } = parseFenceInfo(info);
    const code = token.content.replace(/\n$/, "");
    return highlightFenceSync(renderEnv.highlighter, langRaw, code, metaRaw);
  };

  md.renderer.rules.heading_open = (tokens, idx, rendererOptions, env, self) => {
    const renderEnv = env as MarkdownRenderEnv;
    const token = tokens[idx];
    const level = Number(token.tag.slice(1));
    const inline = tokens[idx + 1];
    const rawText = inline?.type === "inline" ? inline.content : "";
    const customId = typeof token.meta?.customId === "string" ? token.meta.customId : undefined;
    const { id, text } = headingIdFor(
      customId ? `${rawText} {#${customId}}` : rawText,
      renderEnv.headings,
    );
    token.attrSet("id", id);
    token.attrJoin("class", "pp-heading");
    if (level >= 2 && level <= 3) renderEnv.headings.push({ id, text, level });
    return defaultHeadingOpen(tokens, idx, rendererOptions, env, self);
  };

  md.renderer.rules.heading_close = (tokens, idx, rendererOptions, env, self) => {
    const open = tokens
      .slice(0, idx)
      .reverse()
      .find((token) => token.type === "heading_open" && token.tag === tokens[idx].tag);
    const id = open?.attrGet("id");
    const anchor = id
      ? `<a class="pp-heading-anchor" href="#${escapeHtml(id)}" aria-label="Link to this section">#</a>`
      : "";
    return `${anchor}${defaultHeadingClose(tokens, idx, rendererOptions, env, self)}`;
  };

  registerHeadingIdRule(md);
  registerCodeGroupRule(md);
  registerTocRule(md);
  registerContainerRule(md);

  md.renderer.rules.link_open = (tokens, idx, rendererOptions, env, self) => {
    const renderEnv = env as MarkdownRenderEnv;
    const token = tokens[idx];
    const href = token.attrGet("href") ?? "";
    if (renderEnv.route) {
      let targetRoute = fileHrefToRoute(href, renderEnv.route);
      if (
        targetRoute &&
        renderEnv.localePrefix &&
        href.startsWith("/") &&
        !targetRoute.startsWith(`${renderEnv.localePrefix}/`)
      ) {
        const localized = normalizeRoute(`${renderEnv.localePrefix}${targetRoute}`);
        if (renderEnv.knownRoutes?.has(localized)) targetRoute = localized;
      }
      if (targetRoute && (!renderEnv.knownRoutes || renderEnv.knownRoutes.has(targetRoute))) {
        const hash = href.includes("#") ? `#${href.split("#").slice(1).join("#")}` : "";
        token.attrSet("href", `${targetRoute}${hash}`);
      }
    }
    if (/^https?:\/\//i.test(href)) {
      token.attrSet("target", "_blank");
      token.attrSet("rel", "noopener noreferrer");
    }
    return defaultLinkOpen(tokens, idx, rendererOptions, env, self);
  };

  markdownRenderers.set(key, md);
  return md;
}

export async function renderMarkdown(
  raw: string,
  filePath?: string,
  options: MarkdownConfig & {
    route?: string;
    routes?: Iterable<string>;
    localePrefix?: string;
    srcDir?: string;
  } = {},
): Promise<RenderedMarkdown> {
  const { data, content } = matter(raw);
  const meta = normalizeMatterData(data);
  const config = { ...DEFAULT_MARKDOWN_CONFIG, ...options };
  const hi = await getHighlighter();
  const route = options.route ? normalizeRoute(options.route) : undefined;
  const knownRoutes = options.routes ? new Set([...options.routes].map(normalizeRoute)) : undefined;

  const snippetCtx = { srcDir: options.srcDir, filePath };
  const withIncludes = expandMarkdownIncludes(content, snippetCtx);
  const processed = expandSnippetImports(convertGfmAlerts(withIncludes), snippetCtx);
  const allHeadings = extractHeadingsFromContent(processed);

  await preloadFenceLanguages(processed, hi);
  const md = getMarkdownRenderer(config);
  const html = md.render(processed, {
    highlighter: hi,
    headings: [],
    allHeadings,
    codeGroupCounter: 0,
    route,
    knownRoutes,
    localePrefix: options.localePrefix,
  });
  const headings = extractHeadingsFromContent(processed).filter(
    (heading) => heading.level >= 2 && heading.level <= 3,
  );
  const title = typeof meta.title === "string" ? meta.title : undefined;
  const description = typeof meta.description === "string" ? meta.description : undefined;

  return { meta, html, title, description, headings };
}

export function readMarkdownMetadata(absPath: string): MarkdownMetadata {
  const raw = fs.readFileSync(absPath, "utf8");
  return extractMarkdownMetadata(raw);
}

export function extractMarkdownMetadata(raw: string): MarkdownMetadata {
  const { data, content } = matter(raw);
  const meta = normalizeMatterData(data);
  const headings = extractHeadingsFromContent(content).filter(
    (heading) => heading.level >= 2 && heading.level <= 3,
  );
  const title = typeof meta.title === "string" ? meta.title : undefined;
  const description = typeof meta.description === "string" ? meta.description : undefined;

  return { meta, title, description, headings };
}

function registerHeadingIdRule(md: MarkdownIt): void {
  md.core.ruler.after("inline", "pp_heading_custom_ids", (state) => {
    const tokens = state.tokens;
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type !== "heading_open") continue;
      const inline = tokens[i + 1];
      if (inline?.type !== "inline") continue;

      const parsed = parseHeadingContent(inline.content);
      if (!parsed.customId) continue;

      tokens[i].meta = { ...tokens[i].meta, customId: parsed.customId };
      inline.content = parsed.text;
      for (const child of inline.children ?? []) {
        if (child.type === "text" && typeof child.content === "string") {
          child.content = parseHeadingContent(child.content).text;
        }
      }
    }
  });
}

function registerCodeGroupRule(md: MarkdownIt): void {
  md.block.ruler.before("fence", "pp_code_group", (state, startLine, endLine, silent) => {
    const start = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];
    const line = state.src.slice(start, max).trim();
    if (!/^:::\s*code-group\s*$/.test(line)) return false;
    if (silent) return true;

    let nextLine = startLine + 1;
    let found = false;
    const fences: { info: string; content: string }[] = [];

    while (nextLine < endLine) {
      const lineStart = state.bMarks[nextLine] + state.tShift[nextLine];
      const lineMax = state.eMarks[nextLine];
      const currentLine = state.src.slice(lineStart, lineMax).trim();

      if (currentLine === ":::") {
        found = true;
        break;
      }

      const fenceMatch = currentLine.match(/^(`{3,}|~{3,})(.*)$/);
      if (fenceMatch && state.sCount[nextLine] - state.blkIndent < 4) {
        const marker = fenceMatch[1];
        const info = fenceMatch[2].trim();
        let fenceEnd = nextLine + 1;
        const contentLines: string[] = [];
        while (fenceEnd < endLine) {
          const blockStart = state.bMarks[fenceEnd] + state.tShift[fenceEnd];
          const blockMax = state.eMarks[fenceEnd];
          const blockLine = state.src.slice(blockStart, blockMax);
          if (blockLine.trim() === marker && state.sCount[fenceEnd] - state.blkIndent < 4) break;
          contentLines.push(blockLine);
          fenceEnd += 1;
        }
        fences.push({ info, content: contentLines.join("\n").replace(/\n$/, "") });
        nextLine = fenceEnd + 1;
        continue;
      }

      nextLine += 1;
    }

    if (!found || !fences.length) return false;

    const token = state.push("pp_code_group", "", 0);
    token.meta = { fences };
    state.line = nextLine + 1;
    return true;
  });

  md.renderer.rules.pp_code_group = (tokens, idx, _rendererOptions, env): string => {
    const renderEnv = env as MarkdownRenderEnv;
    const fences = (tokens[idx].meta?.fences ?? []) as { info: string; content: string }[];
    const groupId = `pp-cg-${++renderEnv.codeGroupCounter}`;

    const tabs = fences
      .map((fence, index) => {
        const { lang, tabTitle } = parseFenceInfo(fence.info);
        const label = escapeHtml(tabTitle || lang);
        const inputId = `${groupId}-${index}`;
        const checked = index === 0 ? " checked" : "";
        return (
          `<input type="radio" name="${groupId}" id="${inputId}" class="pp-code-group-input"${checked}>` +
          `<label for="${inputId}" class="pp-code-group-tab">${label}</label>`
        );
      })
      .join("");

    const blocks = fences
      .map((fence) => {
        const { lang, metaRaw } = parseFenceInfo(fence.info);
        return `<div class="pp-code-group-block">${highlightFenceSync(renderEnv.highlighter, lang, fence.content, metaRaw)}</div>`;
      })
      .join("");

    return `<div class="pp-code-group">${tabs}<div class="pp-code-group-blocks">${blocks}</div></div>`;
  };
}

function registerTocRule(md: MarkdownIt): void {
  md.block.ruler.before("paragraph", "pp_toc", (state, startLine, _endLine, silent) => {
    const start = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];
    const line = state.src.slice(start, max).trim();
    if (line !== "[[toc]]") return false;
    if (silent) return true;

    state.push("pp_toc", "", 0);
    state.line = startLine + 1;
    return true;
  });

  md.renderer.rules.pp_toc = (_tokens, _idx, _rendererOptions, env): string => {
    const renderEnv = env as MarkdownRenderEnv;
    return renderInlineToc(renderEnv.allHeadings);
  };
}

function registerContainerRule(md: MarkdownIt): void {
  md.block.ruler.before("fence", "pp_container", (state, startLine, endLine, silent) => {
    const start = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];
    const line = state.src.slice(start, max).trim();
    const match = line.match(/^:::\s*([\w-]+)(?:\s+(.+))?$/);
    if (!match) return false;
    const type = match[1].toLowerCase();
    if (!CONTAINER_TYPES.has(type)) return false;

    if (silent) return true;

    let nextLine = startLine + 1;
    let found = false;
    while (nextLine < endLine) {
      const closeStart = state.bMarks[nextLine] + state.tShift[nextLine];
      const closeMax = state.eMarks[nextLine];
      const closeLine = state.src.slice(closeStart, closeMax).trim();
      if (closeLine === ":::") {
        found = true;
        break;
      }
      nextLine += 1;
    }
    if (!found) return false;

    const oldParent = state.parentType;
    const oldLineMax = state.lineMax;
    state.parentType = "blockquote";
    state.lineMax = nextLine;

    const title = match[2]?.trim();
    const openToken = state.push("pp_container_open", "div", 1);
    openToken.attrSet("class", `pp-container pp-container-${type}`);
    openToken.meta = { type, title };

    state.md.block.tokenize(state, startLine + 1, nextLine);

    const closeToken = state.push("pp_container_close", "div", -1);
    closeToken.meta = openToken.meta;

    state.parentType = oldParent;
    state.lineMax = oldLineMax;
    state.line = nextLine + 1;

    return true;
  });

  md.renderer.rules.pp_container_open = (tokens, idx): string => {
    const token = tokens[idx];
    const type = String(token.meta?.type ?? "info");
    const title = String(token.meta?.title ?? "");
    if (type === "details") {
      const summary = escapeHtml(title || "Details");
      return `<details class="pp-container pp-container-details"><summary>${summary}</summary><div class="pp-container-body">`;
    }
    const label = escapeHtml(title || CONTAINER_LABELS[type] || type.toUpperCase());
    return `<div class="pp-container pp-container-${escapeHtml(type)}"><p class="pp-container-title">${label}</p><div class="pp-container-body">`;
  };

  md.renderer.rules.pp_container_close = (tokens, idx): string => {
    const open = tokens
      .slice(0, idx)
      .reverse()
      .find((token) => token.type === "pp_container_open");
    const type = String(open?.meta?.type ?? "info");
    return type === "details" ? "</div></details>" : "</div></div>";
  };
}

function normalizeMatterData(data: unknown): Record<string, unknown> {
  return (data && typeof data === "object" ? data : {}) as Record<string, unknown>;
}

export function readMarkdownFile(
  absPath: string,
  options?: MarkdownConfig & {
    route?: string;
    routes?: Iterable<string>;
    localePrefix?: string;
    srcDir?: string;
  },
): Promise<RenderedMarkdown> {
  const raw = fs.readFileSync(absPath, "utf8");
  return renderMarkdown(raw, absPath, options);
}

function convertGfmAlerts(content: string): string {
  const lines = content.split(/\r?\n/);
  const result: string[] = [];
  let i = 0;
  let inFence = false;
  let fenceMarker = "";

  while (i < lines.length) {
    const line = lines[i];

    const fence = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (fence) {
      const marker = fence[1][0];
      if (!inFence) {
        inFence = true;
        fenceMarker = marker;
      } else if (marker === fenceMarker) {
        inFence = false;
        fenceMarker = "";
      }
      result.push(line);
      i++;
      continue;
    }
    if (inFence) {
      result.push(line);
      i++;
      continue;
    }

    if (line.match(/^:::\s*(?:\w|code-group)/)) {
      result.push(line);
      i++;
      while (i < lines.length && lines[i].trim() !== ":::") {
        result.push(lines[i]);
        i++;
      }
      if (i < lines.length) {
        result.push(lines[i]);
        i++;
      }
      continue;
    }

    const inlineAlert = line.match(/^>\s*\[!([A-Z]+)\]\s+(.*)$/i);
    const blockAlert = line.match(/^>\s*\[!([A-Z]+)\]\s*$/i);
    const alertType = (inlineAlert?.[1] ?? blockAlert?.[1])?.toLowerCase();

    if (alertType && GFM_ALERT_TYPES.has(alertType)) {
      result.push(`::: ${alertType}`);
      if (inlineAlert?.[2]) result.push(inlineAlert[2]);
      i++;
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        result.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      result.push(":::");
      continue;
    }

    result.push(line);
    i++;
  }

  return result.join("\n");
}
