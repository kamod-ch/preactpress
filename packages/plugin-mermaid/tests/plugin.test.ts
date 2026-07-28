import { describe, expect, it } from "vitest";
import { mermaidPlugin, renderMermaidFenceHtml } from "../src/index.js";
import { runTransformFence, runTransformMarkdown } from "@kamod-ch/preactpress/plugin-testkit";

describe("renderMermaidFenceHtml", () => {
  it("escapes HTML in the static fallback", () => {
    const html = renderMermaidFenceHtml('graph TD\nA["<script>"] --> B');
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
    expect(html).toContain('class="pp-mermaid"');
    expect(html).toContain('role="figure"');
    expect(html).toContain('class="pp-mermaid-fallback"');
  });
});

describe("mermaidPlugin", () => {
  it("normalizes MERMAID fence language ids", async () => {
    const source = "```MERMAID\ngraph TD\n```";
    const next = await runTransformMarkdown(
      [mermaidPlugin()],
      source,
      { route: "/docs", file: "/docs/page.md" },
    );
    expect(next).toContain("```mermaid");
    expect(source).toContain("```MERMAID");
  });

  it("registers a client module", () => {
    expect(mermaidPlugin().client).toBe("@preactpress/plugin-mermaid/client");
  });

  it("renders mermaid fences through transformFence", async () => {
    const html = await runTransformFence(
      [mermaidPlugin()],
      "mermaid",
      "graph TD\n  A --> B",
      "",
      { route: "/", file: "/index.md" },
    );
    expect(html).toContain('class="pp-mermaid"');
    expect(html).toContain("graph TD");
    expect(html).toContain("A --&gt; B");
  });

  it("ignores non-mermaid languages", async () => {
    const html = await runTransformFence(
      [mermaidPlugin()],
      "typescript",
      "const x = 1",
      "",
      { route: "/", file: "/index.md" },
    );
    expect(html).toBeUndefined();
  });
});
