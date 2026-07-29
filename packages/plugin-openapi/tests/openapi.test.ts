import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { generateOpenApiDocs } from "../src/extract/generate.js";
import { renderOpenApiDocs } from "../src/render/markdown.js";
import { OpenApiParseError } from "../src/extract/parse.js";
import { slugifySegment } from "@preactpress/plugin-typedoc";

const fixtureRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../fixtures/kamod-tasks",
);

describe("generateOpenApiDocs", () => {
  it("parses a realistic YAML OpenAPI 3.x spec with refs and security", async () => {
    const result = await generateOpenApiDocs(
      { root: fixtureRoot, srcDir: fixtureRoot, cacheDir: path.join(fixtureRoot, ".cache") },
      { input: "openapi.yaml", route: "/api", cache: false },
    );

    expect(result.manifest.info.title).toBe("Kamod Tasks API");
    expect(result.manifest.baseRoute).toBe("/api");
    expect(Object.keys(result.manifest.operations)).toContain("listProjects");
    expect(Object.keys(result.manifest.schemas)).toContain("Project");
    expect(result.manifest.securitySchemes.bearerAuth?.scheme).toBe("bearer");
    expect(result.manifest.tags.map((tag) => tag.name)).toEqual(
      expect.arrayContaining(["Projects", "Tasks", "Users"]),
    );
  });

  it("supports JSON input files", async () => {
    const result = await generateOpenApiDocs(
      { root: fixtureRoot, srcDir: fixtureRoot, cacheDir: path.join(fixtureRoot, ".cache-json") },
      { input: "openapi.json", route: "/api", cache: false },
    );

    expect(result.manifest.info.title).toBe("Health Check API");
    expect(Object.keys(result.manifest.operations)).toContain("getHealth");
  });

  it("renders endpoint pages with auth, parameters, examples, and code samples", async () => {
    const result = await generateOpenApiDocs(
      { root: fixtureRoot, srcDir: fixtureRoot, cacheDir: path.join(fixtureRoot, ".cache-render") },
      { input: "openapi.yaml", route: "/api", cache: false },
    );

    const listProjects = result.pages.find((page) => page.title === "GET /projects");
    expect(listProjects?.markdown).toContain("## Authentication");
    expect(listProjects?.markdown).toContain("bearerAuth");
    expect(listProjects?.markdown).toContain("## Query parameters");
    expect(listProjects?.markdown).toContain("### cURL");
    expect(listProjects?.markdown).toContain("### JavaScript");
    expect(listProjects?.markdown).toContain("### TypeScript");
    expect(listProjects?.markdown).toContain("| `401` |");

    const createTask = result.pages.find(
      (page) => page.title === "POST /projects/{projectId}/tasks",
    );
    expect(createTask?.markdown).toContain("## Request body");
    expect(createTask?.markdown).toContain("application/json");
  });

  it("renders schema pages with property tables and examples", async () => {
    const result = await generateOpenApiDocs(
      { root: fixtureRoot, srcDir: fixtureRoot, cacheDir: path.join(fixtureRoot, ".cache-schema") },
      { input: "openapi.yaml", route: "/api", cache: false },
    );

    const projectSchema = result.pages.find((page) => page.title === "Project");
    expect(projectSchema?.markdown).toContain("## Properties");
    expect(projectSchema?.markdown).toContain("`id`");
    expect(projectSchema?.markdown).toContain("## Example");
    expect(projectSchema?.markdown).toContain("```json");
  });

  it("uses stable slugs across runs", async () => {
    const opts = { input: "openapi.yaml", route: "/api", cache: false };
    const first = await generateOpenApiDocs(
      { root: fixtureRoot, srcDir: fixtureRoot, cacheDir: path.join(fixtureRoot, ".cache-a") },
      opts,
    );
    const second = await generateOpenApiDocs(
      { root: fixtureRoot, srcDir: fixtureRoot, cacheDir: path.join(fixtureRoot, ".cache-b") },
      opts,
    );

    expect(Object.keys(first.manifest.operations).sort()).toEqual(
      Object.keys(second.manifest.operations).sort(),
    );
    expect(slugifySegment("listProjects")).toBe("list-projects");
    expect(first.manifest.operations.listProjects?.route).toBe("/api/operations/list-projects");
  });

  it("creates overview, tag, and schema index pages", async () => {
    const result = await generateOpenApiDocs(
      { root: fixtureRoot, srcDir: fixtureRoot, cacheDir: path.join(fixtureRoot, ".cache-pages") },
      { input: "openapi.yaml", route: "/api", cache: false },
    );

    expect(result.pages.some((page) => page.route === "/api")).toBe(true);
    expect(result.pages.some((page) => page.route === "/api/schemas")).toBe(true);
    expect(result.pages.some((page) => page.route === "/api/tags/projects")).toBe(true);
    expect(result.pages.some((page) => page.route === "/api/operations/list-projects")).toBe(true);
  });

  it("rejects unsupported OpenAPI versions", async () => {
    await expect(
      generateOpenApiDocs(
        {
          root: fixtureRoot,
          srcDir: fixtureRoot,
          cacheDir: path.join(fixtureRoot, ".cache-invalid"),
        },
        { input: "openapi-v2.json", route: "/api", cache: false },
      ),
    ).rejects.toBeInstanceOf(OpenApiParseError);
  });
});

describe("renderOpenApiDocs", () => {
  it("re-renders pages from an existing manifest", async () => {
    const generated = await generateOpenApiDocs(
      {
        root: fixtureRoot,
        srcDir: fixtureRoot,
        cacheDir: path.join(fixtureRoot, ".cache-rerender"),
      },
      { input: "openapi.yaml", route: "/api", cache: false },
    );
    const rendered = renderOpenApiDocs(generated.manifest);
    expect(rendered.pages.length).toBe(generated.pages.length);
  });
});

describe("OpenApiParseError", () => {
  it("has a stable error name", () => {
    expect(new OpenApiParseError("bad spec").name).toBe("OpenApiParseError");
  });
});
