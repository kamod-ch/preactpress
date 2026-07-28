import type { ApiManifest, ApiSymbol, ApiTypeRef } from "../types/index.js";
/** Resolve cross-links inside type strings and descriptions. */
export declare function linkifyTypeText(text: string, manifest: ApiManifest, currentRoute: string): string;
export declare function renderTypeRef(type: ApiTypeRef | undefined, manifest: ApiManifest, route: string): string;
export declare function relativeHref(fromRoute: string, toRoute: string): string;
export declare function symbolAnchor(symbol: ApiSymbol): string;
//# sourceMappingURL=links.d.ts.map