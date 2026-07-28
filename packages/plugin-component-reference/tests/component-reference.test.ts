import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { extractComponentEntry } from "../src/extract/typescript.js";
import { renderComponentReferenceHtml, lookupComponent } from "../src/render/html.js";
import { buildComponentManifest } from "../src/extract/generate.js";

const fixtureRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../fixtures/ui-kit");

describe("extractComponentEntry", () => {
  it("extracts Button props including union and inherited attributes", () => {
    const entry = extractComponentEntry({
      root: fixtureRoot,
      source: "src/Button.tsx",
      exportName: "Button",
      tsconfig: "tsconfig.json",
    });

    expect(entry.props.some((prop) => prop.name === "variant")).toBe(true);
    expect(entry.props.some((prop) => prop.name === "disabled")).toBe(true);
    expect(entry.props.some((prop) => prop.name === "children")).toBe(true);
    expect(entry.props.some((prop) => prop.name === "href")).toBe(true);
    expect(entry.props.find((prop) => prop.name === "variant")?.type).toContain("ButtonVariant");
    expect(entry.props.find((prop) => prop.name === "variant")?.description).toContain("Visual style");
  });

  it("extracts Input props with defaults and HTML attributes", () => {
    const entry = extractComponentEntry({
      root: fixtureRoot,
      source: "src/Input.tsx",
      exportName: "Input",
      tsconfig: "tsconfig.json",
    });

    expect(entry.props.find((prop) => prop.name === "disabled")?.defaultValue).toBe("false");
    expect(entry.props.find((prop) => prop.name === "placeholder")).toBeTruthy();
  });

  it("extracts Dialog compound exports", () => {
    const dialog = extractComponentEntry({
      root: fixtureRoot,
      source: "src/Dialog.tsx",
      exportName: "Dialog",
      tsconfig: "tsconfig.json",
    });
    expect(dialog.props.some((prop) => prop.name === "open")).toBe(true);
  });
});

describe("renderComponentReferenceHtml", () => {
  it("renders searchable prop anchors", () => {
    const entry = extractComponentEntry({
      root: fixtureRoot,
      source: "src/Button.tsx",
      exportName: "Button",
      tsconfig: "tsconfig.json",
    });
    const html = renderComponentReferenceHtml(entry);
    expect(html).toContain('id="prop-variant"');
    expect(html).toContain("Visual style");
    expect(html).toContain("<table");
  });
});

describe("buildComponentManifest", () => {
  it("builds a catalog manifest for multiple components", async () => {
    const manifest = await buildComponentManifest({
      root: fixtureRoot,
      configDir: path.join(fixtureRoot, ".preactpress"),
      tsconfig: "tsconfig.json",
      catalog: [
        { component: "Button", source: "src/Button.tsx", exportName: "Button" },
        { component: "Input", source: "src/Input.tsx", exportName: "Input" },
      ],
    });

    expect(lookupComponent(manifest, { component: "Button" })).toBeTruthy();
    expect(lookupComponent(manifest, { component: "Input" })).toBeTruthy();
  });
});
