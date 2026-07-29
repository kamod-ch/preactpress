import { useMemo } from "preact/hooks";
import type { ComponentManifest } from "./types/index.js";
import { lookupComponent } from "./render/html.js";
import { ComponentReferenceView } from "./render/ComponentReferenceView.js";

export interface ComponentReferenceProps {
  component?: string;
  source?: string;
  exportName?: string;
  manifest?: ComponentManifest;
}

/** MDX component for documented Preact component props. */
export function ComponentReference(props: ComponentReferenceProps) {
  const entry = useMemo(() => {
    if (!props.manifest) return undefined;
    return lookupComponent(props.manifest, props);
  }, [props.manifest, props.component, props.source, props.exportName]);

  if (!props.manifest) {
    return (
      <p class="pp-component-reference-error" role="alert">
        Pass a generated manifest via <code>createComponentReferenceComponents(manifest)</code>.
      </p>
    );
  }

  if (!entry) {
    return (
      <p class="pp-component-reference-error" role="alert">
        Component reference not found for{" "}
        <code>{props.component ?? props.exportName ?? "unknown"}</code>.
      </p>
    );
  }

  return <ComponentReferenceView entry={entry} />;
}

/** Register global MDX components in the theme layout. */
export function createComponentReferenceComponents(manifest: ComponentManifest) {
  return {
    ComponentReference: (props: Omit<ComponentReferenceProps, "manifest">) => (
      <ComponentReference {...props} manifest={manifest} />
    ),
  };
}

export { ComponentReferenceView, PropsTable } from "./render/ComponentReferenceView.js";
