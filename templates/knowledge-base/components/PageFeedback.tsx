/** @jsx h */
import { h } from "preact";
import { useState } from "preact/hooks";

export default function PageFeedback() {
  const [submitted, setSubmitted] = useState(false);
  if (submitted) {
    return (
      <p class="pp-feedback-thanks" role="status">
        Thanks — we use your feedback to improve these articles.
      </p>
    );
  }
  return (
    <div class="pp-feedback" role="group" aria-label="Was this article helpful?">
      <p>Was this article helpful?</p>
      <div class="pp-feedback-actions">
        <button type="button" onClick={() => setSubmitted(true)}>
          Yes
        </button>
        <button type="button" onClick={() => setSubmitted(true)}>
          No
        </button>
      </div>
      <p class="pp-feedback-cta">
        Still stuck? <a href="/contact">Contact support</a>.
      </p>
    </div>
  );
}
