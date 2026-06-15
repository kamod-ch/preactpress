/** @jsx h */
import { h } from "preact";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";

async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export default function CopyableCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<number | undefined>(undefined);

  const copy = useCallback(async () => {
    try {
      await copyText(command);
      setCopied(true);
      window.clearTimeout(resetTimer.current);
      resetTimer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [command]);

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  return (
    <div class="pp-mkt-copyable">
      <code class="pp-mkt-copyable-code">{command}</code>
      <button
        type="button"
        class={`pp-mkt-copy-btn${copied ? " pp-mkt-copy-btn-copied" : ""}`}
        onClick={copy}
        aria-label={copied ? "Command copied" : "Copy command"}
        title={copied ? "Copied" : "Copy command"}
      >
        {copied ? (
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path
              d="M20 6 9 17l-5-5"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <rect
              x="9"
              y="9"
              width="11"
              height="11"
              rx="2"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            />
            <path
              d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            />
          </svg>
        )}
        <span class="pp-mkt-copy-btn-label">{copied ? "Copied" : "Copy"}</span>
      </button>
    </div>
  );
}
