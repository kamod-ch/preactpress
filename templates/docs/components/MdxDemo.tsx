/** @jsx h */
import { h } from "preact";
import { Counter } from "./Counter.tsx";

const sourceLines = [
  {
    line: 1,
    parts: [
      { kind: "keyword", text: "import" },
      { kind: "plain", text: " { Counter } " },
      { kind: "keyword", text: "from" },
      { kind: "string", text: "'./components/Counter'" },
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
    parts: [{ kind: "component", text: "<Counter />" }],
    active: true,
  },
];

function EditorToken({ kind, text }: { kind: string; text: string }) {
  return <span class={`pp-mkt-editor-token pp-mkt-editor-token-${kind}`}>{text}</span>;
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
          interactivity.
        </p>
      </div>
      <div class="pp-mkt-demo-grid">
        <div class="pp-mkt-demo-code">
          <div class="pp-mkt-code-card pp-mkt-code-card-editor">
            <div class="pp-mkt-code-topbar" aria-hidden="true">
              <span />
              <span />
              <span />
              <span class="pp-mkt-editor-title">
                <span class="pp-mkt-editor-tab">pages/interactive.mdx</span>
              </span>
            </div>
            <pre>
              <code>
                {sourceLines.map((sourceLine) => (
                  <span
                    class={`pp-mkt-editor-line${sourceLine.active ? " pp-mkt-editor-line-active" : ""}`}
                    key={sourceLine.line}
                  >
                    <span class="pp-mkt-editor-gutter" aria-hidden="true">
                      {sourceLine.line}
                    </span>
                    <span class="pp-mkt-editor-content">
                      {sourceLine.parts.map((part) => (
                        <EditorToken
                          kind={part.kind}
                          key={`${sourceLine.line}-${part.text}`}
                          text={part.text}
                        />
                      ))}
                      {sourceLine.active ? (
                        <span class="pp-mkt-editor-cursor" aria-hidden="true" />
                      ) : null}
                    </span>
                  </span>
                ))}
              </code>
            </pre>
          </div>
        </div>
        <div class="pp-mkt-demo-result" aria-label="Rendered MDX result">
          <article>
            <p class="pp-mkt-demo-label">Rendered result</p>
            <h3>Interactive documentation</h3>
            <Counter />
          </article>
        </div>
      </div>
    </section>
  );
}
