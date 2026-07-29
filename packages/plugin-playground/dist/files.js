const DEFAULT_ENTRY = "/App.tsx";
const DEFAULT_SINGLE_FILE = "/App.tsx";
/** Normalize `code` / `files` props into a consistent virtual file tree. */
export function resolvePlaygroundFiles(props) {
  const files = props.files
    ? normalizeFileKeys(props.files)
    : { [DEFAULT_SINGLE_FILE]: props.code ?? defaultCounterExample() };
  if (Object.keys(files).length === 0) {
    files[DEFAULT_SINGLE_FILE] = defaultCounterExample();
  }
  const entry = resolveEntryPath(files, props.entry);
  return {
    files,
    entry,
    dependencies: {},
  };
}
/** Merge user dependencies with defaults required for Preact TSX examples. */
export function mergeDependencies(user, defaults = {}) {
  return {
    ...defaults,
    ...(user ?? {}),
  };
}
function normalizeFileKeys(files) {
  const normalized = {};
  for (const [path, source] of Object.entries(files)) {
    const key = path.startsWith("/") ? path : `/${path}`;
    normalized[key] = source;
  }
  return normalized;
}
function resolveEntryPath(files, entry) {
  if (entry) {
    const key = entry.startsWith("/") ? entry : `/${entry}`;
    if (files[key]) return key;
  }
  if (files[DEFAULT_ENTRY]) return DEFAULT_ENTRY;
  const tsx = Object.keys(files).find((path) => path.endsWith(".tsx"));
  if (tsx) return tsx;
  return Object.keys(files)[0] ?? DEFAULT_ENTRY;
}
function defaultCounterExample() {
  return `import { useState } from "preact/hooks";

export default function Demo() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
`;
}
/** Serialize files for SSR fallback and copy actions. */
export function serializeFilesForDisplay(files, entry) {
  const paths = Object.keys(files).sort((a, b) => {
    if (a === entry) return -1;
    if (b === entry) return 1;
    return a.localeCompare(b);
  });
  if (paths.length === 1) return files[paths[0] ?? ""] ?? "";
  return paths.map((path) => `// ${path}\n${files[path] ?? ""}`.trim()).join("\n\n");
}
//# sourceMappingURL=files.js.map
