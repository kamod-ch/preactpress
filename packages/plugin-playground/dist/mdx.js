import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
import { useEffect, useState } from "preact/hooks";
import { resolvePlaygroundFiles } from "./files.js";
import { renderPlaygroundFallbackHtml } from "./static.js";
/** MDX component for live Preact examples with an SSR-safe static fallback. */
export function Playground(props) {
  const resolved = resolvePlaygroundFiles(props);
  const fallbackHtml = renderPlaygroundFallbackHtml({
    files: resolved.files,
    entry: resolved.entry,
    title: props.title,
    readOnly: props.readOnly,
  });
  const [View, setView] = useState(null);
  useEffect(() => {
    let active = true;
    import("./PlaygroundView.js").then((mod) => {
      if (active) setView(() => mod.PlaygroundView);
    });
    return () => {
      active = false;
    };
  }, []);
  if (!View) {
    return _jsxs("div", {
      class: "pp-playground-root",
      children: [
        _jsx("noscript", { dangerouslySetInnerHTML: { __html: fallbackHtml } }),
        _jsxs("div", {
          class: "pp-playground pp-playground-loading",
          "aria-busy": "true",
          "aria-label": props.title ?? "Preact playground",
          children: [
            _jsx("div", {
              class: "pp-playground-static-notice",
              role: "status",
              children: "Loading playground\u2026",
            }),
            _jsx("div", {
              class: "pp-playground-static-fallback",
              dangerouslySetInnerHTML: { __html: fallbackHtml },
            }),
          ],
        }),
      ],
    });
  }
  return _jsxs("div", {
    class: "pp-playground-root",
    children: [
      _jsx("noscript", { dangerouslySetInnerHTML: { __html: fallbackHtml } }),
      _jsx(View, { ...props, initialFiles: resolved.files, initialEntry: resolved.entry }),
    ],
  });
}
/** Register global MDX components in the theme layout. */
export function createPlaygroundComponents(options = {}) {
  return {
    Playground: (props) => _jsx(Playground, { ...props, pluginOptions: options }),
  };
}
//# sourceMappingURL=mdx.js.map
