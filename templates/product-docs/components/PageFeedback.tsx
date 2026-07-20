/** @jsx h */
import { h } from "preact";
import { useState } from "preact/hooks";

export default function PageFeedback() {
  const [submitted, setSubmitted] = useState(false);
  if (submitted) {
    return (
      <p class="pp-feedback-thanks" role="status">
        Thanks for your feedback.
      </p>
    );
  }
  return (
    <div class="pp-feedback" role="group" aria-label="Page feedback">
      <p>Was this page helpful?</p>
      <div class="pp-feedback-actions">
        <button type="button" onClick={() => setSubmitted(true)}>
          Yes
        </button>
        <button type="button" onClick={() => setSubmitted(true)}>
          No
        </button>
      </div>
    </div>
  );
}
