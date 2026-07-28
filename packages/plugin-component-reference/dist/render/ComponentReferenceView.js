import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "preact/jsx-runtime";
function propAnchor(name) {
    return `prop-${name.replace(/[^a-zA-Z0-9_-]+/g, "-").toLowerCase()}`;
}
function PropRow({ prop }) {
    return (_jsxs("tr", { id: propAnchor(prop.name), children: [_jsx("td", { children: _jsx("code", { children: prop.name }) }), _jsx("td", { children: _jsx("code", { children: prop.type }) }), _jsx("td", { children: _jsx("code", { children: prop.defaultValue ?? "—" }) }), _jsx("td", { children: prop.required ? "Yes" : "No" }), _jsxs("td", { children: [prop.description, prop.deprecated ? (_jsxs(_Fragment, { children: [" ", _jsx("strong", { children: "Deprecated:" }), " ", prop.deprecated] })) : null, prop.inheritedFrom ? (_jsxs(_Fragment, { children: [" ", _jsxs("em", { children: ["From ", _jsx("code", { children: prop.inheritedFrom })] })] })) : null] })] }));
}
export function PropsTable({ entry }) {
    return (_jsx("div", { class: "pp-table-wrap", children: _jsxs("table", { class: "pp-component-props", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Prop" }), _jsx("th", { children: "Type" }), _jsx("th", { children: "Default" }), _jsx("th", { children: "Required" }), _jsx("th", { children: "Description" })] }) }), _jsx("tbody", { children: entry.props.map((prop) => (_jsx(PropRow, { prop: prop }, prop.name))) })] }) }));
}
export function ComponentReferenceView({ entry }) {
    return (_jsxs("section", { class: "pp-component-reference", "aria-labelledby": `component-${entry.name}`, children: [_jsx("h3", { id: `component-${entry.name}`, children: entry.name }), entry.description ? _jsx("p", { class: "pp-component-description", children: entry.description }) : null, entry.source ? (_jsxs("p", { class: "pp-component-source", children: [entry.source.url ? (_jsx("a", { href: entry.source.url, children: "View source" })) : ("Source:"), " ", _jsxs("code", { children: [entry.source.file, ":", entry.source.line] })] })) : null, _jsx(PropsTable, { entry: entry }), entry.examples?.map((example, index) => (_jsxs("div", { children: [_jsxs("h4", { class: "pp-component-example-title", children: ["Example ", index + 1] }), _jsx("pre", { class: "pp-component-example", children: _jsx("code", { children: example }) })] }, index)))] }));
}
//# sourceMappingURL=ComponentReferenceView.js.map