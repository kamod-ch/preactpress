import type { FunctionalComponent } from "preact";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

interface HttpMethodBadgeProps {
  method: HttpMethod | string;
}

const METHOD_CLASS: Record<string, string> = {
  GET: "pp-http-get",
  POST: "pp-http-post",
  PUT: "pp-http-put",
  PATCH: "pp-http-patch",
  DELETE: "pp-http-delete",
  HEAD: "pp-http-head",
  OPTIONS: "pp-http-options",
};

const HttpMethodBadge: FunctionalComponent<HttpMethodBadgeProps> = ({ method }) => {
  const normalized = method.toUpperCase();
  const className = METHOD_CLASS[normalized] ?? "pp-http-default";
  return <span class={`pp-http-badge ${className}`}>{normalized}</span>;
};

export default HttpMethodBadge;
