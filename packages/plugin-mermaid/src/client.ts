import "@preactpress/plugin-mermaid/style.css";

let renderRun = 0;

function isDarkTheme(): boolean {
  if (typeof document === "undefined" || typeof window === "undefined") return false;
  const explicit = document.documentElement.dataset.theme;
  if (explicit === "dark") return true;
  if (explicit === "light") return false;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

function mermaidSourceFromElement(element: HTMLElement): string {
  if (element.dataset.mermaidSource) return element.dataset.mermaidSource;
  const fallback = element.querySelector(".pp-mermaid-fallback code");
  return fallback?.textContent ?? element.textContent ?? "";
}

function normalizeMermaidBlocks(): HTMLElement[] {
  const blocks = Array.from(document.querySelectorAll<HTMLElement>(".pp-mermaid"));

  for (const code of document.querySelectorAll<HTMLElement>(
    'pre > code.language-mermaid, pre > code[class*="language-mermaid"]',
  )) {
    const pre = code.parentElement;
    if (!pre || pre.dataset.mermaidNormalized === "true") continue;

    const block = document.createElement("figure");
    block.className = "pp-mermaid";
    block.dataset.mermaidSource = code.textContent ?? "";
    block.setAttribute("role", "figure");
    block.setAttribute("aria-label", "Mermaid diagram");

    const fallback = document.createElement("pre");
    fallback.className = "pp-mermaid-fallback";
    fallback.innerHTML = `<code>${code.textContent ?? ""}</code>`;
    block.appendChild(fallback);

    pre.replaceWith(block);
    pre.dataset.mermaidNormalized = "true";
    blocks.push(block);
  }

  return blocks;
}

function renderErrorMessage(block: HTMLElement, source: string, message: string): void {
  block.dataset.mermaidError = "true";
  block.dataset.mermaidRendered = "true";
  block.innerHTML = [
    `<div class="pp-mermaid-error" role="alert">`,
    `<strong>Mermaid diagram could not be rendered.</strong>`,
    `<p>${escapeHtml(message)}</p>`,
    `</div>`,
    `<details class="pp-mermaid-source">`,
    `<summary>Show diagram source</summary>`,
    `<pre><code>${escapeHtml(source)}</code></pre>`,
    `</details>`,
  ].join("");
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Client-side progressive enhancement for Mermaid diagrams. */
export async function enhanceContent(): Promise<void> {
  if (typeof document === "undefined") return;

  const blocks = normalizeMermaidBlocks().filter(
    (block) => block.dataset.mermaidRendered !== "true",
  );
  if (blocks.length === 0) return;

  const run = ++renderRun;
  const { default: mermaid } = await import("mermaid");
  if (run !== renderRun) return;

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "strict",
    theme: isDarkTheme() ? "dark" : "default",
  });

  await Promise.all(
    blocks.map(async (block, index) => {
      const source = mermaidSourceFromElement(block).trim();
      if (!source) return;

      try {
        const id = `pp-mermaid-${run}-${index}`;
        const { svg } = await mermaid.render(id, source);
        if (run !== renderRun) return;

        block.innerHTML = svg;
        block.dataset.mermaidRendered = "true";
        block.dataset.mermaidSource = source;
        block.setAttribute("role", "img");
        block.setAttribute("aria-label", "Mermaid diagram");
      } catch (error) {
        const message =
          error instanceof Error && error.message.trim()
            ? error.message.trim()
            : "The diagram syntax is invalid or unsupported.";
        renderErrorMessage(block, source, message);
        console.warn("Failed to render Mermaid diagram", error);
      }
    }),
  );
}
