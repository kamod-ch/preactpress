/** @jsx h */
import { h } from "preact";

const commands = [
  { cwd: "~", cmd: "pnpm dlx @kamod-ch/preactpress init my-docs --template docs" },
  { cwd: "~", cmd: "cd my-docs" },
  { cwd: "my-docs", cmd: "pnpm install" },
  { cwd: "my-docs", cmd: "pnpm dev", active: true },
];

export default function CliBlock() {
  return (
    <section class="pp-mkt-cli" aria-label="Start a PreactPress documentation site">
      <div class="pp-mkt-code-card pp-mkt-code-card-terminal">
        <div class="pp-mkt-code-topbar" aria-hidden="true">
          <span />
          <span />
          <span />
          <span class="pp-mkt-terminal-title">Terminal — zsh</span>
        </div>
        <pre>
          <code>
            {commands.map((command) => (
              <span class="pp-mkt-terminal-line" key={command.cmd}>
                <span class="pp-mkt-terminal-prompt" aria-hidden="true">
                  <span class="pp-mkt-terminal-path">{command.cwd}</span>
                  <span class="pp-mkt-terminal-caret">%</span>
                </span>
                <span class="pp-mkt-terminal-cmd">{command.cmd}</span>
                {command.active ? <span class="pp-mkt-terminal-cursor" aria-hidden="true" /> : null}
              </span>
            ))}
          </code>
        </pre>
      </div>
    </section>
  );
}
