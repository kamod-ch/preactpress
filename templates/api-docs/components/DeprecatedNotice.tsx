/** @jsx h */
import { h } from "preact";

export default function DeprecatedNotice({
  since,
  alternative,
}: {
  since: string;
  alternative?: string;
}) {
  return (
    <p class="pp-api-deprecated" role="note">
      <strong>Deprecated</strong> since {since}.
      {alternative ? (
        <>
          {" "}
          Use <code>{alternative}</code> instead.
        </>
      ) : null}
    </p>
  );
}
