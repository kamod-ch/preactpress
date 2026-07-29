import type { PlaygroundFiles, PlaygroundDependencies, PreviewTheme } from "./types.js";

/** Build a StackBlitz project URL for the current playground files. */
export function buildStackBlitzUrl(options: {
  files: PlaygroundFiles;
  entry: string;
  dependencies: PlaygroundDependencies;
  title?: string;
}): string {
  const { files, entry, dependencies, title = "PreactPress Playground" } = options;
  const projectFiles: Record<string, string> = {};

  for (const [path, source] of Object.entries(files)) {
    const clean = path.startsWith("/") ? path.slice(1) : path;
    projectFiles[clean] = source;
  }

  const pkg = {
    name: "preactpress-playground",
    private: true,
    dependencies: {
      preact: "^10.29.2",
      ...Object.fromEntries(
        Object.entries(dependencies).filter(
          ([name]) => name !== "preact" && name !== "preact/hooks",
        ),
      ),
    },
  };

  projectFiles["package.json"] = JSON.stringify(pkg, null, 2);

  if (!projectFiles["index.html"]) {
    const entryClean = entry.startsWith("/") ? entry.slice(1) : entry;
    projectFiles["index.html"] = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${title}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/${entryClean.replace(/\.tsx?$/, ".js")}"></script>
  </body>
</html>`;
  }

  const params = new URLSearchParams({
    embed: "1",
    file: entry.startsWith("/") ? entry.slice(1) : entry,
    view: "preview",
  });

  const payload = encodeURIComponent(JSON.stringify({ files: projectFiles }));
  return `https://stackblitz.com/edit/preact-ts?${params.toString()}#${payload}`;
}

/** Open StackBlitz in a new tab with the current project. */
export function openStackBlitz(url: string): void {
  if (typeof window === "undefined") return;
  window.open(url, "_blank", "noopener,noreferrer");
}

/** Copy text to the clipboard when available. */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function previewWidthPx(width: "desktop" | "tablet" | "mobile"): number {
  switch (width) {
    case "mobile":
      return 390;
    case "tablet":
      return 768;
    default:
      return 1200;
  }
}

export function isDarkPreviewTheme(theme: PreviewTheme): boolean {
  return theme === "dark";
}
