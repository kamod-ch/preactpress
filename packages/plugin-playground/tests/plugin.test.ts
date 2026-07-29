import { describe, expect, it } from "vitest";
import { resolvePlaygroundFiles, serializeFilesForDisplay } from "../src/files.js";
import {
  createDependencyContext,
  resolveImportMap,
  findDisallowedImports,
} from "../src/dependencies.js";
import { renderPlaygroundFallbackHtml, escapeHtml } from "../src/static.js";
import { playgroundPlugin } from "../src/index.js";

describe("resolvePlaygroundFiles", () => {
  it("uses code prop as a single virtual file", () => {
    const state = resolvePlaygroundFiles({ code: "export default () => null" });
    expect(state.entry).toBe("/App.tsx");
    expect(state.files["/App.tsx"]).toContain("export default");
  });

  it("normalizes multi-file paths and resolves entry", () => {
    const state = resolvePlaygroundFiles({
      files: {
        "App.tsx": "export { Demo } from './components.tsx'",
        "/components.tsx": "export const Demo = () => null",
      },
      entry: "App.tsx",
    });
    expect(state.entry).toBe("/App.tsx");
    expect(state.files["/components.tsx"]).toBeTruthy();
  });
});

describe("resolveImportMap", () => {
  it("includes core preact imports", () => {
    const ctx = createDependencyContext();
    const { imports, errors } = resolveImportMap({}, ctx);
    expect(errors).toEqual([]);
    expect(imports.preact).toContain("esm.sh");
    expect(imports["preact/hooks"]).toContain("esm.sh");
  });

  it("rejects packages outside the allowlist", () => {
    const ctx = createDependencyContext();
    const { errors } = resolveImportMap({ lodash: "4.17.21" }, ctx);
    expect(errors[0]).toContain("allowlist");
  });

  it("maps workspace packages when configured", () => {
    const ctx = createDependencyContext({
      workspacePackages: { "@kamod/ui": "https://esm.sh/example" },
      dependencyAllowlist: [
        "@kamod/ui",
        "preact",
        "preact/hooks",
        "preact/jsx-runtime",
        "preact/compat",
        "@preact/signals",
        "@preact/signals-core",
      ],
    });
    const { imports, errors } = resolveImportMap({ "@kamod/ui": "workspace" }, ctx);
    expect(errors).toEqual([]);
    expect(imports["@kamod/ui"]).toBe("https://esm.sh/example");
  });
});

describe("findDisallowedImports", () => {
  it("flags unknown external packages", () => {
    const ctx = createDependencyContext();
    const violations = findDisallowedImports(
      'import foo from "lodash"',
      new Set(["/App.tsx"]),
      ctx,
    );
    expect(violations[0]).toContain("lodash");
  });
});

describe("renderPlaygroundFallbackHtml", () => {
  it("escapes HTML in static output", () => {
    const html = renderPlaygroundFallbackHtml({
      files: { "/App.tsx": "<script>alert(1)</script>" },
      entry: "/App.tsx",
    });
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>alert");
    expect(html).toContain("pp-playground-static");
  });
});

describe("escapeHtml", () => {
  it("escapes special characters", () => {
    expect(escapeHtml(`a & b <c> "d"`)).toBe("a &amp; b &lt;c&gt; &quot;d&quot;");
  });
});

describe("serializeFilesForDisplay", () => {
  it("joins multi-file sources with path comments", () => {
    const text = serializeFilesForDisplay({ "/App.tsx": "a", "/components.tsx": "b" }, "/App.tsx");
    expect(text).toContain("// /App.tsx");
    expect(text).toContain("// /components.tsx");
  });
});

describe("playgroundPlugin", () => {
  it("registers a client module", () => {
    expect(playgroundPlugin().client).toBe("@preactpress/plugin-playground/client");
  });
});
