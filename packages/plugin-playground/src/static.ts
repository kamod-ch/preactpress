import type { PlaygroundFiles, PreviewTheme } from "./types.js";

/** Escape text for safe inclusion in HTML text nodes. */
export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Static SSR fallback rendered without client JavaScript. */
export function renderPlaygroundFallbackHtml(options: {
  files: PlaygroundFiles;
  entry: string;
  title?: string;
  readOnly?: boolean;
}): string {
  const { files, entry, title = "Preact playground", readOnly = false } = options;
  const display = Object.entries(files)
    .sort(([a], [b]) => {
      if (a === entry) return -1;
      if (b === entry) return 1;
      return a.localeCompare(b);
    })
    .map(([path, source]) => {
      const label = path === entry ? `${path} (entry)` : path;
      return [
        `<div class="pp-playground-static-file">`,
        `<div class="pp-playground-static-file-label">${escapeHtml(label)}</div>`,
        `<pre class="pp-playground-static-code"><code>${escapeHtml(source)}</code></pre>`,
        `</div>`,
      ].join("");
    })
    .join("");

  const mode = readOnly ? "read-only" : "editable";

  return [
    `<section class="pp-playground pp-playground-static" data-pp-playground="${mode}" aria-label="${escapeHtml(title)}">`,
    `<div class="pp-playground-static-notice" role="status">`,
    `Live preview requires JavaScript. Source code is shown below.`,
    `</div>`,
    display,
    `</section>`,
  ].join("");
}

/** Build the sandbox iframe srcdoc document. Kept inline so the host bundle stays small. */
export function buildSandboxDocument(theme: PreviewTheme): string {
  const bodyClass = theme === "dark" ? "pp-sandbox-dark" : "pp-sandbox-light";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  :root { color-scheme: light dark; }
  html, body { margin: 0; min-height: 100%; font-family: system-ui, sans-serif; }
  body.pp-sandbox-light { background: #fff; color: #111; }
  body.pp-sandbox-dark { background: #0f1117; color: #f3f4f6; }
  #root { padding: 1rem; }
  .pp-sandbox-error {
    margin: 0;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    background: #fef2f2;
    color: #991b1b;
    border: 1px solid #fecaca;
    white-space: pre-wrap;
    font: 13px/1.5 ui-monospace, monospace;
  }
  body.pp-sandbox-dark .pp-sandbox-error {
    background: #450a0a;
    color: #fecaca;
    border-color: #991b1b;
  }
</style>
</head>
<body class="${bodyClass}">
<div id="root" aria-live="polite"></div>
<script>
const root = document.getElementById("root");
const SUCROSE_URL = "https://esm.sh/sucrase@3.35.0";

function post(payload) {
  parent.postMessage(payload, "*");
}

function renderError(message) {
  root.innerHTML = '<pre class="pp-sandbox-error" role="alert"></pre>';
  root.querySelector(".pp-sandbox-error").textContent = message;
  post({ type: "pp-playground-result", ok: false, message });
}

function normalizePath(path) {
  if (path.startsWith("/")) return path;
  return "/" + path;
}

function resolveRelative(from, target) {
  if (target.startsWith("/")) return target;
  const base = from.split("/").slice(0, -1);
  for (const part of target.split("/")) {
    if (part === "." || part === "") continue;
    if (part === "..") base.pop();
    else base.push(part);
  }
  return "/" + base.join("/");
}

function rewriteRelativeImports(source, filePath, filePaths) {
  return source.replace(
    /(import\\s+(?:[^'";\\n]+\\s+from\\s+|))(['"])(\\.[^'"]+)\\2/g,
    (_, prefix, quote, spec) => {
      const resolved = resolveRelative(filePath, spec);
      const match = filePaths.find((p) => p === resolved || p === resolved + ".tsx" || p === resolved + ".ts");
      const target = match ?? resolved;
      return prefix + quote + target + quote;
    },
  );
}

function rewriteModuleSpecifiers(code, pathToBlob, externalMap) {
  return code.replace(/(import\\s+(?:[^'";\\n]+\\s+from\\s+|))(['"])([^'"]+)\\2/g, (_, prefix, quote, spec) => {
    if (spec.startsWith("/") && pathToBlob[spec]) {
      return prefix + quote + pathToBlob[spec] + quote;
    }
    if (externalMap[spec]) {
      return prefix + quote + externalMap[spec] + quote;
    }
    return prefix + quote + spec + quote;
  });
}

async function transpileTsx(source, filename) {
  const { transform } = await import(SUCROSE_URL);
  const result = transform(source, {
    transforms: ["typescript", "jsx"],
    jsxPragma: "h",
    jsxFragmentPragma: "Fragment",
    production: true,
    filePath: filename,
  });
  return result.code;
}

async function runExample(payload) {
  const blobUrls = [];
  try {
    document.body.className = payload.theme === "dark" ? "pp-sandbox-dark" : "pp-sandbox-light";
    root.innerHTML = "";

    const filePaths = Object.keys(payload.files).map(normalizePath);
    const pathToBlob = {};
    const transpiled = {};

    for (const path of filePaths) {
      const rewritten = rewriteRelativeImports(payload.files[path], path, filePaths);
      transpiled[path] = await transpileTsx(rewritten, path);
    }

    for (const path of filePaths) {
      const blob = new Blob([transpiled[path] + "\\n//# sourceURL=" + path], { type: "text/javascript" });
      const url = URL.createObjectURL(blob);
      blobUrls.push(url);
      pathToBlob[path] = url;
    }

    for (const path of filePaths) {
      const finalCode = rewriteModuleSpecifiers(transpiled[path], pathToBlob, payload.importMap ?? {});
      const blob = new Blob([finalCode + "\\n//# sourceURL=" + path], { type: "text/javascript" });
      URL.revokeObjectURL(pathToBlob[path]);
      const url = URL.createObjectURL(blob);
      blobUrls.push(url);
      pathToBlob[path] = url;
    }

    const entry = normalizePath(payload.entry);
    const preactUrl = payload.importMap?.preact ?? "https://esm.sh/preact@10.29.2";
    const { h, render, Fragment } = await import(preactUrl);
    globalThis.h = h;
    globalThis.Fragment = Fragment;
    const mod = await import(pathToBlob[entry]);
    const Component = mod.default;
    if (typeof Component !== "function") {
      throw new Error("Entry module must default-export a Preact component.");
    }
    render(h(Component, null), root);
    post({ type: "pp-playground-result", ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    renderError(message);
  } finally {
    blobUrls.forEach((url) => URL.revokeObjectURL(url));
  }
}

window.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || data.type !== "pp-playground-run") return;
  runExample(data);
});

post({ type: "pp-playground-ready" });
</script>
</body>
</html>`;
}
