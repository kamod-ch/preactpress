/** @jsx h */
import { h } from "preact";

export default function TypeDefinition({ name, code }: { name: string; code: string }) {
  return (
    <figure class="pp-api-type">
      <figcaption>
        <code>{name}</code>
      </figcaption>
      <pre>
        <code>{code}</code>
      </pre>
    </figure>
  );
}
