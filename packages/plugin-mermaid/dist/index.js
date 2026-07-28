import { renderMermaidFenceHtml } from "./fence.js";
const MERMAID_FENCE_RE = /^([ \t]*```)[ \t]*mermaid[ \t]*$/gim;
/** Official PreactPress plugin for Mermaid diagram blocks. */
export function mermaidPlugin(options = {}) {
    const languages = new Set((options.languages ?? ["mermaid"]).map((lang) => lang.toLowerCase()));
    return {
        name: "preactpress:mermaid",
        client: "@preactpress/plugin-mermaid/client",
        transformMarkdown(source) {
            return source.replace(MERMAID_FENCE_RE, "$1mermaid");
        },
        transformFence(lang, code) {
            if (!languages.has(lang.toLowerCase()))
                return undefined;
            return renderMermaidFenceHtml(code);
        },
    };
}
export { renderMermaidFenceHtml } from "./fence.js";
//# sourceMappingURL=index.js.map