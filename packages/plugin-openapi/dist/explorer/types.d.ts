import type { HttpMethod, OpenApiManifest, OpenApiOperation } from "../types/index.js";
/** Prepared request shape for a future interactive API explorer. */
export interface ExplorerRequest {
  operationId: string;
  method: HttpMethod;
  path: string;
  serverUrl?: string;
  pathParams?: Record<string, string>;
  query?: Record<string, string | string[]>;
  headers?: Record<string, string>;
  body?: unknown;
}
/** Prepared response shape for a future interactive API explorer. */
export interface ExplorerResponse {
  status: number;
  headers: Record<string, string>;
  body: unknown;
}
/**
 * Hook surface reserved for a future interactive API explorer.
 * The MVP documents endpoints only; execution is intentionally disabled.
 */
export interface OpenApiExplorerAdapter {
  /** Whether live requests are permitted in the current environment. */
  readonly enabled: boolean;
  /** Resolve the operation record for an explorer panel. */
  resolveOperation?(manifest: OpenApiManifest, operationId: string): OpenApiOperation | undefined;
  /** Execute a request against a configured server (not implemented in MVP). */
  execute?(request: ExplorerRequest): Promise<ExplorerResponse>;
}
/** Default no-op explorer adapter shipped with the plugin. */
export declare const disabledExplorerAdapter: OpenApiExplorerAdapter;
//# sourceMappingURL=types.d.ts.map
