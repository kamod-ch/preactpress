import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { check } from "../src/node/check.js";
import { resolveConfig } from "../src/node/config.js";
import {
  buildCheckStats,
  computeCheckScore,
} from "../src/node/checkTypes.js";
import { formatCheckJson, resolveCheckExitCode } from "../src/node/checkOutput.js";

const PAGE = `---
title: Test page
description: Test description
---

`;

async function makeSite(config: string): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "preactpress-check-"));
  await fs.mkdir(path.join(root, ".preactpress"), { recursive: true });
  await fs.writeFile(path.join(root, ".preactpress", "config.ts"), config, "utf8");
  return root;
}

function messages(result: Awaited<ReturnType<typeof check>>): string[] {
  return result.issues.map((issue) => issue.message);
}

describe("check", () => {
  it("reports missing nav/sidebar and markdown links", async () => {
    const root = await makeSite(`export default {
      site: { description: 'Test site' },
      themeConfig: {
        nav: [{ text: 'Missing', link: '/missing' }],
        sidebar: [{ items: [{ text: 'Home', link: '/' }] }]
      }
    }`);
    try {
      await fs.writeFile(path.join(root, "index.md"), `${PAGE}[Broken](./missing.md)\n`, "utf8");
      const result = await check(root);

      expect(result.routes).toEqual(["/"]);
      expect(messages(result)).toEqual([
        'nav item "Missing" points to missing route /missing (/missing)',
        "index.md links to missing page ./missing.md (/missing)",
      ]);
      expect(result.stats.brokenLinks).toBe(2);
      expect(result.score).toBe(computeCheckScore(result.errors, result.warnings));
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  });

  it("validates locale roots and locale-specific nav links", async () => {
    const root = await makeSite(`export default {
      site: { description: 'Test site' },
      locales: {
        root: { label: 'English', lang: 'en', themeConfig: { nav: [{ text: 'Home', link: '/' }] } },
        de: { label: 'Deutsch', lang: 'de', themeConfig: { nav: [{ text: 'Fehlt', link: '/de/missing' }] } }
      }
    }`);
    try {
      await fs.writeFile(path.join(root, "index.md"), `${PAGE}# Home\n`, "utf8");
      const result = await check(root);

      expect(messages(result)).toEqual([
        "missing locale root page: add de/index.md or de/index.mdx",
        'de nav item "Fehlt" points to missing route /de/missing (/de/missing)',
        'locale "de" is missing translation for route key /',
      ]);
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  });

  it("warns about unknown page layouts", async () => {
    const root = await makeSite(`export default {
      site: { description: 'Test site' },
      themeConfig: { nav: [{ text: 'Home', link: '/' }] }
    }`);
    try {
      await fs.writeFile(
        path.join(root, "index.md"),
        `---
title: Home
description: Home page
layout: splash
---

# Home
`,
        "utf8",
      );
      const result = await check(root);

      expect(messages(result)).toEqual([
        'index.md uses unknown layout "splash" (expected doc, home, page)',
      ]);
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  });

  it("respects ignoreDeadLinks patterns", async () => {
    const root = await makeSite(`export default {
      site: { description: 'Test site' },
      ignoreDeadLinks: ['/missing', '/wip/*']
    }`);
    try {
      await fs.writeFile(
        path.join(root, "index.md"),
        `${PAGE}[Wip](/wip/page.md)\n[Missing](/missing.md)\n[Broken](/broken.md)\n`,
        "utf8",
      );
      const result = await check(root);

      expect(messages(result)).toEqual(["index.md links to missing page /broken.md (/broken)"]);
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  });

  it("checks home frontmatter placement and links", async () => {
    const root = await makeSite(`export default {
      site: { description: 'Test site' }
    }`);
    try {
      await fs.writeFile(
        path.join(root, "index.md"),
        `---
title: Home
description: Home page
layout: page
hero:
  text: Custom
  actions:
    - text: Missing
      link: /missing
features:
  - title: Feature
    details: Broken link
    link: /missing-feature
---

# Home
`,
        "utf8",
      );
      const result = await check(root);

      expect(messages(result)).toEqual([
        'index.md hero action "Missing" points to missing route /missing (/missing)',
        'index.md feature "Feature" points to missing route /missing-feature (/missing-feature)',
        'index.md defines home-only frontmatter (hero/features) on layout "page"',
      ]);
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  });

  it("rejects redirect loops when resolving config", async () => {
    const root = await makeSite(`export default {
      site: { description: 'Test site' },
      redirects: [
        { from: '/a', to: '/b' },
        { from: '/b', to: '/a' }
      ]
    }`);
    try {
      await fs.writeFile(path.join(root, "index.md"), `${PAGE}# Home\n`, "utf8");
      await expect(resolveConfig(root)).rejects.toThrow(/redirect loop/);
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  });

  it("warns about missing redirect targets during check", async () => {
    const root = await makeSite(`export default {
      site: { description: 'Test site' },
      redirects: {
        '/old-guide': '/guide/missing'
      }
    }`);
    try {
      await fs.writeFile(path.join(root, "index.md"), `${PAGE}# Home\n`, "utf8");
      const result = await check(root);
      expect(result.warnings.some((issue) => issue.code === "invalid-redirect")).toBe(true);
      expect(result.errors.some((issue) => issue.code === "invalid-redirect")).toBe(false);
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  });

  it("flags missing metadata and duplicate heading ids", async () => {
    const root = await makeSite(`export default {
      site: { description: 'Test site' },
      themeConfig: { nav: [{ text: 'Home', link: '/' }] }
    }`);
    try {
      await fs.writeFile(path.join(root, "index.md"), `${PAGE}# Home\n`, "utf8");
      await fs.writeFile(
        path.join(root, "guide.md"),
        `---
title: Guide
---

## Section {#dup}
## Another {#dup}
`,
        "utf8",
      );
      const result = await check(root);
      expect(result.warnings.some((issue) => issue.code === "missing-description")).toBe(true);
      expect(result.warnings.some((issue) => issue.code === "duplicate-heading-id")).toBe(true);
      expect(result.stats.missingMetadata).toBeGreaterThan(0);
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  });

  it("marks orphan and unreachable pages", async () => {
    const root = await makeSite(`export default {
      site: { description: 'Test site' },
      themeConfig: { nav: [{ text: 'Home', link: '/' }] }
    }`);
    try {
      await fs.writeFile(path.join(root, "index.md"), `${PAGE}# Home\n`, "utf8");
      await fs.writeFile(
        path.join(root, "hidden.md"),
        `---
title: Hidden
description: Hidden page
---

# Hidden
`,
        "utf8",
      );
      const result = await check(root);
      expect(result.warnings.some((issue) => issue.code === "orphan-page")).toBe(true);
      expect(result.warnings.some((issue) => issue.code === "unreachable-page")).toBe(true);
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  });

  it("produces stable JSON output", async () => {
    const root = await makeSite(`export default {
      site: { description: 'Test site' },
      themeConfig: { nav: [{ text: 'Home', link: '/' }] }
    }`);
    try {
      await fs.writeFile(path.join(root, "index.md"), `${PAGE}# Home\n`, "utf8");
      const result = await check(root);
      const json = JSON.parse(formatCheckJson(result));
      expect(json).toMatchObject({
        score: expect.any(Number),
        errors: expect.any(Array),
        warnings: expect.any(Array),
        stats: expect.objectContaining({
          errors: result.errors.length,
          warnings: result.warnings.length,
        }),
        routes: ["/"],
      });
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  });

  it("uses strict mode exit code semantics", async () => {
    const warnings = [{ level: "warning" as const, code: "missing-title" as const, message: "x" }];
    expect(resolveCheckExitCode({ errors: [], warnings, score: 90, stats: buildCheckStats([], warnings), routes: [] }, {})).toBe(0);
    expect(resolveCheckExitCode({ errors: [], warnings, score: 90, stats: buildCheckStats([], warnings), routes: [] }, { strict: true })).toBe(1);
  });
});
