import type { PlaygroundPluginOptions } from "./types.js";
import type { PlaygroundProps } from "./types.js";
export interface PlaygroundComponentProps extends PlaygroundProps {
    pluginOptions?: PlaygroundPluginOptions;
}
/** MDX component for live Preact examples with an SSR-safe static fallback. */
export declare function Playground(props: PlaygroundComponentProps): import("preact").JSX.Element;
/** Register global MDX components in the theme layout. */
export declare function createPlaygroundComponents(options?: PlaygroundPluginOptions): {
    Playground: (props: PlaygroundProps) => import("preact").JSX.Element;
};
//# sourceMappingURL=mdx.d.ts.map