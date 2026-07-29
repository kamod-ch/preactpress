import type { ComponentManifest } from "./types/index.js";
export interface ComponentReferenceProps {
  component?: string;
  source?: string;
  exportName?: string;
  manifest?: ComponentManifest;
}
/** MDX component for documented Preact component props. */
export declare function ComponentReference(
  props: ComponentReferenceProps,
): import("preact").JSX.Element;
/** Register global MDX components in the theme layout. */
export declare function createComponentReferenceComponents(manifest: ComponentManifest): {
  ComponentReference: (
    props: Omit<ComponentReferenceProps, "manifest">,
  ) => import("preact").JSX.Element;
};
export { ComponentReferenceView, PropsTable } from "./render/ComponentReferenceView.js";
//# sourceMappingURL=mdx.d.ts.map
