function jsonExample(value) {
  if (value === undefined) return "{}";
  return JSON.stringify(value, null, 2);
}
function samplePath(path, operation) {
  return path.replace(/\{([^}]+)\}/g, (_, name) => {
    const param = operation.parameters.find((entry) => entry.name === name && entry.in === "path");
    if (param?.example !== undefined) return String(param.example);
    return name.toLowerCase().includes("id") ? "123" : "example";
  });
}
function sampleQuery(operation) {
  const query = operation.parameters.filter((param) => param.in === "query");
  if (!query.length) return "";
  const parts = query.map((param) => {
    const value = param.example !== undefined ? String(param.example) : "example";
    return `${encodeURIComponent(param.name)}=${encodeURIComponent(value)}`;
  });
  return `?${parts.join("&")}`;
}
function serverUrl(manifest) {
  return manifest.servers[0]?.url?.replace(/\/$/, "") ?? "https://api.example.com";
}
export function renderCurlExample(manifest, operation) {
  const url = `${serverUrl(manifest)}${samplePath(operation.path, operation)}${sampleQuery(operation)}`;
  const headers = operation.parameters
    .filter((param) => param.in === "header")
    .map((param) => `-H "${param.name}: ${param.example ?? "value"}"`);
  if (operation.security.length) {
    const scheme = manifest.securitySchemes[operation.security[0]];
    if (scheme?.type === "http" && scheme.scheme === "bearer") {
      headers.push('-H "Authorization: Bearer YOUR_TOKEN"');
    } else if (scheme?.type === "apiKey" && scheme.name) {
      headers.push(`-H "${scheme.name}: YOUR_API_KEY"`);
    }
  }
  const body =
    operation.requestBody?.example !== undefined
      ? `\n  -d '${JSON.stringify(operation.requestBody.example)}' \\\n  -H "Content-Type: ${operation.requestBody.contentType}"`
      : operation.requestBody
        ? `\n  -H "Content-Type: ${operation.requestBody.contentType}"`
        : "";
  return [
    `curl -X ${operation.method.toUpperCase()} "${url}" \\`,
    ...headers.map((line) => `  ${line} \\`),
    body,
  ]
    .filter(Boolean)
    .join("\n")
    .replace(/ \\$/, "");
}
export function renderJavaScriptExample(manifest, operation) {
  const url = `${serverUrl(manifest)}${samplePath(operation.path, operation)}${sampleQuery(operation)}`;
  const headers = {};
  for (const param of operation.parameters.filter((entry) => entry.in === "header")) {
    headers[param.name] = String(param.example ?? "value");
  }
  if (operation.security.length) {
    const scheme = manifest.securitySchemes[operation.security[0]];
    if (scheme?.type === "http" && scheme.scheme === "bearer") {
      headers.Authorization = "Bearer YOUR_TOKEN";
    } else if (scheme?.type === "apiKey" && scheme.name) {
      headers[scheme.name] = "YOUR_API_KEY";
    }
  }
  const headerLines = Object.entries(headers)
    .map(([key, value]) => `    "${key}": "${value}",`)
    .join("\n");
  const bodyBlock =
    operation.requestBody?.example !== undefined
      ? `\n  body: JSON.stringify(${jsonExample(operation.requestBody.example)}),`
      : "";
  return [
    `const response = await fetch("${url}", {`,
    `  method: "${operation.method.toUpperCase()}",`,
    "  headers: {",
    headerLines || '    "Accept": "application/json",',
    "  },",
    bodyBlock,
    "});",
    "",
    "const data = await response.json();",
    "console.log(data);",
  ]
    .filter(Boolean)
    .join("\n");
}
export function renderTypeScriptExample(manifest, operation) {
  const js = renderJavaScriptExample(manifest, operation);
  return `${js}\n\n// Tip: import generated types from your OpenAPI client SDK.`;
}
export function schemaExample(schema) {
  if (schema.example !== undefined) return schema.example;
  const output = {};
  for (const property of schema.properties) {
    if (property.example !== undefined) {
      output[property.name] = property.example;
      continue;
    }
    if (property.enum?.length) {
      output[property.name] = property.enum[0];
      continue;
    }
    switch (property.type.split(":")[0]) {
      case "integer":
      case "number":
        output[property.name] = 0;
        break;
      case "boolean":
        output[property.name] = false;
        break;
      case "array":
        output[property.name] = [];
        break;
      case "object":
        output[property.name] = {};
        break;
      default:
        output[property.name] = "string";
    }
  }
  return output;
}
export function jsonBlock(value) {
  return `\`\`\`json\n${jsonExample(value)}\n\`\`\``;
}
//# sourceMappingURL=examples.js.map
