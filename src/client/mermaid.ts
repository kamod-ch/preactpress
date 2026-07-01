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
  return element.textContent ?? "";
}

function normalizeMermaidBlocks(): HTMLElement[] {
  const blocks = Array.from(document.querySelectorAll<HTMLElement>(".pp-mermaid"));

  for (const code of document.querySelectorAll<HTMLElement>(
    'pre > code.language-mermaid, pre > code[class*="language-mermaid"]',
  )) {
    const pre = code.parentElement;
    if (!pre || pre.dataset.mermaidNormalized === "true") continue;

    const block = document.createElement("div");
    block.className = "pp-mermaid";
    block.dataset.mermaidSource = code.textContent ?? "";
    block.textContent = code.textContent ?? "";
    pre.replaceWith(block);
    pre.dataset.mermaidNormalized = "true";
    blocks.push(block);
  }

  return blocks;
}

export async function renderMermaidDiagrams(): Promise<void> {
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
      } catch (error) {
        block.dataset.mermaidError = "true";
        block.textContent = source;
        console.warn("Failed to render Mermaid diagram", error);
      }
    }),
  );
}
