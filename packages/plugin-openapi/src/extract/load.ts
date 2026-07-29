import fs from "node:fs/promises";
import path from "node:path";

/** Local file path or explicitly configured remote URL. */
export type OpenApiInput =
  | string
  | {
      url: string;
      headers?: Record<string, string>;
    };

export interface LoadedSpec {
  source: string;
  raw: string;
  format: "json" | "yaml";
}

function detectFormat(source: string, raw: string): "json" | "yaml" {
  const ext = path.extname(source).toLowerCase();
  if (ext === ".json") return "json";
  if (ext === ".yaml" || ext === ".yml") return "yaml";
  const trimmed = raw.trimStart();
  if (trimmed.startsWith("{")) return "json";
  return "yaml";
}

function isRemoteInput(
  input: OpenApiInput,
): input is { url: string; headers?: Record<string, string> } {
  return typeof input === "object" && "url" in input;
}

export async function loadSpec(root: string, input: OpenApiInput): Promise<LoadedSpec> {
  if (isRemoteInput(input)) {
    const response = await fetch(input.url, {
      headers: input.headers,
    });
    if (!response.ok) {
      throw new Error(
        `openapiPlugin: failed to fetch ${input.url} (${response.status} ${response.statusText})`,
      );
    }
    const raw = await response.text();
    return {
      source: input.url,
      raw,
      format: detectFormat(input.url, raw),
    };
  }

  const abs = path.resolve(root, input);
  const raw = await fs.readFile(abs, "utf8");
  return {
    source: path.relative(root, abs) || input,
    raw,
    format: detectFormat(abs, raw),
  };
}

export async function computeInputHash(root: string, input: OpenApiInput): Promise<string> {
  if (isRemoteInput(input)) {
    return `remote:${input.url}:${JSON.stringify(input.headers ?? {})}`;
  }
  const abs = path.resolve(root, input);
  const stat = await fs.stat(abs);
  return `file:${abs}:${stat.mtimeMs}:${stat.size}`;
}
