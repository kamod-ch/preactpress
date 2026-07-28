import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks";
import { createDependencyContext, findDisallowedImports, resolveImportMap } from "./dependencies.js";
import { mergeDependencies, resolvePlaygroundFiles, serializeFilesForDisplay } from "./files.js";
import { buildSandboxDocument } from "./static.js";
import { buildStackBlitzUrl, copyToClipboard, openStackBlitz, previewWidthPx, } from "./utils.js";
export function PlaygroundView(props) {
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
    const [files, setFiles] = useState(() => ({ ...initialSnapshot.files }));
    const [activeFile, setActiveFile] = useState(initialSnapshot.entry);
    const [previewTheme, setPreviewTheme] = useState(props.previewTheme ?? "light");
    const [previewWidth, setPreviewWidth] = useState(props.previewWidth ?? "desktop");
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);
    const [ready, setReady] = useState(false);
    const [editorKey, setEditorKey] = useState(0);
    const editorId = useMemo(() => `pp-playground-editor-${Math.random().toString(36).slice(2, 9)}`, []);
    const iframeRef = useRef(null);
    const debounceRef = useRef(undefined);
    const dependencyContext = useMemo(() => createDependencyContext(props.pluginOptions), [props.pluginOptions]);
    const dependencies = useMemo(() => mergeDependencies(props.dependencies), [props.dependencies]);
    const filePaths = useMemo(() => Object.keys(files).sort(), [files]);
    const readOnly = Boolean(props.readOnly);
    const showStackBlitz = props.stackBlitz !== false;
    const title = props.title ?? "Preact playground";
    const sandboxSrcDoc = useMemo(() => buildSandboxDocument(previewTheme), [previewTheme]);
    const runPreview = useCallback(() => {
        const iframe = iframeRef.current;
        if (!iframe?.contentWindow)
            return;
        const virtualPaths = new Set(Object.keys(files));
        const violations = [];
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
        iframe.contentWindow.postMessage({
            type: "pp-playground-run",
            files,
            entry: initialSnapshot.entry,
            importMap: imports,
            theme: previewTheme,
        }, "*");
    }, [files, dependencies, dependencyContext, initialSnapshot.entry, previewTheme]);
    useEffect(() => {
        const onMessage = (event) => {
            const data = event.data;
            if (!data || typeof data.type !== "string")
                return;
            if (data.type === "pp-playground-ready") {
                setReady(true);
                runPreview();
                return;
            }
            if (data.type === "pp-playground-result") {
                if (!data.ok)
                    setError(String(data.message ?? "Preview failed."));
                else
                    setError(null);
            }
        };
        window.addEventListener("message", onMessage);
        return () => window.removeEventListener("message", onMessage);
    }, [runPreview]);
    useEffect(() => {
        if (!ready)
            return;
        if (debounceRef.current)
            window.clearTimeout(debounceRef.current);
        debounceRef.current = window.setTimeout(runPreview, 350);
        return () => {
            if (debounceRef.current)
                window.clearTimeout(debounceRef.current);
        };
    }, [files, previewTheme, ready, runPreview]);
    const updateActiveSource = (source) => {
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
        if (ok)
            window.setTimeout(() => setCopied(false), 1500);
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
    return (_jsxs("section", { class: "pp-playground", "aria-label": title, "data-pp-playground": "interactive", children: [_jsxs("div", { class: "pp-playground-toolbar", role: "toolbar", "aria-label": "Playground controls", children: [_jsxs("div", { class: "pp-playground-toolbar-group", children: [_jsx("button", { type: "button", class: "pp-playground-btn", onClick: resetFiles, disabled: readOnly, children: "Reset" }), _jsx("button", { type: "button", class: "pp-playground-btn", onClick: handleCopy, children: copied ? "Copied" : "Copy" }), showStackBlitz ? (_jsx("button", { type: "button", class: "pp-playground-btn", onClick: handleStackBlitz, children: "StackBlitz" })) : null] }), _jsxs("div", { class: "pp-playground-toolbar-group", role: "group", "aria-label": "Preview theme", children: [_jsx("button", { type: "button", class: `pp-playground-btn${previewTheme === "light" ? " is-active" : ""}`, "aria-pressed": previewTheme === "light", onClick: () => setPreviewTheme("light"), children: "Light" }), _jsx("button", { type: "button", class: `pp-playground-btn${previewTheme === "dark" ? " is-active" : ""}`, "aria-pressed": previewTheme === "dark", onClick: () => setPreviewTheme("dark"), children: "Dark" })] }), _jsx("div", { class: "pp-playground-toolbar-group", role: "group", "aria-label": "Preview width", children: ["desktop", "tablet", "mobile"].map((width) => (_jsx("button", { type: "button", class: `pp-playground-btn${previewWidth === width ? " is-active" : ""}`, "aria-pressed": previewWidth === width, onClick: () => setPreviewWidth(width), children: width.charAt(0).toUpperCase() + width.slice(1) }, width))) })] }), _jsxs("div", { class: "pp-playground-body", children: [_jsxs("div", { class: "pp-playground-editor-pane", children: [filePaths.length > 1 ? (_jsx("div", { class: "pp-playground-tabs", role: "tablist", "aria-label": "Source files", children: filePaths.map((path) => (_jsx("button", { type: "button", role: "tab", class: `pp-playground-tab${activeFile === path ? " is-active" : ""}`, "aria-selected": activeFile === path, onClick: () => setActiveFile(path), children: path.replace(/^\//, "") }, path))) })) : null, _jsx("label", { class: "pp-playground-editor-label", for: editorId, children: activeFile.replace(/^\//, "") }), _jsx("textarea", { id: editorId, class: "pp-playground-editor", value: files[activeFile] ?? "", readOnly: readOnly, spellcheck: false, onInput: (event) => updateActiveSource(event.currentTarget.value), onChange: (event) => updateActiveSource(event.currentTarget.value), "aria-label": `Source code for ${activeFile}` }, editorKey)] }), _jsxs("div", { class: "pp-playground-preview-pane", children: [_jsx("div", { class: "pp-playground-preview-label", children: "Preview" }), _jsx("div", { class: "pp-playground-preview-frame-wrap", "data-width": previewWidth, style: { maxWidth: `${previewWidthPx(previewWidth)}px` }, children: _jsx("iframe", { ref: iframeRef, class: "pp-playground-preview-frame", title: `${title} preview`, sandbox: "allow-scripts allow-modals", srcDoc: sandboxSrcDoc }) })] })] }), error ? (_jsx("pre", { class: "pp-playground-error", role: "alert", children: error })) : null] }));
}
//# sourceMappingURL=PlaygroundView.js.map