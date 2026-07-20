/** @jsx h */
import { h } from "preact";

export default function CodeExample({
  title,
  lang,
  code,
}: {
  title?: string;
  lang: string;
  code: string;
}) {
  return (
    <figure class="pp-api-example">
      {title ? <figcaption>{title}</figcaption> : null}
      <pre>
        <code class={`language-${lang}`}>{code}</code>
      </pre>
    </figure>
  );
}
