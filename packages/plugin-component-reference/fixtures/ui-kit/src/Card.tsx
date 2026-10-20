import type { ComponentChildren, FunctionComponent, HTMLAttributes } from "preact";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** Card title */
  title?: string;
  children?: ComponentChildren;
};

/** Card container typed through a callable variable annotation. */
export const Card: FunctionComponent<CardProps> = ({ title, children, ...rest }) => {
  return (
    <div class="ui-card" {...rest}>
      {title ? <h4 class="ui-card-title">{title}</h4> : null}
      {children}
    </div>
  );
};
