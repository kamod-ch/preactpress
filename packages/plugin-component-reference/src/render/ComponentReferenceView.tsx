import type { ComponentEntry, ComponentProp } from "../types/index.js";

function propAnchor(name: string): string {
  return `prop-${name.replace(/[^a-zA-Z0-9_-]+/g, "-").toLowerCase()}`;
}

function PropRow({ prop }: { prop: ComponentProp }) {
  return (
    <tr id={propAnchor(prop.name)}>
      <td>
        <code>{prop.name}</code>
      </td>
      <td>
        <code>{prop.type}</code>
      </td>
      <td>
        <code>{prop.defaultValue ?? "—"}</code>
      </td>
      <td>{prop.required ? "Yes" : "No"}</td>
      <td>
        {prop.description}
        {prop.deprecated ? (
          <>
            {" "}
            <strong>Deprecated:</strong> {prop.deprecated}
          </>
        ) : null}
        {prop.inheritedFrom ? (
          <>
            {" "}
            <em>
              From <code>{prop.inheritedFrom}</code>
            </em>
          </>
        ) : null}
      </td>
    </tr>
  );
}

export function PropsTable({ entry }: { entry: ComponentEntry }) {
  return (
    <div class="pp-table-wrap">
      <table class="pp-component-props">
        <thead>
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>Default</th>
            <th>Required</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {entry.props.map((prop) => (
            <PropRow key={prop.name} prop={prop} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ComponentReferenceView({ entry }: { entry: ComponentEntry }) {
  return (
    <section class="pp-component-reference" aria-labelledby={`component-${entry.name}`}>
      <h3 id={`component-${entry.name}`}>{entry.name}</h3>
      {entry.description ? <p class="pp-component-description">{entry.description}</p> : null}
      {entry.source ? (
        <p class="pp-component-source">
          {entry.source.url ? (
            <a href={entry.source.url}>View source</a>
          ) : (
            "Source:"
          )}{" "}
          <code>
            {entry.source.file}:{entry.source.line}
          </code>
        </p>
      ) : null}
      <PropsTable entry={entry} />
      {entry.examples?.map((example, index) => (
        <div key={index}>
          <h4 class="pp-component-example-title">Example {index + 1}</h4>
          <pre class="pp-component-example">
            <code>{example}</code>
          </pre>
        </div>
      ))}
    </section>
  );
}
