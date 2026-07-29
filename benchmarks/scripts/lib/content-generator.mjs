import { createHash } from "node:crypto";

/** Fixed seed for reproducible benchmark content across runs and machines. */
export const CONTENT_SEED = 0x707072657373;

/** Mulberry32 PRNG — deterministic, fast, good enough for fixture text. */
export function createRng(seed = CONTENT_SEED) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const WORDS = [
  "preact",
  "vite",
  "markdown",
  "static",
  "documentation",
  "search",
  "navigation",
  "sidebar",
  "outline",
  "performance",
  "benchmark",
  "content",
  "render",
  "build",
  "cache",
  "index",
  "route",
  "page",
  "section",
  "chapter",
];

export function seededParagraph(rng, wordCount = 40) {
  const words = [];
  for (let i = 0; i < wordCount; i += 1) {
    words.push(WORDS[Math.floor(rng() * WORDS.length)]);
  }
  return words.join(" ");
}

export function pagePath(sectionIndex, pageIndex) {
  const section = String(sectionIndex).padStart(3, "0");
  const page = String(pageIndex).padStart(4, "0");
  return `docs/section-${section}/page-${page}.md`;
}

export function pageRoute(sectionIndex, pageIndex) {
  const section = String(sectionIndex).padStart(3, "0");
  const page = String(pageIndex).padStart(4, "0");
  return `/docs/section-${section}/page-${page}`;
}

export function buildPageMarkdown(sectionIndex, pageIndex, rng) {
  const title = `Section ${sectionIndex} Page ${pageIndex}`;
  const description = `Benchmark page ${sectionIndex}-${pageIndex} for PreactPress scaling tests.`;
  const p1 = seededParagraph(rng, 35);
  const p2 = seededParagraph(rng, 35);
  const codeLang = rng() > 0.5 ? "ts" : "bash";
  const codeBody =
    codeLang === "ts"
      ? `export function example${sectionIndex}_${pageIndex}() {\n  return ${Math.floor(rng() * 1000)};\n}`
      : `echo "section-${sectionIndex}-page-${pageIndex}"`;

  return `---
title: ${title}
description: ${description}
tags:
  - benchmark
  - section-${sectionIndex}
---

# ${title}

${p1}

## Details

${p2}

\`\`\`${codeLang}
${codeBody}
\`\`\`

## Related

See also [home](/) and section ${sectionIndex} overview.
`;
}

/**
 * Distribute pageCount across sections (~100 pages per section).
 * Returns array of [sectionIndex, pageIndex] pairs (1-based).
 */
export function distributePages(pageCount) {
  const pagesPerSection = 100;
  const sectionCount = Math.ceil(pageCount / pagesPerSection);
  const pairs = [];
  let remaining = pageCount;
  for (let s = 1; s <= sectionCount && remaining > 0; s += 1) {
    const count = Math.min(pagesPerSection, remaining);
    for (let p = 1; p <= count; p += 1) {
      pairs.push([s, p]);
    }
    remaining -= count;
  }
  return pairs;
}

export function contentFingerprint(pageCount) {
  return createHash("sha256").update(`${CONTENT_SEED}:${pageCount}`).digest("hex").slice(0, 16);
}
