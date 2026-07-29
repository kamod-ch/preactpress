import type { FunctionalComponent } from "preact";
import HttpMethodBadge from "./HttpMethodBadge.tsx";

interface EndpointLineProps {
  method: string;
  path: string;
}

const EndpointLine: FunctionalComponent<EndpointLineProps> = ({ method, path }) => (
  <div class="pp-endpoint-line" role="group" aria-label={`${method} ${path}`}>
    <HttpMethodBadge method={method} />
    <code class="pp-endpoint-path">{path}</code>
  </div>
);

export default EndpointLine;
