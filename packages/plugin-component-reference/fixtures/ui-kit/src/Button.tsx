import type { ComponentChildren, JSX } from "preact";

export type ButtonVariant = "default" | "outline" | "destructive" | "ghost" | "link";
export type ButtonSize = "default" | "sm" | "lg" | "icon";

type CommonProps = {
  /** Visual style of the button */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Render child element instead of a native button */
  asChild?: boolean;
  /** Button label content */
  children?: ComponentChildren;
  class?: string;
};

type ButtonAsButton = CommonProps &
  JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonAsAnchor = CommonProps &
  JSX.AnchorHTMLAttributes<HTMLAnchorElement> & {
    /** When set, renders an anchor element */
    href: string;
  };

/** Primary action button with link and button modes. */
export type ButtonProps = ButtonAsButton | ButtonAsAnchor;

/** @example <Button variant="outline">Save</Button> */
export const Button = ({
  variant = "default",
  size = "default",
  asChild = false,
  class: className,
  children,
  ...rest
}: ButtonProps) => {
  const classes = `ui-button ui-button-${variant} ui-button-${size}${className ? ` ${className}` : ""}`;
  if ("href" in rest && rest.href) {
    const { href, ...anchorRest } = rest as ButtonAsAnchor;
    return (
      <a href={href} class={classes} {...anchorRest}>
        {children}
      </a>
    );
  }
  const buttonRest = rest as JSX.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type="button" class={classes} {...buttonRest}>
      {children}
    </button>
  );
};
