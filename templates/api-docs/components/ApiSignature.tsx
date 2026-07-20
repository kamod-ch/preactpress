/** @jsx h */
import { h } from "preact";

type Props = { name: string; signature: string; deprecated?: boolean };

export default function ApiSignature({ name, signature, deprecated }: Props) {
  return (
    <div class={`pp-api-signature${deprecated ? " pp-api-signature--deprecated" : ""}`}>
      {deprecated ? <p class="pp-api-badge">Deprecated</p> : null}
      <code class="pp-api-name">{name}</code>
      <pre class="pp-api-sig">
        <code>{signature}</code>
      </pre>
    </div>
  );
}
