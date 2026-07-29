/** Local file path or explicitly configured remote URL. */
export type OpenApiInput =
  | string
  | {
      url: string;
      headers?: Record<string, string>;
    };
export interface LoadedSpec {
  source: string;
  raw: string;
  format: "json" | "yaml";
}
export declare function loadSpec(root: string, input: OpenApiInput): Promise<LoadedSpec>;
export declare function computeInputHash(root: string, input: OpenApiInput): Promise<string>;
//# sourceMappingURL=load.d.ts.map
