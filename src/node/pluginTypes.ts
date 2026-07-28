import type { Logger } from "vite";
import type { PageView } from "../client/types.js";
import type { HeadTag, ResolvedConfig, UserConfig } from "./siteConfig.js";
import type { ContentKind } from "./content.js";

/** Additional head tags contributed by plugins. Same tuple shape as {@link HeadTag}. */
export type HeadEntry = HeadTag;

/** Page payload passed to plugin hooks. Matches the internal {@link PageView} shape. */
export type PageData = PageView;

export interface RouteDefinition {
  route: string;
  file: string;
  kind: ContentKind;
}

export interface PluginContext {
  /** Resolved site configuration. Treat as read-only unless documented otherwise. */
  config: ResolvedConfig;
  root: string;
  outDir: string;
  logger: Logger;
  command: "serve" | "build";
  mode: string;
}

export interface MarkdownTransformContext extends PluginContext {
  route: string;
  file: string;
}

/** Context passed to {@link PreactPressPlugin.transformFence}. */
export type FenceTransformContext = MarkdownTransformContext;

/** Client-side enhancement registered by a plugin (resolved from {@link PreactPressPlugin.client}). */
export interface ClientPlugin {
  /** Called after page content updates (initial load, navigation, hydration). */
  enhanceContent?(): void | Promise<void>;
}

export interface BuildResult {
  routes: string[];
  pages: Array<{ route: string; page: PageData }>;
  outDir: string;
}

export interface PreactPressPlugin {
  name: string;
  enforce?: "pre" | "post";

  config?(config: UserConfig): UserConfig | void | Promise<UserConfig | void>;

  configResolved?(config: ResolvedConfig): void | Promise<void>;

  buildStart?(context: PluginContext): void | Promise<void>;

  extendRoutes?(
    routes: RouteDefinition[],
    context: PluginContext,
  ): RouteDefinition[] | void | Promise<RouteDefinition[] | void>;

  transformMarkdown?(
    source: string,
    context: MarkdownTransformContext,
  ): string | void | Promise<string | void>;

  /**
   * Render a fenced code block for a language this plugin handles.
   * Return HTML to replace the default Shiki output; return `undefined` to defer.
   */
  transformFence?(
    lang: string,
    code: string,
    meta: string,
    context: FenceTransformContext,
  ): string | void | Promise<string | void>;

  /** Package subpath or absolute path to the client enhancement module. */
  client?: string;

  transformPageData?(
    page: PageData,
    context: PluginContext & { route: string },
  ): PageData | void | Promise<PageData | void>;

  extendHead?(
    page: PageData,
    context: PluginContext & { route: string },
  ): HeadEntry[] | void | Promise<HeadEntry[] | void>;

  buildEnd?(result: BuildResult, context: PluginContext): void | Promise<void>;
}

export class PluginError extends Error {
  readonly pluginName: string;

  constructor(pluginName: string, message: string, options?: { cause?: unknown }) {
    super(`preactpress plugin "${pluginName}": ${message}`, options);
    this.name = "PluginError";
    this.pluginName = pluginName;
  }
}
