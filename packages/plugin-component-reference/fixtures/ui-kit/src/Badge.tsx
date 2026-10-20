import type { HTMLAttributes } from "preact";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  /** Badge tone */
  tone?: "default" | "success" | "warning";
};

/** Status badge rendered as a named function declaration. */
export function Badge({ tone = "default", children, ...rest }: BadgeProps) {
  return (
    <span class={`ui-badge ui-badge-${tone}`} {...rest}>
      {children}
    </span>
  );
}
