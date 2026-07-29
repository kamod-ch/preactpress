import type { PageView } from "../client/types.js";

/** Plain markdown suitable for clipboard export (title + body, no HTML). */
export function pageMarkdownForCopy(page: PageView): string | undefined {
  if (page.kind !== "markdown" || !page.markdown) return undefined;
  const title = page.title?.trim();
  const body = page.markdown.trim();
  if (title && !body.startsWith("# ")) {
    return `# ${title}\n\n${body}`;
  }
  return body;
}

export function serializablePageForClient(page: PageView, includeMarkdown: boolean): unknown {
  if (page.kind === "markdown") {
    if (!includeMarkdown && page.markdown !== undefined) {
      const { markdown: _markdown, ...rest } = page;
      return rest;
    }
    return page;
  }
  const { Component: _Component, ...rest } = page;
  return rest;
}
