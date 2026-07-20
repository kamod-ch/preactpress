/** @jsx h */
import { h } from "preact";

export type Param = {
  name: string;
  type: string;
  required?: boolean;
  description: string;
  default?: string;
};

export default function ParameterTable({ params }: { params: Param[] }) {
  return (
    <div class="pp-api-table-wrap">
      <table class="pp-api-table">
        <thead>
          <tr>
            <th scope="col">Parameter</th>
            <th scope="col">Type</th>
            <th scope="col">Description</th>
          </tr>
        </thead>
        <tbody>
          {params.map((p) => (
            <tr key={p.name}>
              <td>
                <code>{p.name}</code>
                {p.required ? " *" : ""}
              </td>
              <td>
                <code>{p.type}</code>
              </td>
              <td>
                {p.description}
                {p.default ? (
                  <>
                    {" "}
                    Default: <code>{p.default}</code>.
                  </>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
