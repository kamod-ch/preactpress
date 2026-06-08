import type { FunctionalComponent } from 'preact'

interface CodeSnippetProps {
  code: string
}

function tokenClass(line: string): string {
  const trimmed = line.trim()
  if (!trimmed) return 'empty'
  if (
    trimmed.startsWith('import ') ||
    trimmed.startsWith('export ') ||
    trimmed.startsWith('const ') ||
    trimmed.startsWith('return ')
  ) {
    return 'keyword'
  }
  if (trimmed.includes("'.") || trimmed.includes("'") || trimmed.includes('"')) return 'string'
  return 'plain'
}

const CodeSnippet: FunctionalComponent<CodeSnippetProps> = ({ code }) => (
  <div class="hn-code-card" aria-label="Example code">
    <div class="hn-code-topbar" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
    <pre>
      <code>
        {code.split('\n').map((line, index) => (
          <span class={`hn-code-line hn-code-${tokenClass(line)}`} key={`${index}:${line}`}>
            {line || ' '}
          </span>
        ))}
      </code>
    </pre>
  </div>
)

export default CodeSnippet
