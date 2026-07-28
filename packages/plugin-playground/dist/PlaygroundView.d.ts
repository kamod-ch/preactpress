import type { PlaygroundPluginOptions } from "./types.js";
import type { PlaygroundFiles, PlaygroundProps } from "./types.js";
export interface PlaygroundViewProps extends PlaygroundProps {
    pluginOptions?: PlaygroundPluginOptions;
    /** Resolved initial files passed from the MDX wrapper. */
    initialFiles?: PlaygroundFiles;
    initialEntry?: string;
}
export declare function PlaygroundView(props: PlaygroundViewProps): import("preact").JSX.Element;
//# sourceMappingURL=PlaygroundView.d.ts.map