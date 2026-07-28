import type { ComponentChildren, JSX } from "preact";

/** Root dialog container. */
export type DialogProps = JSX.HTMLAttributes<HTMLDivElement> & {
  /** Whether the dialog is open */
  open?: boolean;
  children?: ComponentChildren;
};

/** @example <Dialog open><DialogContent>Hello</DialogContent></Dialog> */
export const Dialog = ({ open = false, children, ...rest }: DialogProps) => {
  if (!open) return null;
  return (
    <div class="ui-dialog" role="dialog" aria-modal="true" {...rest}>
      {children}
    </div>
  );
};

export type DialogContentProps = JSX.HTMLAttributes<HTMLDivElement> & {
  /** Presentation style */
  presentation?: "default" | "sheet";
  children?: ComponentChildren;
};

/** Dialog panel content. */
export const DialogContent = ({
  presentation = "default",
  children,
  ...rest
}: DialogContentProps) => {
  return (
    <div class={`ui-dialog-content ui-dialog-content-${presentation}`} {...rest}>
      {children}
    </div>
  );
};

export type DialogTriggerProps = JSX.HTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  children?: ComponentChildren;
};

/** Opens the surrounding dialog. */
export const DialogTrigger = ({ asChild = false, children, ...rest }: DialogTriggerProps) => {
  return (
    <button type="button" class="ui-dialog-trigger" {...rest}>
      {children}
    </button>
  );
};
