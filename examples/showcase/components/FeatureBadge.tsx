/** @jsx h */
import { h } from "preact";

export interface FeatureBadgeProps {
  label: string;
  status?: "stable" | "beta";
}

export function FeatureBadge({ label, status = "stable" }: FeatureBadgeProps) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "0.15rem 0.5rem",
        borderRadius: "999px",
        fontSize: "0.85rem",
        fontWeight: 600,
        background: status === "stable" ? "var(--pp-brand-soft, #e8f4ff)" : "#fff3cd",
        color: status === "stable" ? "var(--pp-brand, #0066cc)" : "#856404",
      }}
    >
      {label}
    </span>
  );
}
