import type { FunctionalComponent } from "preact";

interface StatusCode {
  status: string | number;
  description: string;
}

interface StatusCodeTableProps {
  statuses: StatusCode[];
}

const StatusCodeTable: FunctionalComponent<StatusCodeTableProps> = ({ statuses }) => (
  <div class="pp-api-table-wrap">
    <table class="pp-api-table">
      <thead>
        <tr>
          <th>Status</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {statuses.map((row) => (
          <tr key={String(row.status)}>
            <td>
              <code>{row.status}</code>
            </td>
            <td>{row.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default StatusCodeTable;
