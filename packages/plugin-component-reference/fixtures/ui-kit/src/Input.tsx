import type { JSX } from "preact";

/** Text field props extending native input attributes. */
export type InputProps = JSX.HTMLAttributes<HTMLInputElement> & {
  /** Input label used for accessibility */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Marks the field as invalid */
  invalid?: boolean;
  /** @default false */
  disabled?: boolean;
};

/** @example <Input label="Email" placeholder="you@example.com" /> */
export const Input = ({
  label,
  placeholder,
  invalid = false,
  disabled = false,
  class: className,
  ...rest
}: InputProps) => {
  return (
    <label class={`ui-input-label${className ? ` ${className}` : ""}`}>
      {label ? <span class="ui-input-label-text">{label}</span> : null}
      <input
        class={`ui-input${invalid ? " ui-input-invalid" : ""}`}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        {...rest}
      />
    </label>
  );
};
