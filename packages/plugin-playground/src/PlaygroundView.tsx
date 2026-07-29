import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks";
import type { PlaygroundPluginOptions } from "./types.js";
import type { PlaygroundFiles, PlaygroundProps, PreviewTheme, PreviewWidth } from "./types.js";
import {
  createDependencyContext,
  findDisallowedImports,
  resolveImportMap,
} from "./dependencies.js";
import { mergeDependencies, resolvePlaygroundFiles, serializeFilesForDisplay } from "./files.js";
import { buildSandboxDocument } from "./static.js";
import { buildStackBlitzUrl, copyToClipboard, openStackBlitz, previewWidthPx } from "./utils.js";

export interface PlaygroundViewProps extends PlaygroundProps {
  pluginOptions?: PlaygroundPluginOptions;
  /** Resolved initial files passed from the MDX wrapper. */
  initialFiles?: PlaygroundFiles;
  initialEntry?: string;
}

export function PlaygroundView(props: PlaygroundViewProps) {
  const [initialSnapshot] = useState(() => {
    const resolved = {
      files: props.initialFiles ?? resolvePlaygroundFiles(props).files,
      entry: props.initialEntry ?? resolvePlaygroundFiles(props).entry,
    };
    return {
      files: structuredClone(resolved.files),
      entry: resolved.entry,
    };
  });

  const [files, setFiles] = useState<PlaygroundFiles>(() => ({ ...initialSnapshot.files }));
  const [activeFile, setActiveFile] = useState(initialSnapshot.entry);
  const [previewTheme, setPreviewTheme] = useState<PreviewTheme>(props.previewTheme ?? "light");
  const [previewWidth, setPreviewWidth] = useState<PreviewWidth>(props.previewWidth ?? "desktop");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [ready, setReady] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const editorId = useMemo(
    () => `pp-playground-editor-${Math.random().toString(36).slice(2, 9)}`,
    [],
  );

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const debounceRef = useRef<number | undefined>(undefined);

  const dependencyContext = useMemo(
    () => createDependencyContext(props.pluginOptions),
    [props.pluginOptions],
  );

  const dependencies = useMemo(() => mergeDependencies(props.dependencies), [props.dependencies]);

  const filePaths = useMemo(() => Object.keys(files).sort(), [files]);
  const readOnly = Boolean(props.readOnly);
  const showStackBlitz = props.stackBlitz !== false;
  const title = props.title ?? "Preact playground";

  const sandboxSrcDoc = useMemo(() => buildSandboxDocument(previewTheme), [previewTheme]);

  const runPreview = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    const virtualPaths = new Set(Object.keys(files));
    const violations: string[] = [];

    for (const source of Object.values(files)) {
      violations.push(...findDisallowedImports(source, virtualPaths, dependencyContext));
    }

    const { imports, errors } = resolveImportMap(dependencies, dependencyContext);
    const combinedErrors = [...errors, ...violations];

    if (combinedErrors.length > 0) {
      setError(combinedErrors.join("\n"));
      return;
    }

    setError(null);
    iframe.contentWindow.postMessage(
      {
        type: "pp-playground-run",
        files,
        entry: initialSnapshot.entry,
        importMap: imports,
        theme: previewTheme,
      },
      "*",
    );
  }, [files, dependencies, dependencyContext, initialSnapshot.entry, previewTheme]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data.type !== "string") return;

      if (data.type === "pp-playground-ready") {
        setReady(true);
        runPreview();
        return;
      }

      if (data.type === "pp-playground-result") {
        if (!data.ok) setError(String(data.message ?? "Preview failed."));
        else setError(null);
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [runPreview]);

  useEffect(() => {
    if (!ready) return;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(runPreview, 350);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [files, previewTheme, ready, runPreview]);

  const updateActiveSource = (source: string) => {
    setFiles((current) => ({ ...current, [activeFile]: source }));
  };

  const resetFiles = () => {
    setFiles(structuredClone(initialSnapshot.files));
    setActiveFile(initialSnapshot.entry);
    setError(null);
    setEditorKey((key) => key + 1);
  };

  const handleCopy = async () => {
    const text = serializeFilesForDisplay(files, initialSnapshot.entry);
    const ok = await copyToClipboard(text);
    setCopied(ok);
    if (ok) window.setTimeout(() => setCopied(false), 1500);
  };

  const handleStackBlitz = () => {
    const url = buildStackBlitzUrl({
      files,
      entry: initialSnapshot.entry,
      dependencies,
      title,
    });
    openStackBlitz(url);
  };

  return (
    <section class="pp-playground" aria-label={title} data-pp-playground="interactive">
      <div class="pp-playground-toolbar" role="toolbar" aria-label="Playground controls">
        <div class="pp-playground-toolbar-group">
          <button type="button" class="pp-playground-btn" onClick={resetFiles} disabled={readOnly}>
            Reset
          </button>
          <button type="button" class="pp-playground-btn" onClick={handleCopy}>
            {copied ? "Copied" : "Copy"}
          </button>
          {showStackBlitz ? (
            <button type="button" class="pp-playground-btn" onClick={handleStackBlitz}>
              StackBlitz
            </button>
          ) : null}
        </div>

        <div class="pp-playground-toolbar-group" role="group" aria-label="Preview theme">
          <button
            type="button"
            class={`pp-playground-btn${previewTheme === "light" ? " is-active" : ""}`}
            aria-pressed={previewTheme === "light"}
            onClick={() => setPreviewTheme("light")}
          >
            Light
          </button>
          <button
            type="button"
            class={`pp-playground-btn${previewTheme === "dark" ? " is-active" : ""}`}
            aria-pressed={previewTheme === "dark"}
            onClick={() => setPreviewTheme("dark")}
          >
            Dark
          </button>
        </div>

        <div class="pp-playground-toolbar-group" role="group" aria-label="Preview width">
          {(["desktop", "tablet", "mobile"] as const).map((width) => (
            <button
              key={width}
              type="button"
              class={`pp-playground-btn${previewWidth === width ? " is-active" : ""}`}
              aria-pressed={previewWidth === width}
              onClick={() => setPreviewWidth(width)}
            >
              {width.charAt(0).toUpperCase() + width.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div class="pp-playground-body">
        <div class="pp-playground-editor-pane">
          {filePaths.length > 1 ? (
            <div class="pp-playground-tabs" role="tablist" aria-label="Source files">
              {filePaths.map((path) => (
                <button
                  key={path}
                  type="button"
                  role="tab"
                  class={`pp-playground-tab${activeFile === path ? " is-active" : ""}`}
                  aria-selected={activeFile === path}
                  onClick={() => setActiveFile(path)}
                >
                  {path.replace(/^\//, "")}
                </button>
              ))}
            </div>
          ) : null}

          <label class="pp-playground-editor-label" for={editorId}>
            {activeFile.replace(/^\//, "")}
          </label>
          <textarea
            key={editorKey}
            id={editorId}
            class="pp-playground-editor"
            value={files[activeFile] ?? ""}
            readOnly={readOnly}
            spellcheck={false}
            onInput={(event) => updateActiveSource(event.currentTarget.value)}
            onChange={(event) => updateActiveSource(event.currentTarget.value)}
            aria-label={`Source code for ${activeFile}`}
          />
        </div>

        <div class="pp-playground-preview-pane">
          <div class="pp-playground-preview-label">Preview</div>
          <div
            class="pp-playground-preview-frame-wrap"
            data-width={previewWidth}
            style={{ maxWidth: `${previewWidthPx(previewWidth)}px` }}
          >
            <iframe
              ref={iframeRef}
              class="pp-playground-preview-frame"
              title={`${title} preview`}
              sandbox="allow-scripts allow-modals"
              srcDoc={sandboxSrcDoc}
            />
          </div>
        </div>
      </div>

      {error ? (
        <pre class="pp-playground-error" role="alert">
          {error}
        </pre>
      ) : null}
    </section>
  );
}
