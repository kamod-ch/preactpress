/** @jsx h */
import { h } from "preact";

export default function InstallPanel() {
  return (
    <div class="sdk-install">
      <p>Install the typed client and send the first request in a few minutes.</p>
      <pre>
        <code>npm install @acme/sdk</code>
      </pre>
    </div>
  );
}
