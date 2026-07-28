import type { FunctionalComponent } from "preact";
import { useEffect, useState } from "preact/hooks";
import type { PlaygroundPluginOptions } from "./types.js";
import type { PlaygroundProps } from "./types.js";
import { resolvePlaygroundFiles } from "./files.js";
import { renderPlaygroundFallbackHtml } from "./static.js";
import type { PlaygroundViewProps } from "./PlaygroundView.js";

export interface PlaygroundComponentProps extends PlaygroundProps {
  pluginOptions?: PlaygroundPluginOptions;
}

/** MDX component for live Preact examples with an SSR-safe static fallback. */
export function Playground(props: PlaygroundComponentProps) {
  const resolved = resolvePlaygroundFiles(props);
  const fallbackHtml = renderPlaygroundFallbackHtml({
    files: resolved.files,
    entry: resolved.entry,
    title: props.title,
    readOnly: props.readOnly,
  });

  const [View, setView] = useState<FunctionalComponent<PlaygroundViewProps> | null>(null);

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
    return (
      <div class="pp-playground-root">
        <noscript dangerouslySetInnerHTML={{ __html: fallbackHtml }} />
        <div
          class="pp-playground pp-playground-loading"
          aria-busy="true"
          aria-label={props.title ?? "Preact playground"}
        >
          <div class="pp-playground-static-notice" role="status">
            Loading playground…
          </div>
          <div
            class="pp-playground-static-fallback"
            dangerouslySetInnerHTML={{ __html: fallbackHtml }}
          />
        </div>
      </div>
    );
  }

  return (
    <div class="pp-playground-root">
      <noscript dangerouslySetInnerHTML={{ __html: fallbackHtml }} />
      <View {...props} initialFiles={resolved.files} initialEntry={resolved.entry} />
    </div>
  );
}

/** Register global MDX components in the theme layout. */
export function createPlaygroundComponents(options: PlaygroundPluginOptions = {}) {
  return {
    Playground: (props: PlaygroundProps) => <Playground {...props} pluginOptions={options} />,
  };
}