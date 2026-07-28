import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
import { useMemo } from "preact/hooks";
import { lookupComponent } from "./render/html.js";
import { ComponentReferenceView } from "./render/ComponentReferenceView.js";
/** MDX component for documented Preact component props. */
export function ComponentReference(props) {
    const entry = useMemo(() => {
        if (!props.manifest)
            return undefined;
        return lookupComponent(props.manifest, props);
    }, [props.manifest, props.component, props.source, props.exportName]);
    if (!props.manifest) {
        return (_jsxs("p", { class: "pp-component-reference-error", role: "alert", children: ["Pass a generated manifest via ", _jsx("code", { children: "createComponentReferenceComponents(manifest)" }), "."] }));
    }
    if (!entry) {
        return (_jsxs("p", { class: "pp-component-reference-error", role: "alert", children: ["Component reference not found for", " ", _jsx("code", { children: props.component ?? props.exportName ?? "unknown" }), "."] }));
    }
    return _jsx(ComponentReferenceView, { entry: entry });
}
/** Register global MDX components in the theme layout. */
export function createComponentReferenceComponents(manifest) {
    return {
        ComponentReference: (props) => (_jsx(ComponentReference, { ...props, manifest: manifest })),
    };
}
export { ComponentReferenceView, PropsTable } from "./render/ComponentReferenceView.js";
//# sourceMappingURL=mdx.js.map