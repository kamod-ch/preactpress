/** @jsx h */
import { h } from "preact";
import { Counter } from "./Counter.tsx";

type TokenKind =
  | "keyword"
  | "plain"
  | "string"
  | "heading"
  | "component"
  | "number"
  | "attr"
  | "fn";

type SourcePart = { kind: TokenKind; text: string };

type SourceLine = {
  line: number;
  parts: SourcePart[];
  active?: boolean;
};

const MDX_TAB_ID = "pp-mkt-demo-mdx";
const COUNTER_TAB_ID = "pp-mkt-demo-counter";
const DEMO_FILE_GROUP = "pp-mkt-demo-file";

function plainLine(line: number, text: string): SourceLine {
  return { line, parts: text ? [{ kind: "plain", text }] : [] };
}

const mdxSourceLines: SourceLine[] = [
  {
    line: 1,
    parts: [
      { kind: "keyword", text: "import" },
      { kind: "plain", text: " Counter " },
      { kind: "keyword", text: "from" },
      { kind: "string", text: '"./components/Counter.tsx"' },
    ],
  },
  { line: 2, parts: [] },
  {
    line: 3,
    parts: [{ kind: "heading", text: "# Interactive documentation" }],
  },
  { line: 4, parts: [] },
  {
    line: 5,
    active: true,
    parts: [
      { kind: "component", text: "<Counter" },
      { kind: "plain", text: " " },
      { kind: "attr", text: "initial" },
      { kind: "plain", text: "={" },
      { kind: "number", text: "3" },
      { kind: "plain", text: "} />" },
    ],
  },
];

const counterSourceLines: SourceLine[] = [
  {
    line: 1,
    parts: [
      { kind: "keyword", text: "import" },
      { kind: "plain", text: " { useState } " },
      { kind: "keyword", text: "from" },
      { kind: "string", text: '"preact/hooks"' },
    ],
  },
  plainLine(2, ""),
  {
    line: 3,
    active: true,
    parts: [
      { kind: "keyword", text: "export" },
      { kind: "plain", text: " " },
      { kind: "keyword", text: "function" },
      { kind: "plain", text: " " },
      { kind: "fn", text: "Counter" },
      { kind: "plain", text: "({ initial = 0 }: { initial?: number }) {" },
    ],
  },
  {
    line: 4,
    parts: [
      { kind: "plain", text: "  const [count, setCount] = " },
      { kind: "fn", text: "useState" },
      { kind: "plain", text: "(initial);" },
    ],
  },
  plainLine(5, ""),
  plainLine(6, "  return ("),
  {
    line: 7,
    parts: [
      {
        kind: "plain",
        text: '    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>',
      },
    ],
  },
  plainLine(8, "      <button"),
  plainLine(9, '        type="button"'),
  {
    line: 10,
    parts: [{ kind: "plain", text: "        onClick={() => setCount((value) => value - 1)}" }],
  },
  {
    line: 11,
    parts: [
      { kind: "plain", text: '        aria-label="' },
      { kind: "string", text: "Decrease count" },
      { kind: "plain", text: '"' },
    ],
  },
  plainLine(12, "      >"),
  plainLine(13, "        −"),
  plainLine(14, "      </button>"),
  plainLine(15, "      <span>{count}</span>"),
  plainLine(16, "      <button"),
  plainLine(17, '        type="button"'),
  {
    line: 18,
    parts: [{ kind: "plain", text: "        onClick={() => setCount((value) => value + 1)}" }],
  },
  {
    line: 19,
    parts: [
      { kind: "plain", text: '        aria-label="' },
      { kind: "string", text: "Increase count" },
      { kind: "plain", text: '"' },
    ],
  },
  plainLine(20, "      >"),
  plainLine(21, "        +"),
  plainLine(22, "      </button>"),
  plainLine(23, "    </div>"),
  plainLine(24, "  );"),
  plainLine(25, "}"),
  plainLine(26, ""),
  {
    line: 27,
    parts: [
      { kind: "keyword", text: "export" },
      { kind: "plain", text: " default " },
      { kind: "fn", text: "Counter" },
      { kind: "plain", text: ";" },
    ],
  },
];

function EditorToken({ kind, text }: { kind: TokenKind; text: string }) {
  return <span class={`pp-mkt-editor-token pp-mkt-editor-token-${kind}`}>{text}</span>;
}

function SourceCodeBlock({ lines, panelClass }: { lines: SourceLine[]; panelClass: string }) {
  return (
    <pre class={`pp-mkt-editor-panel ${panelClass}`}>
      <code>
        {lines.map((sourceLine) => (
          <span
            class={`pp-mkt-editor-line${sourceLine.active ? " pp-mkt-editor-line-active" : ""}`}
            key={sourceLine.line}
          >
            <span class="pp-mkt-editor-gutter" aria-hidden="true">
              {sourceLine.line}
            </span>
            <span class="pp-mkt-editor-content">
              {sourceLine.parts.map((part, index) => (
                <EditorToken
                  kind={part.kind}
                  key={`${sourceLine.line}-${index}`}
                  text={part.text}
                />
              ))}
              {sourceLine.active ? <span class="pp-mkt-editor-cursor" aria-hidden="true" /> : null}
            </span>
          </span>
        ))}
      </code>
    </pre>
  );
}

export default function MdxDemo() {
  return (
    <section
      class="pp-mkt-section pp-mkt-demo"
      id="interactive-demo"
      aria-labelledby="interactive-demo-title"
    >
      <div class="pp-mkt-section-heading">
        <p class="pp-mkt-eyebrow">Interactive demo</p>
        <h2 id="interactive-demo-title">A small MDX example</h2>
        <p>
          Author mostly in Markdown, then drop in Preact components exactly where the page needs
          interactivity. Use the file tabs above the editor to open the MDX page or the full{" "}
          <code>Counter.tsx</code> source.
        </p>
      </div>
      <div class="pp-mkt-demo-grid">
        <div class="pp-mkt-demo-code">
          <div class="pp-mkt-code-card pp-mkt-code-card-editor pp-mkt-demo-editor">
            <input
              checked
              class="pp-mkt-editor-tab-input"
              id={MDX_TAB_ID}
              name={DEMO_FILE_GROUP}
              type="radio"
            />
            <input
              class="pp-mkt-editor-tab-input"
              id={COUNTER_TAB_ID}
              name={DEMO_FILE_GROUP}
              type="radio"
            />
            <div class="pp-mkt-code-topbar pp-mkt-code-topbar-tabs">
              <span aria-hidden="true" />
              <span aria-hidden="true" />
              <span aria-hidden="true" />
              <div class="pp-mkt-editor-tablist" role="tablist" aria-label="Demo source files">
                <label class="pp-mkt-editor-tab" for={MDX_TAB_ID} role="tab">
                  interactive.mdx
                </label>
                <label class="pp-mkt-editor-tab" for={COUNTER_TAB_ID} role="tab">
                  Counter.tsx
                </label>
              </div>
            </div>
            <SourceCodeBlock lines={mdxSourceLines} panelClass="pp-mkt-editor-panel-mdx" />
            <SourceCodeBlock lines={counterSourceLines} panelClass="pp-mkt-editor-panel-counter" />
          </div>
        </div>
        <div class="pp-mkt-demo-result" aria-label="Rendered MDX result">
          <article>
            <p class="pp-mkt-demo-label">Rendered result</p>
            <h3>Interactive documentation</h3>
            <Counter initial={3} />
            <p class="pp-mkt-demo-source-hint">
              <label class="pp-mkt-demo-source-link" for={COUNTER_TAB_ID}>
                View Counter.tsx source
              </label>
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
