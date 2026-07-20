import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { init, ensurePreactpressLinked } from "../src/node/init.js";
import { PACKAGE_ROOT } from "../src/node/packageRoot.js";

const PACKAGE_NAME = "@kamod-ch/preactpress";

describe("init", () => {
  it("links a file: devDependency when node_modules is missing", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "preactpress-link-"));
    try {
      const rel = path.relative(root, PACKAGE_ROOT);
      const spec = rel.startsWith(".") ? `file:${rel}` : `file:./${rel}`;
      await fs.writeFile(
        path.join(root, "package.json"),
        JSON.stringify({
          devDependencies: { [PACKAGE_NAME]: spec },
        }),
      );
      await ensurePreactpressLinked(root);
      const linked = await fs.readlink(path.join(root, "node_modules", "@kamod-ch", "preactpress"));
      expect(path.resolve(path.join(root, "node_modules", "@kamod-ch"), linked)).toBe(PACKAGE_ROOT);
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  });

  it("scaffolds the minimal starter without build artifacts or workspace deps", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "preactpress-init-"));
    try {
      const result = await init(root);

      await expect(fs.access(path.join(root, "index.md"))).resolves.toBeUndefined();
      await expect(fs.access(path.join(root, "README.md"))).resolves.toBeUndefined();
      await expect(
        fs.access(path.join(root, "guide", "first-five-minutes.md")),
      ).resolves.toBeUndefined();
      await expect(fs.access(path.join(root, "about.md"))).resolves.toBeUndefined();
      await expect(fs.access(path.join(root, "de"))).rejects.toThrow();
      await expect(fs.access(path.join(root, "interactive.mdx"))).rejects.toThrow();
      await expect(
        fs.access(path.join(root, ".preactpress", "config.ts")),
      ).resolves.toBeUndefined();
      await expect(fs.access(path.join(root, "dist"))).rejects.toThrow();
      const linked = await fs.readlink(path.join(root, "node_modules", "@kamod-ch", "preactpress"));
      expect(path.resolve(path.join(root, "node_modules", "@kamod-ch"), linked)).toBe(PACKAGE_ROOT);
      await expect(fs.access(path.join(root, "pnpm-lock.yaml"))).rejects.toThrow();

      const pkg = JSON.parse(await fs.readFile(path.join(root, "package.json"), "utf8")) as {
        devDependencies: Record<string, string>;
      };
      const toolPkg = JSON.parse(
        await fs.readFile(path.join(PACKAGE_ROOT, "package.json"), "utf8"),
      ) as { version: string };

      expect(pkg.devDependencies[PACKAGE_NAME]).toBe(`^${toolPkg.version}`);
      expect(pkg.devDependencies.preactpress).toBeUndefined();
      expect(result.preactpressVersion).toBe(toolPkg.version);
      expect(result.root).toBe(root);
      expect(result.template).toBe("default");
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  });

  it("scaffolds the docs template on request", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "preactpress-init-docs-"));
    try {
      const result = await init(root, { template: "docs" });

      await expect(fs.access(path.join(root, "de", "index.md"))).resolves.toBeUndefined();
      await expect(fs.access(path.join(root, "interactive.mdx"))).resolves.toBeUndefined();
      await expect(fs.access(path.join(root, "markdown-examples.md"))).resolves.toBeUndefined();

      const pkg = JSON.parse(await fs.readFile(path.join(root, "package.json"), "utf8")) as {
        devDependencies: Record<string, string>;
      };
      const toolPkg = JSON.parse(
        await fs.readFile(path.join(PACKAGE_ROOT, "package.json"), "utf8"),
      ) as { version: string };

      expect(pkg.devDependencies[PACKAGE_NAME]).toBe(`^${toolPkg.version}`);
      expect(result.preactpressVersion).toBe(toolPkg.version);
      expect(result.root).toBe(root);
      expect(result.template).toBe("docs");
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  });

  it("scaffolds the hono template on request", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "preactpress-init-hono-"));
    try {
      const result = await init(root, { template: "hono" });

      await expect(fs.access(path.join(root, "index.mdx"))).resolves.toBeUndefined();
      await expect(fs.access(path.join(root, "de", "index.mdx"))).resolves.toBeUndefined();
      await expect(
        fs.access(path.join(root, ".preactpress", "theme", "Layout.tsx")),
      ).resolves.toBeUndefined();
      await expect(
        fs.access(path.join(root, ".preactpress", "theme", "hono.css")),
      ).resolves.toBeUndefined();
      const linked = await fs.readlink(path.join(root, "node_modules", "@kamod-ch", "preactpress"));
      expect(path.resolve(path.join(root, "node_modules", "@kamod-ch"), linked)).toBe(PACKAGE_ROOT);
      await expect(fs.access(path.join(root, "pnpm-lock.yaml"))).rejects.toThrow();

      const pkg = JSON.parse(await fs.readFile(path.join(root, "package.json"), "utf8")) as {
        devDependencies: Record<string, string>;
      };
      const toolPkg = JSON.parse(
        await fs.readFile(path.join(PACKAGE_ROOT, "package.json"), "utf8"),
      ) as { version: string };

      expect(pkg.devDependencies[PACKAGE_NAME]).toBe(`^${toolPkg.version}`);
      expect(result.preactpressVersion).toBe(toolPkg.version);
      expect(result.root).toBe(root);
      expect(result.template).toBe("hono");
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  });

  it("scaffolds the magazine template on request", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "preactpress-init-magazine-"));
    try {
      const result = await init(root, { template: "magazine" });

      await expect(fs.access(path.join(root, "index.mdx"))).resolves.toBeUndefined();
      await expect(fs.access(path.join(root, "index.data.ts"))).resolves.toBeUndefined();
      await expect(fs.access(path.join(root, "article-tech.mdx"))).resolves.toBeUndefined();
      await expect(
        fs.access(path.join(root, ".preactpress", "theme", "Layout.tsx")),
      ).resolves.toBeUndefined();
      await expect(
        fs.access(path.join(root, ".preactpress", "theme", "magazine.css")),
      ).resolves.toBeUndefined();
      await expect(fs.access(path.join(root, "README.md"))).resolves.toBeUndefined();
      const linked = await fs.readlink(path.join(root, "node_modules", "@kamod-ch", "preactpress"));
      expect(path.resolve(path.join(root, "node_modules", "@kamod-ch"), linked)).toBe(PACKAGE_ROOT);
      await expect(fs.access(path.join(root, "pnpm-lock.yaml"))).rejects.toThrow();

      const pkg = JSON.parse(await fs.readFile(path.join(root, "package.json"), "utf8")) as {
        devDependencies: Record<string, string>;
      };
      const toolPkg = JSON.parse(
        await fs.readFile(path.join(PACKAGE_ROOT, "package.json"), "utf8"),
      ) as { version: string };

      expect(pkg.devDependencies[PACKAGE_NAME]).toBe(`^${toolPkg.version}`);
      expect(result.preactpressVersion).toBe(toolPkg.version);
      expect(result.root).toBe(root);
      expect(result.template).toBe("magazine");
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  });

  it("scaffolds the documentation-focused starters", async () => {
    const cases: Array<{
      template: "blog" | "product-docs" | "api-docs" | "saas-docs" | "knowledge-base";
      marker: string;
    }> = [
      { template: "blog", marker: "posts/introducing-preactpress.md" },
      { template: "product-docs", marker: "getting-started.md" },
      { template: "api-docs", marker: "functions/create-client.mdx" },
      { template: "saas-docs", marker: "docs/welcome.md" },
      { template: "knowledge-base", marker: "getting-started/welcome.md" },
    ];
    for (const { template, marker } of cases) {
      const root = await fs.mkdtemp(path.join(os.tmpdir(), `preactpress-init-${template}-`));
      try {
        const result = await init(root, { template });
        expect(result.template).toBe(template);
        await expect(fs.access(path.join(root, marker))).resolves.toBeUndefined();
        await expect(
          fs.access(path.join(root, ".preactpress", "config.ts")),
        ).resolves.toBeUndefined();
      } finally {
        await fs.rm(root, { recursive: true, force: true });
      }
    }
  });
});
