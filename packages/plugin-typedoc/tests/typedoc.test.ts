import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { generateApiReference } from "../src/extract/generate.js";
import { renderApiDocs } from "../src/render/markdown.js";
import { TypedocEntryError } from "../src/extract/validate.js";
import { slugifySegment } from "../src/render/slugs.js";

const fixtureRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../fixtures/sample-lib",
);

describe("generateApiReference", () => {
  it("extracts public symbols from a sample library", async () => {
    const result = await generateApiReference(
      { root: fixtureRoot, srcDir: fixtureRoot, cacheDir: path.join(fixtureRoot, ".cache") },
      {
        entries: ["src/index.ts", "src/geometry.ts"],
        output: "reference/api",
        tsconfig: "tsconfig.json",
        includePrivate: false,
        cache: false,
      },
    );

    const names = Object.values(result.manifest.symbols).map((symbol) => symbol.name);
    expect(names).toContain("add");
    expect(names).toContain("Calculator");
    expect(names).toContain("Operation");
    expect(names).toContain("Result");
    expect(names).toContain("NumericId");
    expect(names).toContain("distance");
    expect(names.some((name) => name.includes("secret"))).toBe(false);
  });

  it("renders markdown pages with JSDoc metadata", async () => {
    const result = await generateApiReference(
      { root: fixtureRoot, srcDir: fixtureRoot, cacheDir: path.join(fixtureRoot, ".cache") },
      {
        entries: ["src/index.ts"],
        output: "reference/api",
        tsconfig: "tsconfig.json",
        cache: false,
      },
    );

    const addPage = result.pages.find((page) => page.title === "add");
    expect(addPage?.markdown).toContain("First summand");
    expect(addPage?.markdown).toContain("Adds two numbers");
    expect(addPage?.markdown).toContain("Parameters");

    const calculator = Object.values(result.manifest.symbols).find(
      (symbol) => symbol.name === "Calculator",
    );
    expect(calculator?.deprecated).toContain("plain functions");
  });

  it("uses stable slugs across runs", async () => {
    const opts = {
      entries: ["src/index.ts"],
      output: "reference/api",
      tsconfig: "tsconfig.json",
      cache: false,
    };
    const first = await generateApiReference(
      { root: fixtureRoot, srcDir: fixtureRoot, cacheDir: path.join(fixtureRoot, ".cache-a") },
      opts,
    );
    const second = await generateApiReference(
      { root: fixtureRoot, srcDir: fixtureRoot, cacheDir: path.join(fixtureRoot, ".cache-b") },
      opts,
    );

    expect(Object.keys(first.manifest.symbols).sort()).toEqual(
      Object.keys(second.manifest.symbols).sort(),
    );
    expect(slugifySegment("Calculator")).toBe("calculator");
  });

  it("rejects invalid entry points with a clear error", async () => {
    await expect(
      generateApiReference(
        { root: fixtureRoot, srcDir: fixtureRoot, cacheDir: path.join(fixtureRoot, ".cache") },
        { entries: ["src/missing.ts"], cache: false },
      ),
    ).rejects.toBeInstanceOf(TypedocEntryError);
  });

  it("writes structured manifest data", async () => {
    const manifest = (
      await generateApiReference(
        { root: fixtureRoot, srcDir: fixtureRoot, cacheDir: path.join(fixtureRoot, ".cache") },
        {
          entries: ["src/index.ts"],
          output: "reference/api",
          tsconfig: "tsconfig.json",
          cache: false,
        },
      )
    ).manifest;

    expect(manifest.version).toBe(1);
    expect(manifest.tree.length).toBeGreaterThan(0);
    expect(manifest.baseRoute).toBe("/reference/api");
  });
});

describe("renderApiDocs", () => {
  it("creates an overview page and symbol routes", async () => {
    const result = await generateApiReference(
      { root: fixtureRoot, srcDir: fixtureRoot, cacheDir: path.join(fixtureRoot, ".cache") },
      {
        entries: ["src/index.ts"],
        output: "reference/api",
        tsconfig: "tsconfig.json",
        cache: false,
      },
    );
    const rendered = renderApiDocs(result.manifest);
    expect(rendered.pages.some((page) => page.route === "/reference/api")).toBe(true);
    expect(rendered.pages.some((page) => page.title === "add")).toBe(true);
  });
});
