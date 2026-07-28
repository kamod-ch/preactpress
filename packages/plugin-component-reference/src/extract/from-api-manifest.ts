import type { ApiManifest, ApiSymbol } from "@preactpress/plugin-typedoc/types";
import type { ComponentEntry, ComponentManifest, ComponentProp } from "../types/index.js";

function propsFromInterfaceSymbol(symbol: ApiSymbol, manifest: ApiManifest): ComponentProp[] {
  const props: ComponentProp[] = [];
  for (const memberId of symbol.members ?? []) {
    const member = manifest.symbols[memberId];
    if (!member || member.kind !== "property") continue;
    props.push({
      name: member.name,
      type: member.type?.text ?? "unknown",
      required: !member.flags?.isOptional,
      defaultValue: undefined,
      description: member.description,
      deprecated: member.deprecated,
    });
  }
  return props.sort((a, b) => a.name.localeCompare(b.name));
}

function componentFromSymbol(symbol: ApiSymbol, manifest: ApiManifest): ComponentEntry | undefined {
  const propsInterface = Object.values(manifest.symbols).find(
    (entry) =>
      entry.name === `${symbol.name}Props` ||
      (entry.kind === "interface" && entry.name.endsWith("Props") && entry.name.includes(symbol.name)),
  );

  const signatureParams = symbol.signatures?.[0]?.parameters ?? [];
  const props: ComponentProp[] = propsInterface
    ? propsFromInterfaceSymbol(propsInterface, manifest)
    : signatureParams.map((param) => ({
        name: param.name,
        type: param.type.text,
        required: !param.optional,
        defaultValue: param.defaultValue,
        description: param.description,
      }));

  if (!props.length) return undefined;

  return {
    name: symbol.name,
    exportName: symbol.name,
    description: symbol.description,
    props,
    examples: symbol.examples,
    source: symbol.source,
    tags: ["component", symbol.name, ...(symbol.tags ?? []), ...props.map((prop) => prop.name)],
  };
}

/** Map typedoc ApiManifest symbols tagged as components into ComponentManifest entries. */
export function componentsFromApiManifest(manifest: ApiManifest): Record<string, ComponentEntry> {
  const components: Record<string, ComponentEntry> = {};

  for (const symbol of Object.values(manifest.symbols)) {
    const isComponent =
      symbol.tags?.includes("component") ||
      symbol.kind === "function" ||
      (symbol.kind === "interface" && symbol.name.endsWith("Props"));
    if (!isComponent) continue;
    if (symbol.kind === "interface" && symbol.name.endsWith("Props")) continue;

    const entry = componentFromSymbol(symbol, manifest);
    if (entry) components[entry.name] = entry;
  }

  return components;
}

export function mergeComponentManifests(
  base: ComponentManifest,
  extra: Record<string, ComponentEntry>,
): ComponentManifest {
  return {
    ...base,
    components: { ...base.components, ...extra },
  };
}
